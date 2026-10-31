/**
 * Sensitive text redaction gate.
 *
 * Adapted from the "Sensitive Text Redaction Gate" project in
 * rohitg00/ai-engineering-from-scratch (MIT License, Copyright (c) 2026
 * Rohit Ghumare). See THIRD_PARTY_NOTICES.md.
 *
 * Changes from the original:
 * - Ported from Python to TypeScript.
 * - Adds a US/North American phone number detector (parents and coaches
 *   paste these into communication requests constantly).
 * - Replaces each value with a numbered placeholder such as [EMAIL_1]
 *   instead of a bare [REDACTED], and returns a map so the original values
 *   can be put back into the model's output with `restore()`. The values
 *   never leave our server, but the finished text is still usable.
 */

export type DetectorKind = "EMAIL" | "PHONE" | "IPV4" | "LITERAL";

export interface Span {
  start: number;
  end: number;
  kind: DetectorKind;
}

export interface MergedSpan {
  start: number;
  end: number;
  kinds: DetectorKind[];
}

export interface RedactionResult {
  /** Text with every sensitive value replaced by a placeholder. */
  text: string;
  /** Placeholder -> original value. Keep server-side; never log it. */
  replacements: Record<string, string>;
  /** Offset receipts (no original values), safe to log. */
  spans: Array<MergedSpan & { placeholder: string }>;
  redactedCharacters: number;
}

const MAX_TEXT = 1_000_000;
const MAX_LITERALS = 100;
const MAX_LITERAL_LENGTH = 256;
const MAX_MATCHES = 10_000;

const EMAIL =
  /(?<![\w.!#$%&'*+/=?^_`{|}~-])[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}(?![\w-]|\.[\w-])/g;
const IPV4 = /(?<![\w.])(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?!\w|\.\w)/g;
// 555-123-4567, (555) 123-4567, 555.123.4567, +1 555 123 4567, 5551234567
const PHONE =
  /(?<![\w+])(?:\+?1[\s.-]?)?(?:\(\d{3}\)\s?|\d{3}[\s.-]?)\d{3}[\s.-]?\d{4}(?!\w)/g;

function isValidIPv4(value: string): boolean {
  return value.split(".").every((octet) => {
    if (octet.length > 1 && octet.startsWith("0")) return false;
    return Number(octet) <= 255;
  });
}

export function detect(text: string, literals: readonly string[] = []): Span[] {
  if (typeof text !== "string" || text.length > MAX_TEXT) {
    throw new Error(`text must be a string of at most ${MAX_TEXT} characters`);
  }
  if (!Array.isArray(literals) || literals.length > MAX_LITERALS) {
    throw new Error(`literals must contain at most ${MAX_LITERALS} strings`);
  }
  if (
    literals.some(
      (value) =>
        typeof value !== "string" || !value || value.length > MAX_LITERAL_LENGTH
    )
  ) {
    throw new Error(`each literal must contain 1 to ${MAX_LITERAL_LENGTH} characters`);
  }

  const found: Span[] = [];
  const add = (start: number, end: number, kind: DetectorKind) => {
    if (found.length >= MAX_MATCHES) {
      throw new Error(`text exceeds the ${MAX_MATCHES}-match limit`);
    }
    found.push({ start, end, kind });
  };

  const patterns: Array<[DetectorKind, RegExp]> = [
    ["EMAIL", EMAIL],
    ["IPV4", IPV4],
    ["PHONE", PHONE],
  ];
  for (const [kind, pattern] of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (kind === "IPV4" && !isValidIPv4(match[0])) continue;
      const start = match.index ?? 0;
      add(start, start + match[0].length, kind);
    }
  }

  for (const literal of [...new Set(literals)].sort()) {
    let offset = 0;
    for (;;) {
      const start = text.indexOf(literal, offset);
      if (start < 0) break;
      add(start, start + literal.length, "LITERAL");
      offset = start + 1;
    }
  }

  return found.sort(
    (a, b) => a.start - b.start || a.end - b.end || a.kind.localeCompare(b.kind)
  );
}

/** Merge overlapping spans so each sensitive region is replaced once. */
export function mergeSpans(spans: Span[], textLength: number): MergedSpan[] {
  const normalized = spans.map((span) => {
    if (!(0 <= span.start && span.start < span.end && span.end <= textLength)) {
      throw new Error("span offsets are outside the text");
    }
    return { start: span.start, end: span.end, kinds: [span.kind] };
  });
  normalized.sort((a, b) => a.start - b.start || a.end - b.end);

  const result: MergedSpan[] = [];
  for (const span of normalized) {
    const last = result[result.length - 1];
    if (last && span.start < last.end) {
      last.end = Math.max(last.end, span.end);
      last.kinds = [...new Set([...last.kinds, ...span.kinds])].sort();
    } else {
      result.push(span);
    }
  }
  return result;
}

/** Pick the label used in a placeholder for a merged span. */
function labelFor(kinds: DetectorKind[]): string {
  if (kinds.length === 1) return kinds[0] === "LITERAL" ? "PRIVATE" : kinds[0];
  return "PRIVATE";
}

export function redact(text: string, literals: readonly string[] = []): RedactionResult {
  const spans = mergeSpans(detect(text, literals), text.length);
  const parts: string[] = [];
  const replacements: Record<string, string> = {};
  const byValue = new Map<string, string>();
  const counters: Record<string, number> = {};
  const receipts: RedactionResult["spans"] = [];
  let cursor = 0;
  let redactedCharacters = 0;

  for (const span of spans) {
    const value = text.slice(span.start, span.end);
    let placeholder = byValue.get(value);
    if (!placeholder) {
      const label = labelFor(span.kinds);
      counters[label] = (counters[label] ?? 0) + 1;
      placeholder = `[${label}_${counters[label]}]`;
      byValue.set(value, placeholder);
      replacements[placeholder] = value;
    }
    parts.push(text.slice(cursor, span.start), placeholder);
    receipts.push({ ...span, placeholder });
    redactedCharacters += span.end - span.start;
    cursor = span.end;
  }
  parts.push(text.slice(cursor));

  return { text: parts.join(""), replacements, spans: receipts, redactedCharacters };
}

/** Put the original values back into text produced from redacted input. */
export function restore(text: string, replacements: Record<string, string>): string {
  const placeholders = Object.keys(replacements);
  if (placeholders.length === 0) return text;
  const escaped = placeholders.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return text.replace(new RegExp(escaped.join("|"), "g"), (p) => replacements[p]);
}

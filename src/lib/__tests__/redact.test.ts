// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { detect, mergeSpans, redact, restore } from "../redact.ts";

test("redacts emails and phone numbers with numbered placeholders", () => {
  const input =
    "Questions? Email coach.smith@lincolnhs.org or call (555) 123-4567. " +
    "Treasurer: jane+boosters@gmail.com, 555.987.6543.";
  const out = redact(input);
  assert.equal(
    out.text,
    "Questions? Email [EMAIL_1] or call [PHONE_1]. Treasurer: [EMAIL_2], [PHONE_2]."
  );
  assert.equal(out.replacements["[EMAIL_1]"], "coach.smith@lincolnhs.org");
  assert.equal(out.replacements["[PHONE_2]"], "555.987.6543");
});

test("restore puts the original values back", () => {
  const input = "RSVP to mom@example.com by Friday.";
  const out = redact(input);
  const modelOutput = "📣 Spaghetti dinner! RSVP: [EMAIL_1]. Questions: [EMAIL_1]";
  assert.equal(
    restore(modelOutput, out.replacements),
    "📣 Spaghetti dinner! RSVP: mom@example.com. Questions: mom@example.com"
  );
  assert.equal(restore(input, out.replacements), input);
});

test("repeated values reuse one placeholder", () => {
  const out = redact("a@b.co then a@b.co");
  assert.equal(out.text, "[EMAIL_1] then [EMAIL_1]");
});

test("only valid IPv4 addresses are flagged", () => {
  assert.deepEqual(
    detect("ok 10.0.0.1 bad 999.1.1.1").map((s) => s.kind),
    ["IPV4"]
  );
});

test("leaves scores, dates and dollar amounts alone", () => {
  const input = "We won 21-14 on 10/31/2026 and raised $1,250.00 toward our $5000 goal.";
  assert.equal(redact(input).text, input);
});

test("literals are redacted and overlapping spans merge", () => {
  const out = redact("Player Jordan Lee, jordan@x.com", ["Jordan Lee", "Lee, jordan"]);
  assert.equal(out.text, "Player [PRIVATE_1]");
  assert.deepEqual(mergeSpans([{ start: 0, end: 3, kind: "EMAIL" }, { start: 2, end: 5, kind: "LITERAL" }], 5),
    [{ start: 0, end: 5, kinds: ["EMAIL", "LITERAL"] }]);
});

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { BOOST_SYSTEM_PROMPT, TOOL_PROMPTS, type ToolType } from "@/lib/boost-prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, tool, sport, teamName, tone } = await req.json();

    if (!prompt || !tool) {
      return NextResponse.json(
        { error: "Missing required fields: prompt and tool" },
        { status: 400 }
      );
    }

    const toolSystemAddition = TOOL_PROMPTS[tool as ToolType] || "";
    const systemPrompt = `${BOOST_SYSTEM_PROMPT}\n\n${toolSystemAddition}`;

    const contextParts: string[] = [];
    if (teamName) contextParts.push(`Team/Organization: ${teamName}`);
    if (sport) contextParts.push(`Sport: ${sport}`);
    if (tone) contextParts.push(`Tone: ${tone}`);

    const fullPrompt = contextParts.length > 0
      ? `${contextParts.join(" | ")}\n\n${prompt}`
      : prompt;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    return NextResponse.json({ result: content.text });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate content. Please try again." },
      { status: 500 }
    );
  }
}

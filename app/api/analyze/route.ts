import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { ANALYSIS_SYSTEM_PROMPT, WeatherResult } from "@/lib/weather";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    if (text.trim().length > 5000) {
      return NextResponse.json(
        { error: "Text exceeds 5000 character limit." },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: text.trim() }],
    });

    const raw = message.content[0];
    if (raw.type !== "text") {
      throw new Error("Unexpected response type from Claude.");
    }

    let result: WeatherResult;
    try {
      result = JSON.parse(raw.text);
    } catch {
      throw new Error("Failed to parse Claude response as JSON.");
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyze] error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

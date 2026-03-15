import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { FOLLOWUP_SYSTEM_PROMPT, WeatherResult } from "@/lib/weather";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { originalText, analysis, reflection, round, round1Response } =
      await req.json() as {
        originalText: string;
        analysis: WeatherResult;
        reflection: string;
        round: number;
        round1Response?: string;
      };

    if (!reflection || typeof reflection !== "string" || reflection.trim().length === 0) {
      return NextResponse.json({ error: "No reflection provided." }, { status: 400 });
    }

    const weatherSummary = `Condition: ${analysis.condition}
Dominant state: ${analysis.dominantState}${analysis.secondaryState ? `\nSecondary state: ${analysis.secondaryState}` : ""}
Intensity: ${analysis.intensity}
Signals detected: ${analysis.signals.join(", ")}
Terrain: ${analysis.terrain}`;

    const round1Context = round === 2 && round1Response
      ? `\n\nROUND 1 RESPONSE:\n${round1Response}\n\nROUND 2 REFLECTION:\n"${reflection}"`
      : `\n\nWHAT LANDED FOR THEM:\n"${reflection}"`;

    const userMessage = `ORIGINAL TEXT:
"${originalText}"

WEATHER REPORT:
${weatherSummary}${round1Context}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: FOLLOWUP_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = message.content[0];
    if (raw.type !== "text") {
      throw new Error("Unexpected response type from Claude.");
    }

    return NextResponse.json({ response: raw.text });
  } catch (err) {
    console.error("[followup] error:", err);
    return NextResponse.json(
      { error: "Follow-up failed. Please try again." },
      { status: 500 }
    );
  }
}

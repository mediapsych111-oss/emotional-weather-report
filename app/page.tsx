"use client";

import { useState } from "react";
import { WeatherResult } from "@/lib/weather";

const PLACEHOLDER = `Paste a journal entry, morning reflection, or anything personal here.

Example: "Woke up already thinking about the presentation. Not nervous exactly — more like a low hum of dread I can't quite locate. I kept checking my phone before I even got out of bed. I know what I need to do but I can't seem to start any of it."`;

const CHAR_LIMIT = 5000;

const INTENSITY_COLORS: Record<string, string> = {
  Mild: "text-emerald-400",
  Moderate: "text-yellow-400",
  Elevated: "text-orange-400",
  High: "text-red-400",
};

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reflection, setReflection] = useState("");
  const [followupResult, setFollowupResult] = useState<string | null>(null);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupError, setFollowupError] = useState<string | null>(null);

  const [showRound2, setShowRound2] = useState(false);
  const [reflection2, setReflection2] = useState("");
  const [followupResult2, setFollowupResult2] = useState<string | null>(null);
  const [followupLoading2, setFollowupLoading2] = useState(false);
  const [followupError2, setFollowupError2] = useState<string | null>(null);

  async function analyze() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setReflection("");
    setFollowupResult(null);
    setFollowupError(null);
    setShowRound2(false);
    setReflection2("");
    setFollowupResult2(null);
    setFollowupError2(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function goDeeper() {
    if (!reflection.trim() || !result || followupLoading) return;
    setFollowupLoading(true);
    setFollowupError(null);
    setFollowupResult(null);

    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalText: text, analysis: result, reflection, round: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFollowupError(data.error || "Something went wrong.");
        return;
      }

      setFollowupResult(data.response);
    } catch {
      setFollowupError("Network error. Please try again.");
    } finally {
      setFollowupLoading(false);
    }
  }

  async function goDeeperRound2() {
    if (!reflection2.trim() || !result || followupLoading2) return;
    setFollowupLoading2(true);
    setFollowupError2(null);
    setFollowupResult2(null);

    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: text,
          analysis: result,
          reflection: reflection2,
          round: 2,
          round1Response: followupResult,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFollowupError2(data.error || "Something went wrong.");
        return;
      }

      setFollowupResult2(data.response);
    } catch {
      setFollowupError2("Network error. Please try again.");
    } finally {
      setFollowupLoading2(false);
    }
  }

  const charCount = text.length;
  const overLimit = charCount > CHAR_LIMIT;

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#f0ece6]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold tracking-tight text-[#f0ece6]">
            Emotional Weather Report
          </h1>
          <p className="text-sm text-[#f0ece6]/50 mt-0.5">
            Mental Clarity &mdash; by Bryan Odom
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Intro */}
        <p className="text-sm text-[#f0ece6]/50 leading-relaxed">
          Your words carry more than their content. Paste something you wrote today — a journal entry, a morning reflection, anything. This tool reads the emotional climate beneath the words and returns a weather report.
        </p>

        {/* Input */}
        <section className="space-y-3">
          <label className="block text-sm font-medium text-[#f0ece6]/70">
            What&apos;s on your mind today?
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={8}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#f0ece6]/20 resize-none focus:outline-none focus:ring-1 focus:ring-[#c8a96e]/30 leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${overLimit ? "text-red-400" : "text-[#f0ece6]/30"}`}>
              {charCount.toLocaleString()} / {CHAR_LIMIT.toLocaleString()}
            </span>
            <button
              onClick={analyze}
              disabled={loading || !text.trim() || overLimit}
              className="px-5 py-2 text-sm font-medium bg-[#c8a96e] hover:bg-[#d4b87a] text-[#0d1117] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors font-semibold"
            >
              {loading ? "Reading the weather..." : "Read the Weather"}
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <section className="space-y-4 animate-pulse">
            <div className="bg-[#1c2333] border border-white/10 rounded-lg p-5 space-y-3">
              <div className="h-5 bg-white/10 rounded w-2/3" />
              <div className="h-3 bg-white/10 rounded w-1/3" />
              <div className="h-3 bg-white/10 rounded w-1/4" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1c2333] border border-white/10 rounded-lg p-5 space-y-3">
                <div className="h-3 bg-white/10 rounded w-1/4" />
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-4/5" />
              </div>
            ))}
          </section>
        )}

        {/* Results */}
        {result && !loading && (
          <section className="space-y-4">
            <WeatherReport result={result} />

            {/* Reflection prompt */}
            <div className="border-t border-white/10 pt-6 space-y-3">
              <label className="block text-sm font-medium text-[#f0ece6]/50">
                What part of this landed? Write it — even a sentence.
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                placeholder="Take your time with this..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#f0ece6]/20 resize-none focus:outline-none focus:ring-1 focus:ring-[#c8a96e]/30 leading-relaxed"
              />
              {reflection.trim().length > 0 && !followupResult && (
                <div className="flex justify-end">
                  <button
                    onClick={goDeeper}
                    disabled={followupLoading}
                    className="px-5 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors text-[#f0ece6]"
                  >
                    {followupLoading ? "Going deeper..." : "Go Deeper"}
                  </button>
                </div>
              )}

              {followupError && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                  {followupError}
                </div>
              )}

              {followupLoading && (
                <div className="animate-pulse space-y-2 pt-1">
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-4/5" />
                  <div className="h-3 bg-white/10 rounded w-3/5" />
                </div>
              )}

              {followupResult && !followupLoading && (
                <div className="bg-[#161b22] border border-white/10 rounded-lg px-5 py-4 space-y-1">
                  <span className="text-xs text-[#f0ece6]/30 uppercase tracking-wider font-medium block mb-2">
                    Going deeper
                  </span>
                  <p className="text-sm text-[#f0ece6]/80 leading-relaxed whitespace-pre-wrap">
                    {followupResult}
                  </p>
                </div>
              )}
            </div>

            {/* Round 2 — optional */}
            {followupResult && !followupLoading && (
              <div className="border-t border-white/10 pt-6 space-y-3">
                {!showRound2 && !followupResult2 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#f0ece6]/40">Want to keep going?</span>
                    <button
                      onClick={() => setShowRound2(true)}
                      className="px-4 py-1.5 text-xs font-medium text-[#f0ece6]/50 hover:text-[#f0ece6]/80 border border-white/10 hover:border-white/20 rounded-md transition-colors"
                    >
                      Keep going
                    </button>
                  </div>
                )}

                {showRound2 && (
                  <>
                    <label className="block text-sm font-medium text-[#f0ece6]/50">
                      What comes up when you sit with that question?
                    </label>
                    <textarea
                      value={reflection2}
                      onChange={(e) => setReflection2(e.target.value)}
                      rows={3}
                      placeholder="Write whatever comes up, even if it's incomplete..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#f0ece6]/20 resize-none focus:outline-none focus:ring-1 focus:ring-[#c8a96e]/30 leading-relaxed"
                    />
                    {reflection2.trim().length > 0 && !followupResult2 && (
                      <div className="flex justify-end">
                        <button
                          onClick={goDeeperRound2}
                          disabled={followupLoading2}
                          className="px-5 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors text-[#f0ece6]"
                        >
                          {followupLoading2 ? "Going deeper..." : "Go Deeper"}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {followupError2 && (
                  <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    {followupError2}
                  </div>
                )}

                {followupLoading2 && (
                  <div className="animate-pulse space-y-2 pt-1">
                    <div className="h-3 bg-white/10 rounded w-full" />
                    <div className="h-3 bg-white/10 rounded w-4/5" />
                    <div className="h-3 bg-white/10 rounded w-3/5" />
                  </div>
                )}

                {followupResult2 && !followupLoading2 && (
                  <div className="bg-[#161b22] border border-white/10 rounded-lg px-5 py-4 space-y-1">
                    <span className="text-xs text-[#f0ece6]/30 uppercase tracking-wider font-medium block mb-2">
                      Going deeper
                    </span>
                    <p className="text-sm text-[#f0ece6]/80 leading-relaxed whitespace-pre-wrap">
                      {followupResult2}
                    </p>
                  </div>
                )}

                {/* Closing anchor — only after round 2 */}
                {followupResult2 && !followupLoading2 && (
                  <div className="border border-white/10 rounded-lg px-5 py-4 mt-2">
                    <p className="text-sm text-[#f0ece6]/40 leading-relaxed italic">
                      Awareness of the weather is the first move. The next is deciding what to do in it.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function getTimeLabel(): string {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const hour = now.getHours();
  let period: string;
  if (hour >= 5 && hour < 12) period = "morning";
  else if (hour >= 12 && hour < 17) period = "afternoon";
  else if (hour >= 17 && hour < 21) period = "evening";
  else period = "night";
  return `${day} ${period}`;
}

function WeatherReport({ result }: { result: WeatherResult }) {
  const timeLabel = getTimeLabel();

  return (
    <div className="space-y-4">
      {/* Weather header card */}
      <div className="bg-[#1c2333] border border-[#c8a96e]/30 rounded-lg px-5 py-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <span className="text-xs text-[#c8a96e] uppercase tracking-wider font-medium block mb-1">
              Current Conditions &middot; {timeLabel}
            </span>
            <h2 className="text-lg font-semibold text-[#f0ece6] leading-tight">
              {result.condition}
            </h2>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-[#f0ece6]/30 block mb-0.5 uppercase tracking-wider font-medium">
              Intensity
            </span>
            <span className={`text-xs font-medium ${INTENSITY_COLORS[result.intensity] ?? "text-[#f0ece6]/50"}`}>
              {result.intensity}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <div>
            <span className="text-xs text-[#f0ece6]/30 uppercase tracking-wider font-medium">
              Dominant
            </span>
            <p className="text-sm text-[#f0ece6]/70 mt-0.5">{result.dominantState}</p>
          </div>
          {result.secondaryState && (
            <div>
              <span className="text-xs text-[#f0ece6]/30 uppercase tracking-wider font-medium">
                Undercurrent
              </span>
              <p className="text-sm text-[#f0ece6]/70 mt-0.5">{result.secondaryState}</p>
            </div>
          )}
        </div>
      </div>

      {/* Signals detected */}
      <div className="bg-[#161b22] border border-white/10 rounded-lg px-5 py-4">
        <span className="text-xs text-[#f0ece6]/30 uppercase tracking-wider font-medium block mb-3">
          Signals Detected
        </span>
        <ul className="space-y-1.5">
          {result.signals.map((signal, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#c8a96e]/60 text-xs mt-0.5 shrink-0">—</span>
              <span className="text-sm text-[#f0ece6]/70 leading-relaxed">{signal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Emotional terrain */}
      <div className="bg-[#161b22] border border-white/10 rounded-lg px-5 py-4">
        <span className="text-xs text-[#f0ece6]/30 uppercase tracking-wider font-medium block mb-2">
          Emotional Terrain
        </span>
        <p className="text-sm text-[#f0ece6]/80 leading-relaxed">{result.terrain}</p>
      </div>

      {/* Forecast */}
      <div className="bg-[#161b22] border border-white/10 rounded-lg px-5 py-4">
        <span className="text-xs text-[#f0ece6]/30 uppercase tracking-wider font-medium block mb-2">
          Forecast
        </span>
        <p className="text-sm text-[#f0ece6]/80 leading-relaxed">{result.forecast}</p>
      </div>

      {/* What this weather calls for */}
      <div className="bg-[#161b22] border border-white/10 rounded-lg px-5 py-4">
        <span className="text-xs text-[#f0ece6]/30 uppercase tracking-wider font-medium block mb-3">
          What This Weather Calls For
        </span>
        <ul className="space-y-2">
          {result.callsFor.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#c8a96e]/60 text-xs mt-0.5 shrink-0">—</span>
              <span className="text-sm text-[#f0ece6]/70 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

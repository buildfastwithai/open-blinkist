"use client";

import { useState, useRef } from "react";

// Types matching our FastAPI backend
interface KeyInsight {
  heading: string;
  bullet_points: string[];
  application?: string;
}

interface BookSummary {
  book_name: string;
  author: string;
  role: string;
  key_insights: KeyInsight[];
  key_theme?: string;
}

export default function Home() {
  const [bookName, setBookName] = useState("");
  const [role, setRole] = useState("professional");
  const [numInsights, setNumInsights] = useState(5);
  const [loading, setLoading] = useState(false);
  const [bookSummary, setBookSummary] = useState<BookSummary | null>(null);

  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState<"input" | "summary">("input");
  const [isPlaying, setIsPlaying] = useState(false);

  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit");
    console.log(bookName, role, numInsights);
    console.log(API_BASE);
    e.preventDefault();
    if (!bookName.trim()) return;

    setLoading(true);
    setError("");
    setCurrentStep("summary");

    try {
      // First, get the book summary
      const summaryResponse = await fetch(`${API_BASE}/summarize_book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book_name: bookName,
          role: role,
          num_insights: numInsights,
        }),
      });

      if (!summaryResponse.ok) {
        throw new Error("Failed to generate book summary");
      }

      const summaryData: BookSummary = await summaryResponse.json();
      setBookSummary(summaryData);

      // Stay on summary page after generating insights
      setCurrentStep("summary");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCurrentStep("input");
    } finally {
      setLoading(false);
    }
  };

  const formatSummaryForAudio = (summary: BookSummary) => {
    let audioText = `${summary.book_name} by ${summary.author}. `;
    if (summary.key_theme) {
      audioText += `${summary.key_theme}. `;
    }

    summary.key_insights.forEach((insight, index) => {
      audioText += `Insight ${index + 1}: ${insight.heading}. `;
      insight.bullet_points.forEach((point) => {
        audioText += `${point}. `;
      });
      if (insight.application) {
        audioText += `Application: ${insight.application}. `;
      }
    });

    return audioText;
  };

  const playAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      // Stop any currently playing speech
      window.speechSynthesis.cancel();

      if (isPlaying) {
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      setError("Speech synthesis not supported in this browser");
    }
  };

  const stopAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const reset = () => {
    setCurrentStep("input");
    setBookSummary(null);
    setError("");
    stopAudio();
  };

  if (currentStep === "input") {
    return (
      <div
        className="min-h-screen relative overflow-hidden"
        style={{ background: "#F5F5F5" }}
      >
        {/* Neo-brutalism grid background */}
        <div className="absolute inset-0 neo-grid-bg"></div>

        {/* Header */}
        <header className="relative z-10 p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-black neo-border flex items-center justify-center">
                <span className="text-white font-bold neo-mono text-sm md:text-base">
                  🎧
                </span>
              </div>
              <h1 className="neo-title text-lg md:text-2xl">Open BLINKIST</h1>
            </div>
            <div className="hidden sm:block neo-mono text-xs md:text-sm bg-yellow-400 neo-border px-3 py-2">
              AUDIOBOOK PLATFORM
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 px-4 py-8 md:px-6 md:py-12">
          <div className="max-w-2xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8 md:mb-12">
              <h1 className="neo-title mb-4 md:mb-6 neo-glitch">
                Open BLINKIST
              </h1>
              <div className="neo-subtitle mb-6 text-pink-600">
                Raw Knowledge. Zero Fluff.
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
                <div className="bg-lime-400 neo-border px-3 py-2 md:px-4 md:py-3 neo-mono font-bold text-xs md:text-sm">
                  15-MIN SUMMARIES
                </div>
                <div className="bg-orange-400 neo-border px-3 py-2 md:px-4 md:py-3 neo-mono font-bold text-xs md:text-sm">
                  AI-POWERED AUDIO
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit}>
              <div className="neo-card mb-6">
                <div className="space-y-6">
                  {/* Book Input */}
                  <div>
                    <label
                      htmlFor="bookName"
                      className="block neo-mono font-bold text-sm md:text-base mb-3 uppercase"
                    >
                      📚 BOOK TITLE
                    </label>
                    <input
                      type="text"
                      id="bookName"
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      placeholder="Atomic Habits, Deep Work..."
                      className="w-full neo-input text-sm md:text-base"
                      required
                    />
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label
                      htmlFor="role"
                      className="block neo-mono font-bold text-sm md:text-base mb-3 uppercase"
                    >
                      👤 PROFESSION
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full neo-select text-sm md:text-base"
                    >
                      <option value="professional">PROFESSIONAL</option>
                      <option value="startup founder">STARTUP FOUNDER</option>
                      <option value="software engineer">
                        SOFTWARE ENGINEER
                      </option>
                      <option value="product manager">PRODUCT MANAGER</option>
                      <option value="student">STUDENT</option>
                      <option value="entrepreneur">ENTREPRENEUR</option>
                    </select>
                  </div>

                  {/* Insights Count */}
                  <div>
                    <label
                      htmlFor="numInsights"
                      className="block neo-mono font-bold text-sm md:text-base mb-3 uppercase"
                    >
                      ⚡ INSIGHTS
                    </label>
                    <select
                      id="numInsights"
                      value={numInsights}
                      onChange={(e) => setNumInsights(Number(e.target.value))}
                      className="w-full neo-select text-sm md:text-base"
                    >
                      <option value={3}>3 INSIGHTS</option>
                      <option value={5}>5 INSIGHTS</option>
                      <option value={7}>7 INSIGHTS</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 text-center">
                  <button
                    type="submit"
                    disabled={loading || !bookName.trim()}
                    className={`neo-button w-full md:w-auto text-sm md:text-base px-6 py-3 md:px-8 md:py-4 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="flex gap-1">
                          <div className="neo-audio-wave"></div>
                          <div className="neo-audio-wave"></div>
                          <div className="neo-audio-wave"></div>
                        </div>
                        LOADING...
                      </span>
                    ) : (
                      "GET INSIGHTS →"
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Error Display */}
            {error && (
              <div className="neo-card bg-red-500 text-white mb-6">
                <div className="neo-mono font-bold text-sm md:text-base mb-2">
                  ERROR:
                </div>
                <div className="neo-text">{error}</div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (currentStep === "summary" && bookSummary) {
    return (
      <div
        className="min-h-screen relative overflow-hidden"
        style={{ background: "#F5F5F5" }}
      >
        {/* Neo-brutalism grid background */}
        <div className="absolute inset-0 neo-grid-bg"></div>

        {/* Header */}
        <header className="relative z-10 p-4 border-b-4 border-black bg-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-black neo-border flex items-center justify-center">
                <span className="text-white font-bold neo-mono text-sm">
                  🎧
                </span>
              </div>
              <h1 className="neo-title text-lg md:text-xl">Open BLINKIST</h1>
            </div>
            <button
              onClick={reset}
              className="neo-button secondary text-xs md:text-sm px-3 py-2"
            >
              ← NEW
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {/* Book Info Section */}
            <div className="neo-card mb-6 bg-white">
              <div className="text-center mb-6">
                <h1 className="neo-title text-xl md:text-2xl mb-3 neo-glitch">
                  {bookSummary.book_name}
                </h1>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <div className="neo-mono text-xs md:text-sm bg-cyan-400 neo-border px-3 py-1">
                    BY {bookSummary.author}
                  </div>
                  <div className="neo-mono text-xs md:text-sm bg-lime-400 neo-border px-3 py-1">
                    FOR {bookSummary.role.toUpperCase()}
                  </div>
                </div>

                {bookSummary.key_theme && (
                  <div className="bg-orange-200 neo-border p-4 mb-4">
                    <div className="neo-mono font-bold text-sm mb-2 uppercase">
                      📍 THEME:
                    </div>
                    <div className="neo-text text-sm md:text-base font-medium">
                      {bookSummary.key_theme}
                    </div>
                  </div>
                )}

                {/* Audio Controls */}
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() =>
                      playAudio(formatSummaryForAudio(bookSummary))
                    }
                    disabled={isPlaying}
                    className={`neo-button ${
                      isPlaying ? "opacity-50 cursor-not-allowed" : ""
                    } text-sm px-6 py-3`}
                  >
                    {isPlaying ? (
                      <span className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="neo-audio-wave bg-white"></div>
                          <div className="neo-audio-wave bg-white"></div>
                          <div className="neo-audio-wave bg-white"></div>
                        </div>
                        PLAYING...
                      </span>
                    ) : (
                      "🔊 PLAY"
                    )}
                  </button>

                  {isPlaying && (
                    <button
                      onClick={stopAudio}
                      className="bg-red-500 neo-border border-black text-white neo-mono font-bold px-4 py-3 text-sm"
                    >
                      ⏹️ STOP
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Key Insights Section */}
            <div className="neo-card bg-white">
              <div className="mb-6">
                <h2 className="neo-title text-lg md:text-xl mb-3 text-center">
                  💡 INSIGHTS
                </h2>
                <div className="neo-mono text-xs bg-yellow-400 neo-border inline-block px-3 py-1 mx-auto block text-center">
                  {bookSummary.key_insights.length} INSIGHTS
                </div>
              </div>

              <div className="space-y-6">
                {bookSummary.key_insights.map((insight, index) => (
                  <div key={index} className="neo-card bg-gray-50 relative">
                    {/* Insight Number */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-black neo-border flex items-center justify-center">
                      <span className="text-white font-bold neo-mono text-sm">
                        {index + 1}
                      </span>
                    </div>

                    {/* Insight Header */}
                    <div className="mb-4 pt-2">
                      <h3 className="neo-subtitle text-sm md:text-base mb-3 uppercase">
                        {insight.heading}
                      </h3>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-3 mb-4">
                      {insight.bullet_points.map((point, pointIndex) => (
                        <div
                          key={pointIndex}
                          className="flex items-start gap-3"
                        >
                          <div className="w-5 h-5 bg-cyan-400 neo-border-thin border-black flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-black text-xs font-bold">
                              →
                            </span>
                          </div>
                          <div className="neo-text text-sm md:text-base leading-relaxed">
                            {point}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Application */}
                    {insight.application && (
                      <div className="bg-orange-400 neo-border p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-black neo-border-thin border-black flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              🎯
                            </span>
                          </div>
                          <div>
                            <div className="neo-mono font-bold text-sm mb-2 uppercase">
                              APPLY:
                            </div>
                            <div className="neo-text text-sm font-medium">
                              {insight.application}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-8 text-center">
              <button
                onClick={reset}
                className="neo-button accent w-full md:w-auto text-sm px-6 py-3"
              >
                ANALYZE ANOTHER BOOK →
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

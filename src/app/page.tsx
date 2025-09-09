"use client";

import { useState, useRef, useEffect } from "react";
import {
  saveBookAnalysis,
  updateBookAnalysisWithResponse,
  markAnalysisAsFailed,
  type BookAnalysisRecord,
} from "@/lib/supabase";

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
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(
    null
  );

  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://hammerhead-app-53pie.ondigitalocean.app" ||
    "http://localhost:8080";

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#F5F5F5" }}
    >
      <div className="absolute inset-0 neo-grid-bg"></div>

      {/* Header Skeleton */}
      <header className="relative z-10 p-4 border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-black neo-border flex items-center justify-center">
              <span className="text-white font-bold neo-mono text-sm">🎧</span>
            </div>
            <div className="neo-skeleton neo-skeleton-text w-32"></div>
          </div>
          <div className="neo-skeleton neo-skeleton-text w-24"></div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="relative z-10 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Book Info Skeleton */}
          <div className="neo-card mb-6 bg-white">
            <div className="text-center mb-6">
              <div className="neo-skeleton neo-skeleton-title w-64 mx-auto mb-4"></div>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <div className="neo-skeleton neo-skeleton-text w-24"></div>
                <div className="neo-skeleton neo-skeleton-text w-32"></div>
              </div>
              <div className="neo-skeleton neo-skeleton-card w-full mb-4"></div>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="neo-skeleton neo-skeleton-text w-20 h-12"></div>
                <div className="neo-skeleton neo-skeleton-text w-20 h-12"></div>
              </div>
            </div>
          </div>

          {/* Insights Skeleton */}
          <div className="neo-card bg-white">
            <div className="mb-6 text-center">
              <div className="neo-skeleton neo-skeleton-title w-32 mx-auto mb-3"></div>
              <div className="neo-skeleton neo-skeleton-text w-24 mx-auto"></div>
            </div>

            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="neo-card bg-gray-50 relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-black neo-border flex items-center justify-center">
                    <span className="text-white font-bold neo-mono text-sm">
                      {index}
                    </span>
                  </div>
                  <div className="pt-2 space-y-3">
                    <div className="neo-skeleton neo-skeleton-text w-3/4"></div>
                    <div className="neo-skeleton neo-skeleton-text w-full"></div>
                    <div className="neo-skeleton neo-skeleton-text w-5/6"></div>
                    <div className="neo-skeleton neo-skeleton-text w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading Progress */}
          <div className="mt-6 space-y-4">
            <div className="neo-card bg-cyan-400 mx-auto max-w-md px-6 py-4">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="neo-spinner"></div>
                  <span className="neo-mono font-bold text-sm">
                    AI PROCESSING
                  </span>
                  <div className="flex gap-1">
                    <div className="neo-audio-wave bg-black"></div>
                    <div className="neo-audio-wave bg-black"></div>
                    <div className="neo-audio-wave bg-black"></div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="neo-progress-container mb-3">
                  <div className="neo-progress-bar"></div>
                </div>

                <div className="neo-mono text-xs">
                  Analyzing book content and generating insights...
                </div>
              </div>
            </div>

            {/* Processing Steps */}
            <div className="neo-card bg-yellow-400 mx-auto max-w-md px-4 py-3">
              <div className="neo-mono text-xs text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span>📚</span>
                  <span>Book Analysis</span>
                  <span>→</span>
                  <span>🧠</span>
                  <span>AI Processing</span>
                  <span>→</span>
                  <span>💡</span>
                  <span>Insights Generation</span>
                </div>
                <div className="text-black/70">
                  This usually takes 10-30 seconds
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit");
    console.log(bookName, role, numInsights);
    console.log(API_BASE);
    e.preventDefault();
    if (!bookName.trim()) return;

    setLoading(true);
    setError("");
    setCurrentStep("summary");
    setCurrentInsightIndex(0);

    const startTime = Date.now();
    let analysisId: number | null = null;

    try {
      // First, save the form data to Supabase
      const analysisRecord: Omit<
        BookAnalysisRecord,
        "id" | "created_at" | "updated_at"
      > = {
        book_name: bookName,
        role: role,
        num_insights: numInsights,
        status: "pending",
        api_endpoint: `${API_BASE}/summarize_book`,
        user_agent:
          typeof window !== "undefined"
            ? window.navigator.userAgent
            : undefined,
      };

      const savedRecord = await saveBookAnalysis(analysisRecord);
      analysisId = savedRecord.id;
      setCurrentAnalysisId(analysisId);

      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      // Get the book summary from API
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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!summaryResponse.ok) {
        throw new Error("Failed to generate book summary");
      }

      const summaryData: BookSummary = await summaryResponse.json();
      setBookSummary(summaryData);

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Update the record with the response data
      if (analysisId) {
        await updateBookAnalysisWithResponse(
          analysisId,
          summaryData,
          processingTime
        );
      }

      // Stay on summary page after generating insights
      setCurrentStep("summary");
    } catch (err) {
      console.error("API Error:", err);

      let errorMessage = "An unexpected error occurred";

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorMessage =
            "Request timed out. The server might be busy. Please try again.";
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (err.message.includes("Failed to generate")) {
          errorMessage =
            "Failed to generate book summary. The book might not be found or the AI service is unavailable.";
        } else {
          errorMessage = err.message;
        }
      }

      // Mark analysis as failed in database
      if (analysisId) {
        try {
          await markAnalysisAsFailed(analysisId, errorMessage);
        } catch (dbError) {
          console.error("Failed to update database with error:", dbError);
        }
      }

      setError(errorMessage);
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

      setAudioLoading(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setAudioLoading(false);
        setIsPlaying(true);
      };
      utterance.onend = () => {
        setAudioLoading(false);
        setIsPlaying(false);
      };
      utterance.onerror = () => {
        setAudioLoading(false);
        setIsPlaying(false);
        setError("Error playing audio");
      };

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
    setAudioLoading(false);
    setCurrentInsightIndex(0);
    setDragOffset(0);
    setCurrentAnalysisId(null);
    stopAudio();
  };

  // Swipe handlers for touch interactions
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setCurrentX(touch.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setCurrentX(touch.clientX);
    const diff = touch.clientX - startX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !bookSummary) return;
    setIsDragging(false);

    const swipeThreshold = 100;
    const diff = currentX - startX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentInsightIndex > 0) {
        // Swipe right - previous insight
        setCurrentInsightIndex(currentInsightIndex - 1);
      } else if (
        diff < 0 &&
        currentInsightIndex < bookSummary.key_insights.length - 1
      ) {
        // Swipe left - next insight
        setCurrentInsightIndex(currentInsightIndex + 1);
      }
    }

    setDragOffset(0);
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
    const diff = e.clientX - startX;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging || !bookSummary) return;
    setIsDragging(false);

    const swipeThreshold = 100;
    const diff = currentX - startX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentInsightIndex > 0) {
        setCurrentInsightIndex(currentInsightIndex - 1);
      } else if (
        diff < 0 &&
        currentInsightIndex < bookSummary.key_insights.length - 1
      ) {
        setCurrentInsightIndex(currentInsightIndex + 1);
      }
    }

    setDragOffset(0);
  };

  const nextInsight = () => {
    if (
      bookSummary &&
      currentInsightIndex < bookSummary.key_insights.length - 1
    ) {
      setCurrentInsightIndex(currentInsightIndex + 1);
    }
  };

  const prevInsight = () => {
    if (currentInsightIndex > 0) {
      setCurrentInsightIndex(currentInsightIndex - 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentStep === "summary" && bookSummary) {
        if (e.key === "ArrowLeft") {
          prevInsight();
        } else if (e.key === "ArrowRight") {
          nextInsight();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentStep, bookSummary, currentInsightIndex, nextInsight, prevInsight]);

  const retryRequest = async () => {
    if (!bookName.trim()) return;

    setError("");
    setLoading(true);
    setCurrentStep("summary");
    setCurrentInsightIndex(0);

    const startTime = Date.now();
    let analysisId: number | null = null;

    try {
      // Create a new analysis record for the retry
      const analysisRecord: Omit<
        BookAnalysisRecord,
        "id" | "created_at" | "updated_at"
      > = {
        book_name: bookName,
        role: role,
        num_insights: numInsights,
        status: "pending",
        api_endpoint: `${API_BASE}/summarize_book`,
        user_agent:
          typeof window !== "undefined"
            ? window.navigator.userAgent
            : undefined,
      };

      const savedRecord = await saveBookAnalysis(analysisRecord);
      analysisId = savedRecord.id;
      setCurrentAnalysisId(analysisId);

      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      // Get the book summary
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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!summaryResponse.ok) {
        throw new Error("Failed to generate book summary");
      }

      const summaryData: BookSummary = await summaryResponse.json();
      setBookSummary(summaryData);

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Update the record with the response data
      if (analysisId) {
        await updateBookAnalysisWithResponse(
          analysisId,
          summaryData,
          processingTime
        );
      }

      // Stay on summary page after generating insights
      setCurrentStep("summary");
    } catch (err) {
      console.error("API Error:", err);

      let errorMessage = "An unexpected error occurred";

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorMessage =
            "Request timed out. The server might be busy. Please try again.";
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (err.message.includes("Failed to generate")) {
          errorMessage =
            "Failed to generate book summary. The book might not be found or the AI service is unavailable.";
        } else {
          errorMessage = err.message;
        }
      }

      // Mark analysis as failed in database
      if (analysisId) {
        try {
          await markAnalysisAsFailed(analysisId, errorMessage);
        } catch (dbError) {
          console.error("Failed to update database with error:", dbError);
        }
      }

      setError(errorMessage);
      setCurrentStep("input");
    } finally {
      setLoading(false);
    }
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
                    className={`neo-button w-full md:w-auto text-sm md:text-base px-6 py-3 md:px-8 md:py-4 transition-all duration-200 ${
                      loading ? "bg-orange-400 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="neo-spinner border-white"></div>
                        <span className="neo-mono font-bold">
                          GENERATING INSIGHTS...
                        </span>
                        <div className="flex gap-1">
                          <div className="neo-audio-wave bg-white"></div>
                          <div className="neo-audio-wave bg-white"></div>
                          <div className="neo-audio-wave bg-white"></div>
                        </div>
                      </span>
                    ) : (
                      <span className="neo-mono font-bold">
                        🚀 GET INSIGHTS
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Error Display */}
            {error && (
              <div className="neo-card bg-red-500 text-white mb-6">
                <div className="neo-mono font-bold text-sm md:text-base mb-2">
                  ⚠️ ERROR:
                </div>
                <div className="neo-text mb-4">{error}</div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={retryRequest}
                    className="bg-yellow-400 text-black neo-border border-black neo-mono font-bold px-4 py-2 text-sm hover:bg-yellow-300 transition-colors"
                  >
                    🔄 RETRY
                  </button>
                  <button
                    onClick={() => setError("")}
                    className="bg-white text-black neo-border border-black neo-mono font-bold px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    ✕ DISMISS
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Show loading skeleton when loading and current step is summary but no book summary yet
  if (loading && currentStep === "summary" && !bookSummary) {
    return <LoadingSkeleton />;
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
        <header className="relative z-10 p-3 md:p-4 border-b-4 border-black bg-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-black neo-border flex items-center justify-center">
                <span className="text-white font-bold neo-mono text-xs md:text-sm">
                  🎧
                </span>
              </div>
              <h1 className="neo-title text-sm md:text-xl">Open BLINKIST</h1>
            </div>
            <button
              onClick={reset}
              className="neo-button secondary text-xs px-3 py-2"
              aria-label="Start new book analysis"
            >
              <span className="md:hidden">📚</span>
              <span className="hidden md:inline">← NEW</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 px-3 md:px-4 py-4 md:py-6">
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
                    disabled={isPlaying || audioLoading}
                    className={`neo-button ${
                      isPlaying || audioLoading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    } text-sm px-6 py-3`}
                  >
                    {audioLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="neo-spinner"></div>
                        LOADING AUDIO...
                      </span>
                    ) : isPlaying ? (
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

            {/* Key Insights Section - Swipeable Cards */}
            <div className="neo-card bg-white relative overflow-hidden">
              <div className="mb-6">
                <h2 className="neo-title text-lg md:text-xl mb-3 text-center">
                  💡 INSIGHTS
                </h2>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="neo-mono text-xs bg-yellow-400 neo-border px-3 py-1">
                    {currentInsightIndex + 1} OF{" "}
                    {bookSummary.key_insights.length}
                  </div>
                  <div className="flex gap-1">
                    {bookSummary.key_insights.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 border border-black ${
                          index === currentInsightIndex
                            ? "bg-black"
                            : "bg-white"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Swipe Instructions */}
              <div className="text-center mb-4">
                <div className="neo-mono text-xs bg-cyan-400 neo-border inline-block px-3 py-1">
                  <span className="md:hidden">📱 SWIPE LEFT/RIGHT</span>
                  <span className="hidden md:inline">
                    👆 TAP BUTTONS • ⌨️ ARROW KEYS
                  </span>
                </div>
              </div>

              {/* Card Container */}
              <div
                className="relative h-auto min-h-[400px] touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Swipe Direction Indicators */}
                {isDragging && (
                  <>
                    <div
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${
                        dragOffset > 50 ? "opacity-100" : "opacity-30"
                      }`}
                    >
                      <div className="bg-green-400 neo-border p-3 neo-mono font-bold text-sm">
                        ← PREV
                      </div>
                    </div>
                    <div
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${
                        dragOffset < -50 ? "opacity-100" : "opacity-30"
                      }`}
                    >
                      <div className="bg-blue-400 neo-border p-3 neo-mono font-bold text-sm">
                        NEXT →
                      </div>
                    </div>
                  </>
                )}
                {/* Current Insight Card */}
                <div
                  className="neo-card bg-gray-50 relative transition-transform duration-300 ease-out select-none cursor-grab active:cursor-grabbing card-enter"
                  style={{
                    transform: `translateX(${dragOffset}px) rotate(${
                      dragOffset * 0.05
                    }deg)`,
                    opacity: isDragging ? 0.9 : 1,
                    boxShadow: isDragging
                      ? "var(--neo-shadow-large)"
                      : "var(--neo-shadow-secondary)",
                  }}
                >
                  {(() => {
                    const insight =
                      bookSummary.key_insights[currentInsightIndex];
                    return (
                      <>
                        {/* Insight Number */}
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-black neo-border flex items-center justify-center">
                          <span className="text-white font-bold neo-mono text-sm">
                            {currentInsightIndex + 1}
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
                      </>
                    );
                  })()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-6 gap-4">
                  <button
                    onClick={prevInsight}
                    disabled={currentInsightIndex === 0}
                    className={`neo-button secondary text-xs md:text-sm px-3 py-2 md:px-4 md:py-2 flex-shrink-0 ${
                      currentInsightIndex === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    aria-label="Previous insight"
                  >
                    <span className="md:hidden">←</span>
                    <span className="hidden md:inline">← PREV</span>
                  </button>

                  {/* Desktop dot navigation */}
                  <div className="hidden md:flex gap-2">
                    {bookSummary.key_insights.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentInsightIndex(index)}
                        className={`w-8 h-8 neo-border border-black flex items-center justify-center text-xs font-bold neo-mono transition-colors ${
                          index === currentInsightIndex
                            ? "bg-black text-white"
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                        aria-label={`Go to insight ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  {/* Mobile progress indicator */}
                  <div className="md:hidden flex items-center gap-2 flex-1 justify-center">
                    <div className="neo-mono text-xs bg-yellow-400 neo-border px-2 py-1">
                      {currentInsightIndex + 1}/
                      {bookSummary.key_insights.length}
                    </div>
                  </div>

                  <button
                    onClick={nextInsight}
                    disabled={
                      currentInsightIndex ===
                      bookSummary.key_insights.length - 1
                    }
                    className={`neo-button secondary text-xs md:text-sm px-3 py-2 md:px-4 md:py-2 flex-shrink-0 ${
                      currentInsightIndex ===
                      bookSummary.key_insights.length - 1
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    aria-label="Next insight"
                  >
                    <span className="md:hidden">→</span>
                    <span className="hidden md:inline">NEXT →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display for Summary Page */}
            {error && (
              <div className="neo-card bg-red-500 text-white mb-6">
                <div className="neo-mono font-bold text-sm md:text-base mb-2">
                  ⚠️ ERROR:
                </div>
                <div className="neo-text mb-4">{error}</div>
                <div className="text-center">
                  <button
                    onClick={() => setError("")}
                    className="bg-white text-black neo-border border-black neo-mono font-bold px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    ✕ DISMISS
                  </button>
                </div>
              </div>
            )}

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

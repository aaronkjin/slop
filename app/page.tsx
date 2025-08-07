"use client";

// React
import { useState } from "react";

// Next.js
import Image from "next/image";

// Components
import Header from "../components/Header";
import InfoModal from "../components/InfoModal";
import ShimmerText from "../components/ShimmerText";
import PromptInput from "../components/PromptInput";

import ExamplePrompts from "../components/ExamplePrompts";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    sceneCount?: number;
    hasCharacters?: boolean;
    error?: string;
  } | null>(null);

  const handlePromptChange = (value: string) => {
    if (value.length <= 400) {
      setPrompt(value);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setLastResult(null);

    try {
      const response = await fetch("/api/openai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setLastResult({
          success: true,
          sceneCount: data.data.sceneCount || 1,
          hasCharacters: data.data.sceneBreakdown.some((scene: any) => scene.characters.length > 0),
        });
      } else {
        setLastResult({
          success: false,
          error: data.error || "Failed to analyze scene",
        });
      }
    } catch (error) {
      console.error("Frontend error:", error);
      setLastResult({
        success: false,
        error: "Network error - check console for details",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant="main" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-3">
              Create <ShimmerText text="viral" />{" "}
              <span className="inline-flex items-baseline gap-1">
                <Image
                  src="/logos/slop_cropped.png"
                  alt="Slop"
                  width={60}
                  height={18}
                  className="inline-block"
                  style={{ transform: "translateY(13px)" }}
                />
                instantly
              </span>
            </h2>
            <div className="flex items-center justify-center gap-2">
              <p className="text-gray-600">
                Think of an idea for your next viral AI video. We&apos;ll handle
                the rest.
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowInfoModal(!showInfoModal)}
                  className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                  aria-label="More information"
                >
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <InfoModal
                  isOpen={showInfoModal}
                  onClose={() => setShowInfoModal(false)}
                  title={
                    <>
                      <u>
                        <i>Wdym</i>
                      </u>{" "}
                      we&apos;ll handle the rest?
                    </>
                  }
                  position="bottom"
                  content={
                    <div className="text-left">
                      <p className="mb-3 text-left">
                        Once you provide your creative idea, Slop takes care of
                        it all:
                      </p>
                      <ul className="space-y-1 list-disc list-outside ml-5 text-left">
                        <li className="text-left">
                          Generate a short-form funny video using Google's Veo 3
                        </li>
                        <li className="text-left">
                          Optimize it for TikTok's format and audience
                        </li>
                        <li className="text-left">
                          Automatically publish it to your TikTok account
                        </li>
                        <li className="text-left">
                          Add it to your personal dashboard for management
                        </li>
                      </ul>
                    </div>
                  }
                />
              </div>
            </div>
          </div>

          {/* Input Section */}
          <PromptInput
            value={prompt}
            onChange={handlePromptChange}
            onSubmit={handleGenerate}
            disabled={isGenerating}
          />

          {/* Results Status */}
          {!isGenerating && lastResult && (
            <div
              className={`mb-6 p-3 rounded-lg border ${
                lastResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {lastResult.success ? (
                <div className="text-green-800">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Scene Analysis Completed ({lastResult.sceneCount} scene
                      {lastResult.sceneCount !== 1 ? "s" : ""},{" "}
                      {lastResult.hasCharacters ? "1" : "0"} character
                      {lastResult.hasCharacters ? "" : "s"})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-red-800">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Scene Analysis Failed
                    </span>
                  </div>
                  <p className="text-xs text-red-700 mt-1 ml-6">
                    {lastResult.error}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Example Prompts */}
          <ExamplePrompts
            onExampleClick={handleExampleClick}
            disabled={isGenerating}
          />
        </div>
      </main>
    </div>
  );
}

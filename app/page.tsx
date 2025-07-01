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
import LoadingState from "../components/LoadingState";
import ExamplePrompts from "../components/ExamplePrompts";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handlePromptChange = (value: string) => {
    if (value.length <= 400) {
      setPrompt(value);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    // TODO: Implement actual generation logic
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-3">
              Create <ShimmerText text="hilarious" />{" "}
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
                Think of an idea for the next viral AI video. We'll handle the
                rest.
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
                      we'll handle the rest?
                    </>
                  }
                  position="bottom"
                  content={
                    <div className="text-left">
                      <p className="mb-3 text-left">
                        Once you provide your creative idea, our AI takes care
                        of it all:
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

          {/* Loading State */}
          {isGenerating && <LoadingState />}

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

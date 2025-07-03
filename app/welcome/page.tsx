"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthButton from "../../components/AuthButton";
import ShimmerText from "../../components/ShimmerText";
import { useGlassmorphism } from "use-glassmorphism";

export default function WelcomePage() {
  const [activeStep, setActiveStep] = useState(1);
  const [imageContainerStyle, setImageContainerStyle] = useState({});

  const howItWorksSectionRef = useRef<HTMLDivElement>(null);
  const stepContentContainerRef = useRef<HTMLDivElement>(null);
  const imageParentRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  // Glassmorphism effect for future navbar use
  const glassRef = useGlassmorphism<HTMLDivElement>({
    color: "rgba(255, 255, 255)",
    blur: 20,
    transparency: 0.15,
    outline: 0.3,
    animation: {
      duration: 0.6,
      timingFunction: "ease-out",
      delay: 0.1,
    },
  });

  useEffect(() => {
    // Observer for active step detection (which image to show)
    const stepObserverOptions = {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    };

    const stepObserverCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const stepNumber = parseInt(
            entry.target.getAttribute("data-step") || "1"
          );
          setActiveStep(stepNumber);
        }
      });
    };
    const stepObserver = new IntersectionObserver(
      stepObserverCallback,
      stepObserverOptions
    );
    const refs = [step1Ref, step2Ref, step3Ref, step4Ref];
    refs.forEach((ref) => {
      if (ref.current) stepObserver.observe(ref.current);
    });

    // Scroll handler for pinning/unpinning the image container
    const handleScroll = () => {
      // On mobile screens, hide the desktop/tablet-only fixed image container
      if (window.innerWidth < 768) {
        // Tailwind's 'md' breakpoint
        setImageContainerStyle({ display: "none" });
        return;
      }

      if (
        !stepContentContainerRef.current ||
        !imageWrapperRef.current ||
        !howItWorksSectionRef.current ||
        !imageParentRef.current
      )
        return;

      const sectionRect = howItWorksSectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const isSectionInView = sectionRect.top < vh && sectionRect.bottom > 0;

      if (!isSectionInView) {
        setImageContainerStyle({ opacity: 0, visibility: "hidden" });
        return;
      }

      const contentRect =
        stepContentContainerRef.current.getBoundingClientRect();
      const imageParentRect = imageParentRef.current.getBoundingClientRect();
      const imageWrapperHeight = imageWrapperRef.current.offsetHeight;
      const Pinned_Top_Offset = (vh - imageWrapperHeight) / 2;

      const isPinned =
        contentRect.top <= Pinned_Top_Offset &&
        contentRect.bottom > Pinned_Top_Offset + imageWrapperHeight;

      if (isPinned) {
        // State 2: Pinned to the viewport, but aligned with its parent column
        setImageContainerStyle({
          position: "fixed",
          top: `${Pinned_Top_Offset}px`,
          left: `${imageParentRect.left}px`,
          width: `${imageParentRect.width}px`,
          opacity: 1,
          visibility: "visible",
        });
      } else if (contentRect.top > Pinned_Top_Offset) {
        // State 1: Scrolling into view (at the top of the section)
        setImageContainerStyle({
          position: "absolute",
          top: 0,
          opacity: 1,
          visibility: "visible",
        });
      } else {
        // State 3: Scrolled past (at the bottom of the section)
        setImageContainerStyle({
          position: "absolute",
          bottom: 0,
          top: "auto",
          opacity: 1,
          visibility: "visible",
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll); // Also handle window resize
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      refs.forEach((ref) => {
        if (ref.current) stepObserver.unobserve(ref.current);
      });
    };
  }, []);

  const steps = [
    {
      number: 1,
      title: "Enter Your Idea",
      description:
        "Type a funny prompt or choose from examples. Be creative with your ideas - the weirder, the better!",
      details:
        "Our AI understands humor patterns and can work with everything from simple one-liners to complex scenarios. Whether you want absurdist comedy, meta-humor, or viral TikTok trends, just describe your vision.",
    },
    {
      number: 2,
      title: "AI Generation",
      description:
        "Veo 3 creates your video in 30-60 seconds with stunning quality and perfect timing.",
      details:
        "Google's most advanced video AI model generates high-quality, short-form content optimized for social media. The AI handles cinematography, pacing, and visual storytelling automatically.",
    },
    {
      number: 3,
      title: "Auto-Publish",
      description:
        "Video goes live on your TikTok automatically with optimal formatting and timing.",
      details:
        "We handle the technical details - aspect ratio optimization, compression, hashtag suggestions, and posting at peak engagement times. Your content appears professionally polished.",
    },
    {
      number: 4,
      title: "Go Viral",
      description:
        "Track performance in your dashboard and iterate on what works best.",
      details:
        "Monitor views, engagement, and viral potential. Use insights to refine your content strategy and create even more successful videos. Scale your presence effortlessly.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <Image
              src="/logos/slop_cropped.png"
              alt="Slop"
              width={108}
              height={32}
              className="h-9 w-auto"
            />
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <AuthButton variant="outline" fullWidth={false}>
                  Sign In
                </AuthButton>
              </Link>
              <Link href="/auth/signup">
                <AuthButton variant="primary" fullWidth={false}>
                  Get Started
                </AuthButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          {/* Hero Section - exactly matching main page sizes */}
          <div className="mb-16">
            <h1 className="text-2xl font-medium text-gray-900 mb-3">
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
            </h1>

            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Think of an idea for your next viral AI video. We'll generate it
              with Google's Veo 3 and automatically publish it to your TikTok
              account.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <AuthButton
                  variant="primary"
                  fullWidth={false}
                  className="px-8 py-4 text-base"
                >
                  Start Creating Videos
                </AuthButton>
              </Link>
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI Video Generation
              </h3>
              <p className="text-gray-600">
                Powered by Google's Veo 3, the most advanced AI video generation
                model available.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Auto-Publish to TikTok
              </h3>
              <p className="text-gray-600">
                Videos are automatically published to your TikTok account with
                optimal formatting.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Viral-Ready Content
              </h3>
              <p className="text-gray-600">
                Optimized for current humor trends: absurdist, meta-humor, and
                Gen Z comedy styles.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* How it Works - Stripe-like Scrolling Section */}
      <section ref={howItWorksSectionRef} className="bg-gray-50 relative pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center pt-16 pb-8 px-4">
            <h2 className="text-3xl font-medium text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From idea to viral video in under 2 minutes. Our streamlined
              process handles everything automatically.
            </p>
          </div>

          {/* Main Content Grid - Stripe-like Layout */}
          <div className="relative grid md:grid-cols-2 md:gap-x-12">
            {/* Scrolling Content on Left Side */}
            <div
              ref={stepContentContainerRef}
              className="md:col-start-1 px-4 md:px-8"
            >
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  ref={[step1Ref, step2Ref, step3Ref, step4Ref][index]}
                  data-step={step.number}
                  className="min-h-[80vh] flex items-center py-12"
                >
                  <div className="max-w-lg">
                    <div className="mb-6">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Step {step.number}
                      </span>
                    </div>

                    <h3 className="text-3xl font-medium text-gray-900 mb-6">
                      {step.title}
                    </h3>

                    <p className="text-lg text-gray-600 mb-6">
                      {step.description}
                    </p>

                    <p className="text-gray-600 leading-relaxed">
                      {step.details}
                    </p>

                    {/* Responsive Image for Mobile */}
                    <div className="mt-8 md:hidden">
                      <Image
                        src={`/images/step${step.number}.png`}
                        alt={`Step ${step.number} interface`}
                        width={600}
                        height={500}
                        className="object-contain rounded-lg"
                        style={{
                          filter: "drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))",
                        }}
                      />
                    </div>

                    {step.number === 4 && (
                      <div className="mt-8">
                        <Link href="/auth/signup">
                          <AuthButton
                            variant="primary"
                            fullWidth={false}
                            className="px-6 py-3"
                          >
                            Start Creating Now
                          </AuthButton>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Fixed Image on Right Side (Tablet and Desktop) */}
            <div
              ref={imageParentRef}
              className="hidden md:block md:col-start-2 relative h-full"
            >
              <div
                ref={imageWrapperRef}
                className="w-full h-[500px] transition-opacity duration-300"
                style={imageContainerStyle}
              >
                <div className="relative w-full h-full">
                  {[1, 2, 3, 4].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`absolute inset-0 ${
                        activeStep === stepNum ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <Image
                        src={`/images/step${stepNum}.png`}
                        alt={`Step ${stepNum} interface`}
                        fill
                        className="object-contain"
                        style={{
                          filter:
                            "drop-shadow(0 20px 25px rgba(0, 0, 0, 0.15))",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">
              Ready to create your first viral video?
            </h2>
            <p className="text-gray-600 mb-6">
              Join creators who are using AI to scale their TikTok presence.
            </p>
            <Link href="/auth/signup">
              <AuthButton
                variant="primary"
                fullWidth={false}
                className="px-8 py-4 text-base"
              >
                Get Started Free
              </AuthButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

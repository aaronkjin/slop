"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthButton from "../../components/AuthButton";
import ShimmerText from "../../components/ShimmerText";
import Header from "../../components/Header";
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
      title: "Ideate",
      description: "Unleash your creativity — or brainrot.",
      details:
        "Slop scrapes the web to understand humor patterns, working with everything from one-liners to complex scenarios. Whether you want meta-humor or viral TikTok trends, just describe your vision.",
    },
    {
      number: 2,
      title: "Create",
      description: "Slop creates your TikTok video in <1 minute.",
      details:
        "Using Veo 3, Slop generates high-quality, short-form content optimized for social media. We also take care of cinematography and visual storytelling.",
    },
    {
      number: 3,
      title: "Auto-Publish",
      description: "Video goes live on your TikTok automatically.",
      details:
        "We handle the technical details - aspect ratio optimization, compression, hashtag suggestions, along with titles and captions. Your content is the most polished slop — ever.",
    },
    {
      number: 4,
      title: (
        <>
          Go <ShimmerText text="Viral" className="font-normal" />
        </>
      ),
      description:
        "Track performance in your dashboard and iterate on what works best.",
      details:
        "Monitor views, engagement, and viral potential. Use insights to refine your content strategy and create even more successful videos. Scale your presence effortlessly.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header variant="landing" showAuthButtons={true} />

      <main className="min-h-screen flex items-center justify-center px-4 py-32 relative overflow-hidden isolate">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1400px] max-h-[1400px] -z-10 opacity-20 pointer-events-none">
          <Image
            src="/icons/puddle.jpg"
            alt="Decorative background gradient"
            layout="fill"
            objectFit="contain"
          />
        </div>

        <div className="text-center max-w-4xl mx-auto z-10">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-light text-gray-600 tracking-tight leading-none">
                Create{" "}
                <ShimmerText
                  text="hilarious"
                  className="font-light"
                  textColor="rgb(75, 85, 99)"
                />
              </h1>

              <div className="flex justify-center">
                <Image
                  src="/logos/slop_cropped.png"
                  alt="Slop"
                  width={600}
                  height={180}
                  className="w-auto h-48 md:h-60 mix-blend-multiply"
                  priority
                />
              </div>

              <h2 className="text-3xl md:text-5xl font-light text-gray-600 tracking-tight leading-none">
                instantly
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-500 font-normal max-w-3xl mx-auto mt-12 leading-relaxed">
              Give us an idea. <i>Any</i> idea. We'll generate it, optimize it
              to go viral, and automatically publish it to your TikTok account.
            </p>

            {/* CTA Buttons */}
            <div className="flex justify-center mt-16">
              <Link href="/auth/signup">
                <AuthButton
                  variant="primary"
                  fullWidth={false}
                  className="px-12 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Creating Videos
                </AuthButton>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* How it Works - Stripe-like Scrolling Section */}
      <section ref={howItWorksSectionRef} className="bg-gray-50 relative pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center pt-20 pb-12 px-4">
            <h2 className="text-4xl md:text-5xl font-normal text-gray-900 mb-6 tracking-tight">
              How it works
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-normal max-w-3xl mx-auto leading-relaxed">
              From idea to viral video in minutes. Our process handles
              everything automatically.
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
                  className="min-h-[50vh] flex items-center py-8"
                >
                  <div className="max-w-lg">
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {step.number}
                        </div>
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Step {step.number}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-normal text-gray-900 mb-6 tracking-tight">
                      {step.title}
                    </h3>

                    <p className="text-lg md:text-xl text-gray-600 mb-6 font-normal leading-relaxed">
                      {step.description}
                    </p>

                    <p className="text-gray-600 leading-relaxed font-normal">
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
                      <div className="mt-10">
                        <Link href="/auth/signup">
                          <AuthButton
                            variant="primary"
                            fullWidth={false}
                            className="px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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
      <section className="bg-white py-24 md:py-32 relative overflow-hidden isolate">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-[120vw] max-w-[1800px] h-[60vw] -z-10 opacity-20 pointer-events-none">
          <Image
            src="/icons/puddle_ground.png"
            alt="Decorative background gradient"
            layout="fill"
            objectFit="contain"
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-normal text-gray-900 mb-6 tracking-tight leading-tight">
              Ready to create your first viral video?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-normal max-w-3xl mx-auto leading-relaxed">
              Join people like{" "}
              <ShimmerText
                textColor="#4B5563"
                text="you"
                className="font-normal"
              />{" "}
              who are using AI to scale their TikTok presence.
            </p>
            <div className="flex justify-center mt-12">
              <Link href="/auth/signup">
                <AuthButton
                  variant="primary"
                  fullWidth={false}
                  className="px-12 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started Free
                </AuthButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

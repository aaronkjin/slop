"use client";

interface ExamplePromptsProps {
  onExampleClick: (example: string) => void;
  disabled?: boolean;
}

export default function ExamplePrompts({
  onExampleClick,
  disabled = false,
}: ExamplePromptsProps) {
  const examples = [
    "Possessed Labubu doll meets water-gun exorcist",
    "It's not clocking to you that I'm standing on business, is it?",
    'NPC streamer glitches in store: "ice cream so good"',
    "Italian brainrot croc crashes prom dance",
  ];

  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Try these examples:
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onExampleClick(example)}
            className="text-left p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}

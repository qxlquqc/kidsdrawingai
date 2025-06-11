"use client";

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isGenerating: boolean;
  progress: number;
}

export default function GenerateButton({
  onClick,
  disabled,
  isGenerating,
  progress
}: GenerateButtonProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <button
        className={`
          w-full max-w-md mx-auto py-4 px-6 rounded-lg font-bold text-lg
          transition-all duration-300 text-white
          bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5]
          shadow-sm
          ${disabled || isGenerating 
            ? 'opacity-60 cursor-not-allowed' 
            : 'hover:shadow-lg hover:translate-y-[-2px] btn-hover-effect'}
        `}
        onClick={onClick}
        disabled={disabled || isGenerating}
      >
        {isGenerating ? 'Transforming...' : 'Transform My Drawing'}
      </button>

      {isGenerating && (
        <div className="w-full max-w-md mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Transforming your drawing</span>
            <span className="text-sm font-medium text-[#a17ef5]">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5] animate-pulse"
              style={{
                width: `${progress}%`,
                transition: 'width 0.5s ease-in-out'
              }}
            ></div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">May take up to 60 seconds</p>
        </div>
      )}
    </div>
  );
} 
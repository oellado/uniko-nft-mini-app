import { Shuffle } from "lucide-react";
import { cn } from "../lib/utils";

interface PreviewSectionProps {
  onGenerate: () => void;
  className?: string;
}

export function PreviewSection({ onGenerate, className }: PreviewSectionProps) {
  return (
    <div className={cn("bg-white rounded-2xl p-4 shadow-lg border border-gray-100", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Preview Next Uniko</h3>
          <p className="text-sm text-gray-500">Generate a new random preview</p>
        </div>
        <button
          onClick={onGenerate}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl transition-colors"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 
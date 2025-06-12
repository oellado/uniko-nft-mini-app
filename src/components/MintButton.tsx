interface MintButtonProps {
  onMint: () => void;
  isMinting: boolean;
}

export function MintButton({ onMint, isMinting }: MintButtonProps) {
  return (
    <button
      onClick={onMint}
      disabled={isMinting}
      className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
    >
      {isMinting ? "Collecting..." : "Collect"}
    </button>
  );
} 
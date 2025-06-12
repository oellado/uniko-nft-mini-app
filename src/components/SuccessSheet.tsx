interface SuccessSheetProps {
  nft: {
    name: string;
    svg: string;
    isUltraRare?: boolean;
    isRainbow?: boolean;
  };
  onClose: () => void;
}

export function SuccessSheet({ nft, onClose }: SuccessSheetProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Successfully Minted!</h2>
          
          <div className="w-[250px] h-[250px] mx-auto mb-6 border border-gray-100 rounded-lg overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: nft.svg }} />
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-gray-600">{nft.name}</p>
            {nft.isUltraRare && (
              <p className="text-[#4CAF50] font-medium">✨ Ultra Rare ✨</p>
            )}
            {nft.isRainbow && (
              <p className="text-[#4CAF50] font-medium">🌈 Rainbow Background 🌈</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-[#4CAF50] text-white font-medium rounded-lg hover:bg-[#45a049] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 
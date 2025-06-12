import { cn } from "../lib/utils";

interface UnikoCardProps {
  uniko: {
    name: string;
    svg: string;
    isUltraRare: boolean;
    type: string;
    traits?: {
      eyes: string;
      mouth: string;
      leftCheek: string;
      rightCheek: string;
      accessory: string;
      background: string;
      face: string;
    };
  };
  className?: string;
}

export function UnikoCard({ uniko, className }: UnikoCardProps) {
  return (
    <div className={cn("bg-white rounded-2xl p-6 shadow-lg border border-gray-100", className)}>
      {/* Ultra Rare Badge */}
      {uniko.isUltraRare && (
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold">
            ✨ ULTRA RARE ✨
          </div>
        </div>
      )}

      {/* SVG Display */}
      <div className="flex justify-center mb-4">
        <div 
          className="rounded-lg overflow-hidden shadow-md uniko-bounce"
          dangerouslySetInnerHTML={{ __html: uniko.svg }}
        />
      </div>

      {/* Name and Type */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-1">{uniko.name}</h2>
        <p className="text-gray-500 text-sm">{uniko.type}</p>
      </div>

      {/* Traits */}
      {uniko.traits && !uniko.isUltraRare && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Traits</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-gray-500">Eyes</div>
              <div className="font-medium">{uniko.traits.eyes}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-gray-500">Mouth</div>
              <div className="font-medium">{uniko.traits.mouth}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-gray-500">Cheeks</div>
              <div className="font-medium">
                {uniko.traits.leftCheek !== 'none' || uniko.traits.rightCheek !== 'none' 
                  ? `${uniko.traits.leftCheek} ${uniko.traits.rightCheek}` 
                  : 'none'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-gray-500">Accessory</div>
              <div className="font-medium">{uniko.traits.accessory}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
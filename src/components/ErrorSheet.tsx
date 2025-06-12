interface ErrorSheetProps {
  message: string;
  onClose: () => void;
}

export function ErrorSheet({ message, onClose }: ErrorSheetProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 
"use client";

interface AlertModalProps {
  isOpen: boolean;
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}

export default function AlertModal({ isOpen, type, message, onClose }: AlertModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    success: { bg: "bg-green-100", text: "text-green-800", icon: "✅" },
    error: { bg: "bg-red-100", text: "text-red-800", icon: "⚠️" },
    info: { bg: "bg-blue-100", text: "text-blue-800", icon: "ℹ️" },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-80 transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${style.bg}`}>
          <span className="text-2xl">{style.icon}</span>
        </div>
        <div className="text-center">
          <h3 className={`text-lg font-medium leading-6 ${style.text}`}>
            {type === "error" ? "오류 발생" : type === "success" ? "성공" : "알림"}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500 whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
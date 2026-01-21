"use client";

import { ReactNode } from "react";

interface CommonModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: ReactNode;

    mode?: "alert" | "confirm";
    theme?: "default" | "danger" | "success";

    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
}

export default function CommonModal({
    isOpen,
    onClose,
    title,
    message,
    mode = "confirm",
    theme = "default",
    confirmText = "확인",
    cancelText = "취소",
    onConfirm,
}: CommonModalProps) {
    if (!isOpen) return null;

    const themeStyles = {
        default: {
            iconBg: "bg-indigo-100 text-indigo-600",
            btn: "bg-indigo-600 hover:bg-indigo-700",
            icon: "🔒",
        },
        danger: {
            iconBg: "bg-red-100 text-red-600",
            btn: "bg-red-500 hover:bg-red-600",
            icon: "⚠️",
        },
        success: {
            iconBg: "bg-yellow-100 text-yellow-600",
            btn: "bg-yellow-500 hover:bg-yellow-600",
            icon: "✅",
        },
    };

    const currentTheme = themeStyles[theme];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-[90%] max-w-sm p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200">

                {/* 헤더 (아이콘 + 제목 + 내용) */}
                <div className="text-center mb-6">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${currentTheme.iconBg}`}>
                        <span className="text-2xl">{currentTheme.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {title}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 whitespace-pre-wrap leading-relaxed">
                        {message}
                    </div>
                </div>

                {/* 버튼 영역 */}
                <div className="flex gap-3">
                    {mode === "confirm" && (
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-3 px-4 text-white rounded-lg font-bold transition-colors shadow-sm ${currentTheme.btn}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
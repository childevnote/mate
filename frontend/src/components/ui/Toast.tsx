"use client";

import { useEffect, useRef } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    type?: "success" | "error" | "info";
}

export default function Toast({ message, isVisible, onClose, type = "success" }: ToastProps) {
    const toastRef = useRef<HTMLDivElement>(null);

    // 아이콘 및 스타일 설정
    const styleConfig = {
        success: { icon: CheckCircle, bg: "bg-gray-900", border: "border-gray-800", text: "text-white" },
        error: { icon: AlertCircle, bg: "bg-white", border: "border-red-100", text: "text-red-600" },
        info: { icon: Info, bg: "bg-white", border: "border-blue-100", text: "text-blue-600" },
    };

    const { icon: Icon, bg, border, text } = styleConfig[type];

    useEffect(() => {
        if (!isVisible) return;

        const autoCloseTimer = setTimeout(onClose, 3000);

        const handleClickOutside = (event: MouseEvent) => {
            if (toastRef.current && !toastRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const clickListenerTimer = setTimeout(() => {
            document.addEventListener("click", handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(autoCloseTimer);
            clearTimeout(clickListenerTimer);
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div
            ref={toastRef}
            className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border animate-in slide-in-from-right-10 fade-in duration-300 ${bg} ${border} ${text}`}
        >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
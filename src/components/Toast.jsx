import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

const Toast = ({ visible, message, type = 'success', onClose }) => {
    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn
      bg-black/80 backdrop-blur-md border border-white/10 max-w-md">
            {type === 'success' ? (
                <Check className="h-5 w-5 text-[#7C5DF9]" />
            ) : type === 'updating' ? (
                <div className="h-5 w-5 border-2 border-[#7C5DF9] border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
            )}
            <span className="text-white text-sm">{message}</span>
            <button
                onClick={onClose}
                className="ml-2 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;

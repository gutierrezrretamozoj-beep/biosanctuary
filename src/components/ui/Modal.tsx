"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  isDirty?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-xl",
  isDirty = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDirty) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} rounded-3xl backdrop-blur-2xl bg-white/90 dark:bg-emerald-950/80 border border-emerald-600/30 dark:border-emerald-400/30 shadow-2xl shadow-emerald-950/20 dark:shadow-black/70 p-6 relative transition-transform duration-300 animate-in fade-in zoom-in-95 my-8`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-emerald-600/15 dark:border-emerald-400/20 mb-5">
          <h2
            id="modal-title"
            className="text-lg sm:text-xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana modal"
            className="p-1.5 rounded-xl hover:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;

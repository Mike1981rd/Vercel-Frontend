"use client";

import React from "react";
import { XCircle, X } from "lucide-react";

interface ErrorModalProps {
  open: boolean;
  title?: string;
  messages?: string[];
  primaryColor?: string;
  onClose: () => void;
}

export default function ErrorModal({ open, title = "No se pudo completar la operación", messages = [], primaryColor = "#ef4444", onClose }: ErrorModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[92%] sm:w-[520px] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
          <div className="p-1.5 rounded-full" style={{ backgroundColor: `${primaryColor}1A` }}>
            <XCircle className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 max-h-[60vh] overflow-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-700">Ocurrió un error inesperado. Intenta nuevamente.</p>
          ) : (
            <ul className="space-y-2">
              {messages.map((msg, idx) => (
                <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

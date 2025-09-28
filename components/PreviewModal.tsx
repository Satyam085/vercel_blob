"use client";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
}

export default function PreviewModal({ isOpen, onClose, content }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto relative p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
        >
          <X size={20} />
        </button>
        {content}
      </div>
    </div>
  );
}

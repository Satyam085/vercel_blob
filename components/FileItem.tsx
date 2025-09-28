"use client";
import { Copy, Download, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import type { BlobFile } from "./BlobManager";
import PreviewModal from "./PreviewModal";

export default function FileItem({
  file,
  deleteItems,
}: {
  file: BlobFile;
  deleteItems: (paths: string[]) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);

  const downloadUrl =
    file.url ?? `https://your-blob-store.vercel-storage.com/${file.pathname}`;
  const ext = file.pathname.split(".").pop()?.toLowerCase();

  const openPreview = async () => {
    if (["txt", "md"].includes(ext || "")) {
      try {
        const res = await fetch(downloadUrl);
        const text = await res.text();
        setTextContent(text);
      } catch {
        setTextContent("⚠️ Failed to load file.");
      }
    }
    setPreviewOpen(true);
  };

  const inlineThumb = ["jpg", "jpeg", "png", "gif", "webp"].includes(
    ext || "",
  ) ? (
    <img
      src={downloadUrl}
      alt={file.pathname}
      className="w-10 h-10 object-cover rounded border border-gray-600"
    />
  ) : (
    <div className="w-10 h-10 flex items-center justify-center text-gray-500">
      📄
    </div>
  );

  let previewContent: React.ReactNode = null;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
    previewContent = (
      <img
        src={downloadUrl}
        alt={file.pathname}
        className="max-h-[70vh] mx-auto rounded"
      />
    );
  } else if (["txt", "md"].includes(ext || "")) {
    previewContent = (
      <pre className="whitespace-pre-wrap text-gray-200 text-sm">
        {textContent || "Loading..."}
      </pre>
    );
  } else {
    previewContent = (
      <p className="text-gray-400">
        No preview available. Use download instead.
      </p>
    );
  }

  return (
    <div className="p-2 flex items-center justify-between hover:bg-gray-700 rounded">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {inlineThumb}
        <div className="flex-1 min-w-0">
          <div className="text-gray-100 truncate">
            {file.pathname.split("/").pop()}
          </div>
          <div className="text-xs text-gray-500">
            {file.size} bytes • {new Date(file.uploadedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => navigator.clipboard.writeText(downloadUrl)}
          className="p-1 text-gray-400 hover:text-yellow-400 rounded"
          title="Copy URL"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={openPreview}
          className="p-1 text-gray-400 hover:text-green-400 rounded"
          title="Preview"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={() => window.open(downloadUrl, "_blank")}
          className="p-1 text-gray-400 hover:text-indigo-400 rounded"
          title="Download"
        >
          <Download size={14} />
        </button>
        <button
          onClick={() => deleteItems([file.pathname])}
          className="p-1 text-gray-400 hover:text-red-400 rounded"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        content={previewContent}
      />
    </div>
  );
}

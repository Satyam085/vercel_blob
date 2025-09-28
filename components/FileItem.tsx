"use client";
import { Download, Trash2 } from "lucide-react";
import type { BlobFile } from "./BlobManager";

interface Props {
  file: BlobFile;
  deleteFile: (pathname: string) => void;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
}

export default function FileItem({ file, deleteFile }: Props) {
  const downloadUrl =
    file.url ?? `https://your-blob-store.vercel-storage.com/${file.pathname}`;

  return (
    <div className="p-4 hover:bg-gray-800 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-100 truncate">
          {file.pathname}
        </div>
        <div className="text-sm text-gray-500">
          {formatFileSize(file.size)} •{" "}
          {new Date(file.uploadedAt).toLocaleDateString()}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => window.open(downloadUrl, "_blank")}
          className="p-2 text-gray-400 hover:text-indigo-400 rounded"
          title="View/Download"
        >
          <Download size={16} />
        </button>
        <button
          onClick={() => deleteFile(file.pathname)}
          className="p-2 text-gray-400 hover:text-red-400 rounded"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

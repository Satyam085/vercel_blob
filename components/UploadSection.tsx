"use client";
import { Folder, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import type { BlobFile } from "./BlobManager";
import { useToast } from "./Toast";

interface Props {
  storageKey: string;
  setFiles: React.Dispatch<React.SetStateAction<BlobFile[]>>;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  uploadProgress: { done: number; total: number };
  setUploadProgress: (v: { done: number; total: number }) => void;
}

export default function UploadSection({
  storageKey,
  setFiles,
  uploading,
  setUploading,
  uploadProgress,
  setUploadProgress,
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const uploadFiles = useCallback(
    async (fileList: File[], folderMode = false) => {
      if (fileList.length === 0) return;

      setUploading(true);
      setUploadProgress({ done: 0, total: fileList.length });

      const uploaded: BlobFile[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (const file of fileList) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const path =
            folderMode &&
            (file as File & { webkitRelativePath?: string })
              .webkitRelativePath
              ? (file as File & { webkitRelativePath?: string })
                  .webkitRelativePath!
              : file.name;
          formData.append("pathname", path);

          const res = await fetch("/api/blob", {
            method: "POST",
            headers: { Authorization: `Bearer ${storageKey}` },
            body: formData,
          });
          const data = await res.json();

          if (res.ok && data.blob) {
            uploaded.push({
              pathname: data.blob.pathname,
              size: data.blob.size,
              uploadedAt: data.blob.uploadedAt,
              url: data.blob.url,
            });
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
        setUploadProgress({ done: successCount + errorCount, total: fileList.length });
      }

      if (uploaded.length > 0) setFiles((prev) => [...prev, ...uploaded]);
      setUploading(false);

      if (successCount && !errorCount)
        toast(`Uploaded ${successCount} file(s)!`, "success");
      else if (successCount && errorCount)
        toast(`${successCount} uploaded, ${errorCount} failed.`, "error");
      else toast("Upload failed.", "error");
    },
    [storageKey, setFiles, setUploading, setUploadProgress, toast],
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, folderMode = false) => {
      const fileList = event.target.files;
      if (!fileList || fileList.length === 0) return;
      uploadFiles(Array.from(fileList), folderMode);
      event.target.value = "";
    },
    [uploadFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) uploadFiles(droppedFiles);
    },
    [uploadFiles],
  );

  const pct =
    uploadProgress.total > 0
      ? Math.round((uploadProgress.done / uploadProgress.total) * 100)
      : 0;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragOver
          ? "border-indigo-400 bg-indigo-900/20"
          : "border-gray-700 hover:border-gray-600"
      }`}
    >
      <div className="flex justify-center gap-4 mb-4">
        <label className="cursor-pointer bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Folder size={16} /> Upload Folder
          <input
            type="file"
            multiple
            // @ts-expect-error
            webkitdirectory=""
            onChange={(e) => handleFileInput(e, true)}
            className="hidden"
            disabled={uploading}
          />
        </label>
        <label className="cursor-pointer bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2">
          <Upload size={16} /> Upload Files
          <input
            type="file"
            multiple
            onChange={(e) => handleFileInput(e, false)}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      <p className="text-sm text-gray-400">
        {dragOver
          ? "Drop files here to upload"
          : "Drag & drop files here, or use the buttons above"}
      </p>
      {uploading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-indigo-400 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400" />
            <span>
              Uploading {uploadProgress.done}/{uploadProgress.total} files...
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { Folder, Upload } from "lucide-react";
import { useCallback } from "react";
import type { BlobFile } from "./BlobManager";

interface Props {
  storageKey: string;
  setFiles: React.Dispatch<React.SetStateAction<BlobFile[]>>;
  uploading: boolean;
  setUploading: (v: boolean) => void;
}

export default function UploadSection({
  storageKey,
  setFiles,
  uploading,
  setUploading,
}: Props) {
  // File upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, folderMode = false) => {
      const fileList = event.target.files;
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList) as (File & {
        webkitRelativePath?: string;
      })[];
      setUploading(true);

      const uploaded: BlobFile[] = [];
      let successCount = 0,
        errorCount = 0;

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const path = folderMode
            ? file.webkitRelativePath || file.name
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
      }

      if (uploaded.length > 0) setFiles((prev) => [...prev, ...uploaded]);
      setUploading(false);
      event.target.value = ""; // reset

      if (successCount && !errorCount)
        alert(`✅ Uploaded ${successCount} file(s)!`);
      else if (successCount && errorCount)
        alert(`⚠️ ${successCount} success, ${errorCount} failed.`);
      else alert("❌ Upload failed.");
    },
    [storageKey, setFiles, setUploading],
  );

  return (
    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
      <div className="flex justify-center gap-4 mb-4">
        <label className="cursor-pointer bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Folder size={16} /> Upload Folder
          <input
            type="file"
            multiple
            // @ts-expect-error
            webkitdirectory=""
            onChange={(e) => handleFileUpload(e, true)}
            className="hidden"
            disabled={uploading}
          />
        </label>
        <label className="cursor-pointer bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2">
          <Upload size={16} /> Upload Files
          <input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e, false)}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      <p className="text-sm text-gray-400">
        Upload folders (structure preserved) or select individual files.
      </p>
      {uploading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-indigo-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400" />
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
}

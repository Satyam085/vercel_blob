"use client";
import { useEffect, useState } from "react";
import FileList from "./FileList";
import HowToUse from "./HowToUse";
import TokenInput from "./TokenInput";
import UploadSection from "./UploadSection";

export type BlobFile = {
  pathname: string;
  size: number;
  uploadedAt: string;
  url?: string;
};

const STORAGE_KEY_NAME = "vercel_blob_storage_key";
const STORAGE_KEY_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function BlobManager() {
  const [storageKey, setStorageKey] = useState("");
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Check localStorage and auto-connect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const item = localStorage.getItem(STORAGE_KEY_NAME);
    if (item) {
      try {
        const { key, expiresAt } = JSON.parse(item);
        if (Date.now() < expiresAt) {
          setStorageKey(key);
          autoConnect(key);
        } else {
          localStorage.removeItem(STORAGE_KEY_NAME);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY_NAME);
      }
    }
  }, []);

  // Auto-connect function
  const autoConnect = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/blob", {
        method: "GET",
        headers: { Authorization: `Bearer ${key}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles(data.data || []);
        setConnected(true);
      } else {
        localStorage.removeItem(STORAGE_KEY_NAME);
        setStorageKey("");
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY_NAME);
      setStorageKey("");
    }
    setLoading(false);
  };

  // Manual connect
  const connectToStorage = async () => {
    if (!storageKey.trim()) return alert("Enter a valid token");
    setLoading(true);
    localStorage.setItem(
      STORAGE_KEY_NAME,
      JSON.stringify({
        key: storageKey,
        expiresAt: Date.now() + STORAGE_KEY_EXPIRY,
      }),
    );
    await autoConnect(storageKey);
  };

  // Disconnect
  const disconnect = () => {
    setConnected(false);
    setFiles([]);
    setStorageKey("");
    localStorage.removeItem(STORAGE_KEY_NAME);
  };

  // Generate and download JSON file with all file URLs
  const downloadJson = () => {
    if (!files.length) {
      alert("No files available to export.");
      return;
    }

    const jsonData: Record<string, string> = {};
    files.forEach((file) => {
      const slug = file.pathname.replace(/\//g, "_"); // turn path into single slug
      const url =
        file.url ??
        `https://your-blob-store.vercel-storage.com/${file.pathname}`;
      jsonData[slug] = url;
    });

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "files.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Delete one or multiple files
  const deleteItems = async (paths: string[]) => {
    if (!paths.length) return;
    const msg =
      paths.length === 1
        ? `Delete file "${paths[0]}"?`
        : `Delete folder with ${paths.length} files?`;

    if (!confirm(msg)) return;

    try {
      const res = await fetch("/api/blob/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storageKey}`,
        },
        body: JSON.stringify({ files: paths }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFiles((prev) => prev.filter((f) => !paths.includes(f.pathname)));
      } else {
        alert(`Delete failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Vercel Blob Storage Manager</h1>
        <p className="text-gray-400">
          Connect to your Vercel Blob Storage, upload folders/files, and manage
          them.
        </p>

        {!connected ? (
          <TokenInput
            storageKey={storageKey}
            setStorageKey={setStorageKey}
            loading={loading}
            connectToStorage={connectToStorage}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-green-400">✅ Connected</span>
              <button
                onClick={disconnect}
                className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
              >
                Disconnect
              </button>
            </div>

            <UploadSection
              storageKey={storageKey}
              setFiles={setFiles}
              uploading={uploading}
              setUploading={setUploading}
            />
            <div className="flex justify-end mb-4">
              <button
                onClick={downloadJson}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
              >
                Download JSON
              </button>
            </div>
            <FileList files={files} deleteItems={deleteItems} />
          </>
        )}

        <HowToUse />
      </div>
    </div>
  );
}

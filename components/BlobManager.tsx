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

  // Check localStorage and auto-connect if valid
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
      if (res.ok) {
        const data = await res.json();
        setFiles(data.blobs || []);
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

  // Manual connect (when user enters token)
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

  // Disconnect (clear token + state)
  const disconnect = () => {
    setConnected(false);
    setFiles([]);
    setStorageKey("");
    localStorage.removeItem(STORAGE_KEY_NAME);
  };

  // Delete file (unchanged)
  const deleteFile = async (pathname: string) => {
    if (!confirm(`Delete ${pathname}?`)) return;
    try {
      const res = await fetch(`/api/blob/${encodeURIComponent(pathname)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${storageKey}` },
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.pathname !== pathname));
      } else {
        const err = await res.json();
        alert(err.error || "Delete failed");
      }
    } catch (err) {
      alert(`Delete error: ${(err as Error).message}`);
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
            <FileList files={files} deleteFile={deleteFile} />
          </>
        )}

        <HowToUse />
      </div>
    </div>
  );
}

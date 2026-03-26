"use client";
import { useEffect, useState } from "react";
import { useConfirm } from "./ConfirmModal";
import FileList from "./FileList";
import HowToUse from "./HowToUse";
import { useToast } from "./Toast";
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
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const { confirm } = useConfirm();

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
        toast("Failed to connect. Check your token.", "error");
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY_NAME);
      setStorageKey("");
      toast("Connection error. Try again.", "error");
    }
    setLoading(false);
  };

  const connectToStorage = async () => {
    if (!storageKey.trim()) {
      toast("Enter a valid token", "error");
      return;
    }
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

  const disconnect = () => {
    setConnected(false);
    setFiles([]);
    setStorageKey("");
    setSelected(new Set());
    localStorage.removeItem(STORAGE_KEY_NAME);
    toast("Disconnected", "info");
  };

  const downloadJson = () => {
    if (!files.length) {
      toast("No files available to export.", "error");
      return;
    }

    const jsonData: Record<string, string> = {};
    for (const file of files) {
      const slug = file.pathname.replace(/\//g, "_");
      const url =
        file.url ??
        `https://your-blob-store.vercel-storage.com/${file.pathname}`;
      jsonData[slug] = url;
    }

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "files.json";
    link.click();
    URL.revokeObjectURL(url);
    toast("JSON downloaded!", "success");
  };

  const deleteItems = async (paths: string[]) => {
    if (!paths.length) return;
    const msg =
      paths.length === 1
        ? `This will permanently delete "${paths[0]}".`
        : `This will permanently delete ${paths.length} files.`;

    const ok = await confirm({ title: "Delete files?", message: msg });
    if (!ok) return;

    const urls = files
      .filter((f) => paths.includes(f.pathname) && f.url)
      .map((f) => f.url as string);

    if (urls.length === 0) {
      toast("No valid URLs found for the selected files.", "error");
      return;
    }

    try {
      const res = await fetch("/api/blob/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storageKey}`,
        },
        body: JSON.stringify({ urls }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFiles((prev) => prev.filter((f) => !paths.includes(f.pathname)));
        setSelected((prev) => {
          const next = new Set(prev);
          for (const p of paths) next.delete(p);
          return next;
        });
        toast(`Deleted ${paths.length} file(s)`, "success");
      } else {
        toast(`Delete failed: ${data.error}`, "error");
      }
    } catch (err: any) {
      toast(`Delete error: ${err.message}`, "error");
    }
  };

  const toggleSelect = (pathname: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pathname)) next.delete(pathname);
      else next.add(pathname);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === files.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(files.map((f) => f.pathname)));
    }
  };

  const deleteSelected = () => {
    deleteItems(Array.from(selected));
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
              <span className="text-green-400 font-medium">Connected</span>
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
              uploadProgress={uploadProgress}
              setUploadProgress={setUploadProgress}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selected.size > 0 && (
                  <button
                    onClick={deleteSelected}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                  >
                    Delete {selected.size} selected
                  </button>
                )}
              </div>
              <button
                onClick={downloadJson}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
              >
                Download JSON
              </button>
            </div>

            <FileList
              files={files}
              deleteItems={deleteItems}
              selected={selected}
              toggleSelect={toggleSelect}
              toggleSelectAll={toggleSelectAll}
            />
          </>
        )}

        <HowToUse />
      </div>
    </div>
  );
}

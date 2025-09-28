import { Eye, EyeOff, Upload } from "lucide-react";
import { useState } from "react";

interface Props {
  storageKey: string;
  setStorageKey: (v: string) => void;
  loading: boolean;
  connectToStorage: () => void;
}

export default function TokenInput({
  storageKey,
  setStorageKey,
  loading,
  connectToStorage,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-4 bg-gray-800 p-6 rounded-lg">
      <label className="block text-sm font-medium text-gray-300">
        Vercel Blob Storage Token
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={storageKey}
          onChange={(e) => setStorageKey(e.target.value)}
          placeholder="blob_rw_xxxxx"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg pr-10 focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <button
        onClick={connectToStorage}
        disabled={loading || !storageKey.trim()}
        className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
        ) : (
          <Upload size={16} />
        )}
        {loading ? "Connecting..." : "Connect"}
      </button>
    </div>
  );
}

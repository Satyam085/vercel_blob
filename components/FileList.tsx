"use client";
import { File } from "lucide-react";
import type { BlobFile } from "./BlobManager";
import FileItem from "./FileItem";

interface Props {
  files: BlobFile[];
  deleteFile: (pathname: string) => void;
}

export default function FileList({ files, deleteFile }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-100 mb-4">
        Files ({files.length})
      </h2>
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        {files.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <File size={48} className="mx-auto mb-2 text-gray-600" />
            <p>No files found. Upload something to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {files.map((file) => (
              <FileItem
                key={file.pathname}
                file={file}
                deleteFile={deleteFile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { Folder, FolderOpen, Trash2 } from "lucide-react";
import { useState } from "react";
import type { BlobFile } from "./BlobManager";
import FileItem from "./FileItem";

interface Props {
  files: BlobFile[];
  deleteFile: (pathname: string) => void;
}

/**
 * Build a nested tree from flat blob pathnames
 */
function buildTree(files: BlobFile[]) {
  const root: any = {};
  files.forEach((file) => {
    const parts = file.pathname.split("/");
    let current = root;
    parts.forEach((part, idx) => {
      if (idx === parts.length - 1) {
        current[part] = file; // file
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });
  return root;
}

/**
 * Recursively collect all file paths in a folder
 */
function collectFiles(node: any): string[] {
  let paths: string[] = [];
  Object.values(node).forEach((value: any) => {
    if (typeof value === "object" && "pathname" in value) {
      paths.push(value.pathname);
    } else {
      paths = paths.concat(collectFiles(value));
    }
  });
  return paths;
}
function FolderNode({
  name,
  children,
  level,
  deleteFile,
}: {
  name: string;
  children: any;
  level: number;
  deleteFile: (pathname: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleDeleteFolder = () => {
    const allFiles = collectFiles(children);
    if (
      confirm(
        `Are you sure you want to delete the entire folder "${name}" and ${allFiles.length} file(s)?`,
      )
    ) {
      allFiles.forEach((pathname) => deleteFile(pathname));
    }
  };

  return (
    <div className="ml-4">
      {/* Folder header row */}
      <div className="flex items-center justify-between hover:bg-gray-700 rounded px-2 py-1">
        <button
          className="flex items-center gap-2 text-gray-300 hover:text-indigo-400"
          onClick={() => setOpen(!open)}
        >
          {open ? <FolderOpen size={22} /> : <Folder size={22} />}
          <span className="font-medium">{name}</span>
        </button>

        <button
          onClick={handleDeleteFolder}
          className="p-1 text-gray-400 hover:text-red-400 rounded"
          title="Delete folder"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Children */}
      {open && (
        <div className="ml-4 border-l border-gray-700 pl-2">
          {Object.entries(children).map(([key, value]) =>
            typeof value === "object" && "pathname" in value ? (
              <FileItem
                key={(value as BlobFile).pathname}
                file={value as BlobFile}
                deleteFile={deleteFile}
              />
            ) : (
              <FolderNode
                key={key}
                name={key}
                children={value}
                level={level + 1}
                deleteFile={deleteFile}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default function FileList({ files, deleteFile }: Props) {
  const tree = buildTree(files);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-100 mb-4">
        Files ({files.length})
      </h2>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        {files.length === 0 ? (
          <p className="text-gray-500 text-center">No files uploaded yet.</p>
        ) : (
          Object.entries(tree).map(([key, value]) =>
            typeof value === "object" && "pathname" in value ? (
              <FileItem
                key={(value as BlobFile).pathname}
                file={value as BlobFile}
                deleteFile={deleteFile}
              />
            ) : (
              <FolderNode
                key={key}
                name={key}
                children={value}
                level={0}
                deleteFile={deleteFile}
              />
            ),
          )
        )}
      </div>
    </div>
  );
}

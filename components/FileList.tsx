"use client";
import { Folder, FolderOpen, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { BlobFile } from "./BlobManager";
import FileItem from "./FileItem";

function buildTree(files: BlobFile[]) {
  const root: any = {};
  files.forEach((file) => {
    const parts = file.pathname.split("/");
    let current = root;
    parts.forEach((part, idx) => {
      if (idx === parts.length - 1) {
        current[part] = file;
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });
  return root;
}

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
  deleteItems,
  searchQuery,
  sortKey,
}: {
  name: string;
  children: any;
  deleteItems: (paths: string[]) => void;
  searchQuery: string;
  sortKey: "name" | "size" | "date";
}) {
  const [open, setOpen] = useState(false);

  const handleDeleteFolder = () => {
    const allFiles = collectFiles(children);
    deleteItems(allFiles);
  };

  const sortedEntries = Object.entries(children).sort(
    ([aKey, aVal], [bKey, bVal]) => {
      const aIsFile = typeof aVal === "object" && "pathname" in aVal;
      const bIsFile = typeof bVal === "object" && "pathname" in bVal;

      if (aIsFile && bIsFile) {
        const aFile = aVal as BlobFile;
        const bFile = bVal as BlobFile;
        if (sortKey === "name")
          return aFile.pathname.localeCompare(bFile.pathname);
        if (sortKey === "size") return aFile.size - bFile.size;
        if (sortKey === "date")
          return (
            new Date(aFile.uploadedAt).getTime() -
            new Date(bFile.uploadedAt).getTime()
          );
      }
      return aKey.localeCompare(bKey);
    },
  );

  return (
    <div className="ml-4">
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

      {open && (
        <div className="ml-4 border-l border-gray-700 pl-2">
          {sortedEntries.map(([key, value]) => {
            if (typeof value === "object" && "pathname" in value) {
              const file = value as BlobFile;
              if (
                !file.pathname.toLowerCase().includes(searchQuery.toLowerCase())
              )
                return null;
              return (
                <FileItem
                  key={file.pathname}
                  file={file}
                  deleteItems={deleteItems}
                />
              );
            } else {
              return (
                <FolderNode
                  key={key}
                  name={key}
                  children={value}
                  deleteItems={deleteItems}
                  searchQuery={searchQuery}
                  sortKey={sortKey}
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
}

export default function FileList({
  files,
  deleteItems,
}: {
  files: BlobFile[];
  deleteItems: (paths: string[]) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "size" | "date">("name");
  const tree = useMemo(() => buildTree(files), [files]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-100 mb-4">
        Files ({files.length})
      </h2>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 pl-9"
          />
          <Search size={16} className="absolute left-3 top-3 text-gray-500" />
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as any)}
          className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200"
        >
          <option value="name">Sort: Name</option>
          <option value="size">Sort: Size</option>
          <option value="date">Sort: Date</option>
        </select>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        {files.length === 0 ? (
          <p className="text-gray-500 text-center">No files uploaded yet.</p>
        ) : (
          Object.entries(tree).map(([key, value]) =>
            typeof value === "object" && "pathname" in value ? (
              (value as BlobFile).pathname
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) && (
                <FileItem
                  key={(value as BlobFile).pathname}
                  file={value as BlobFile}
                  deleteItems={deleteItems}
                />
              )
            ) : (
              <FolderNode
                key={key}
                name={key}
                children={value}
                deleteItems={deleteItems}
                searchQuery={searchQuery}
                sortKey={sortKey}
              />
            ),
          )
        )}
      </div>
    </div>
  );
}

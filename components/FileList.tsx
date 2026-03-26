"use client";
import { Folder, FolderOpen, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { BlobFile } from "./BlobManager";
import FileItem from "./FileItem";

function buildTree(files: BlobFile[]) {
  const root: Record<string, any> = {};
  for (const file of files) {
    const parts = file.pathname.split("/");
    let current = root;
    for (let idx = 0; idx < parts.length; idx++) {
      const part = parts[idx];
      if (idx === parts.length - 1) {
        current[part] = file;
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    }
  }
  return root;
}

function collectFiles(node: Record<string, any>): string[] {
  const paths: string[] = [];
  for (const value of Object.values(node)) {
    if (typeof value === "object" && value !== null && "pathname" in value) {
      paths.push(value.pathname);
    } else if (typeof value === "object" && value !== null) {
      paths.push(...collectFiles(value));
    }
  }
  return paths;
}

function FolderNode({
  name,
  children,
  deleteItems,
  searchQuery,
  sortKey,
  selected,
  toggleSelect,
}: {
  name: string;
  children: Record<string, any>;
  deleteItems: (paths: string[]) => void;
  searchQuery: string;
  sortKey: "name" | "size" | "date";
  selected: Set<string>;
  toggleSelect: (pathname: string) => void;
}) {
  const [open, setOpen] = useState(true);

  const handleDeleteFolder = () => {
    const allFiles = collectFiles(children);
    deleteItems(allFiles);
  };

  const sortedEntries = Object.entries(children).sort(
    ([aKey, aVal], [bKey, bVal]) => {
      const aIsFile =
        typeof aVal === "object" && aVal !== null && "pathname" in aVal;
      const bIsFile =
        typeof bVal === "object" && bVal !== null && "pathname" in bVal;

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
    <div className="ml-2">
      <div className="flex items-center justify-between hover:bg-gray-700/50 rounded px-2 py-1.5">
        <button
          className="flex items-center gap-2 text-gray-300 hover:text-indigo-400"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <FolderOpen size={18} className="text-indigo-400" />
          ) : (
            <Folder size={18} className="text-gray-400" />
          )}
          <span className="font-medium text-sm">{name}</span>
        </button>
        <button
          onClick={handleDeleteFolder}
          className="p-1 text-gray-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100"
          title="Delete folder"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {open && (
        <div className="ml-4 border-l border-gray-700/50 pl-1">
          {sortedEntries.map(([key, value]) => {
            if (
              typeof value === "object" &&
              value !== null &&
              "pathname" in value
            ) {
              const file = value as BlobFile;
              if (
                searchQuery &&
                !file.pathname.toLowerCase().includes(searchQuery.toLowerCase())
              )
                return null;
              return (
                <FileItem
                  key={file.pathname}
                  file={file}
                  deleteItems={deleteItems}
                  isSelected={selected.has(file.pathname)}
                  toggleSelect={toggleSelect}
                />
              );
            }
            return (
              <FolderNode
                key={key}
                name={key}
                children={value as Record<string, any>}
                deleteItems={deleteItems}
                searchQuery={searchQuery}
                sortKey={sortKey}
                selected={selected}
                toggleSelect={toggleSelect}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FileList({
  files,
  deleteItems,
  selected,
  toggleSelect,
  toggleSelectAll,
}: {
  files: BlobFile[];
  deleteItems: (paths: string[]) => void;
  selected: Set<string>;
  toggleSelect: (pathname: string) => void;
  toggleSelectAll: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "size" | "date">("name");
  const tree = useMemo(() => buildTree(files), [files]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-100">
          Files ({files.length})
        </h2>
        {files.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selected.size === files.length && files.length > 0}
              onChange={toggleSelectAll}
              className="accent-indigo-500 w-4 h-4 cursor-pointer"
            />
            Select all
          </label>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 pl-9 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
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

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-2">
        {files.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No files uploaded yet.
          </p>
        ) : (
          Object.entries(tree).map(([key, value]) =>
            typeof value === "object" &&
            value !== null &&
            "pathname" in value ? (
              (!searchQuery ||
                (value as BlobFile).pathname
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())) && (
                <FileItem
                  key={(value as BlobFile).pathname}
                  file={value as BlobFile}
                  deleteItems={deleteItems}
                  isSelected={selected.has((value as BlobFile).pathname)}
                  toggleSelect={toggleSelect}
                />
              )
            ) : (
              <FolderNode
                key={key}
                name={key}
                children={value as Record<string, any>}
                deleteItems={deleteItems}
                searchQuery={searchQuery}
                sortKey={sortKey}
                selected={selected}
                toggleSelect={toggleSelect}
              />
            ),
          )
        )}
      </div>
    </div>
  );
}

# 🚀 [![Deployed on Vercel](https://vercel.com/button)](https://vercel-blob-manager.vercel.app/)
A **Next.js App Router** project to connect with **Vercel Blob Storage**, upload files/folders, preview them, and manage your blobs with a modern UI.  

## ✨ Features  

- 🔑 Connect with your own **Vercel Blob Token** (kept only in your browser).  
- 📂 **Folder-aware file explorer** (expand/collapse).  
- 🖼 Inline **image thumbnails** + modal previews.  
- 📄 **Text/Markdown previews** in a modal.  
- 🔍 **Search & sort** by name, size, or upload date.  
- 🗑 **Delete files or entire folders** (batch delete support).  
- 📥 **Upload files or whole folders** (structure preserved).  
- 📋 One-click **copy file URL**.  
- 📑 **Export JSON** of all file URLs (`files.json`).  
- 🌗 Dark UI with TailwindCSS.  

---

## 🚀 Getting Started  

### 1. Clone the repo  

```bash
git clone https://github.com/satyam085/vercel-blob.git
cd vercel-blob
```

### 2. Install dependencies  

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Run dev server  

```bash
pnpm dev
# http://localhost:3000
```

---

## 🔑 Usage  

1. Get a **Vercel Blob Token** from your Vercel Dashboard.  
   - Must be a **read/write token** (`blob_rw_xxxxx`).  
2. Paste it in the UI and connect.  
3. Upload, preview, download, or delete files/folders.  
4. Export file URLs as `files.json`.  

⚠️ **Note:**  
- Tokens are **not stored on the server**.  
- Your token is saved **only in localStorage** with a 7-day expiry.  

---

## 📁 Project Structure  

```
app/
 └── api/
      ├── blob/
      │    ├── route.ts          # List + upload
      │    ├── delete/route.ts   # Batch & single delete
      │    └── [...pathname]/route.ts # Get file info
components/
 ├── BlobManager.tsx  # Main UI container
 ├── FileList.tsx     # Folder-aware explorer
 ├── FileItem.tsx     # File row + previews
 ├── PreviewModal.tsx # Modal for previews
 ├── TokenInput.tsx   # Connect with token
 ├── UploadSection.tsx# Upload files/folders
 └── HowToUse.tsx     # Help instructions
```

---

## 🛠️ Tech Stack  

- [Next.js (App Router)](https://nextjs.org/)  
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)  
- [TailwindCSS](https://tailwindcss.com/)  

## ⚖️ License  

MIT © 2025 [Satyam Singh](https://github.com/satyam085)  
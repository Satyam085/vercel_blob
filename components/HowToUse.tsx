export default function HowToUse() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-indigo-400 mb-2">How to use:</h3>
      <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
        <li>Get your Vercel Blob Storage token from the dashboard</li>
        <li>Paste it above and click "Connect"</li>
        <li>Upload entire folders or individual files</li>
        <li>Manage files with view/download & delete</li>
      </ol>
    </div>
  );
}

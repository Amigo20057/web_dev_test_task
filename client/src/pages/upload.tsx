import { ArrowBigUp, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import axios from "../utils/axios";

interface UploadResult {
  orders: number;
  totalTax: number;
  errors: number;
}

export default function UploadFile() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const selected = e.target.files[0];

    setFile(selected);
    setFileName(selected.name);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/orders/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[600px] bg-[var(--card)] border border-[var(--main-border)] rounded-[var(--main-radius)] shadow-[var(--main-shadows)] p-8 flex flex-col gap-6">
      <label className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-[var(--main-border)] rounded-[var(--main-radius)] py-12 cursor-pointer hover:bg-gray-50 transition">
        <ArrowBigUp />

        <div className="text-center">
          <p className="text-[var(--main-txt-color)] font-medium">
            Drag CSV file here or click to upload
          </p>
          <p className="text-sm text-[var(--second-txt-color)] mt-1">
            Supported format: .csv
          </p>
        </div>

        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {fileName && (
        <div className="text-sm text-[var(--main-txt-color)]">
          Selected file: <span className="font-medium">{fileName}</span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="h-11 rounded-[var(--main-radius)] bg-[var(--accent)] text-white font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        {loading ? "Processing..." : "Upload & Process"}
      </button>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {result && (
        <div className="mt-6 border border-green-200 bg-green-50 rounded-[var(--main-radius)] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check />
            </div>

            <div>
              <p className="font-medium text-green-700">
                File processed successfully
              </p>
              <p className="text-sm text-green-600">
                Orders imported and taxes calculated
              </p>
            </div>
          </div>

          <div className="h-px bg-green-200" />

          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-[var(--second-txt-color)]">Orders</p>
              <p className="text-[var(--main-txt-color)] font-medium">
                {result.orders}
              </p>
            </div>

            <div>
              <p className="text-[var(--second-txt-color)]">Total Tax</p>
              {result.totalTax !== undefined && (
                <p>${Number(result.totalTax).toFixed(2)}</p>
              )}
            </div>

            <div>
              <p className="text-[var(--second-txt-color)]">Errors</p>
              <p className="text-[var(--main-txt-color)] font-medium">
                {result.errors}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

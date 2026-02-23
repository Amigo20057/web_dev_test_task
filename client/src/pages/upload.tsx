import { ArrowBigUp, Check } from "lucide-react";
import { useState } from "react";

export default function UploadFile() {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setFileName(e.target.files[0].name);
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

      <button className="h-11 rounded-[var(--main-radius)] bg-[var(--accent)] text-white font-medium hover:opacity-90 transition">
        Upload & Process
      </button>

      {fileName && (
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

          {/* Divider */}
          <div className="h-px bg-green-200" />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-[var(--second-txt-color)]">Orders</p>
              <p className="text-[var(--main-txt-color)] font-medium">124</p>
            </div>

            <div>
              <p className="text-[var(--second-txt-color)]">Total Tax</p>
              <p className="text-[var(--main-txt-color)] font-medium">$2,430</p>
            </div>

            <div>
              <p className="text-[var(--second-txt-color)]">Errors</p>
              <p className="text-[var(--main-txt-color)] font-medium">0</p>
            </div>
          </div>

          {/* Action */}
          <button className="self-start mt-2 px-4 py-2 text-sm rounded-[var(--main-radius)] bg-[var(--accent)] text-white hover:opacity-90 transition">
            View Orders
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

export default function ManualCreateForm() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [saved, setSaved] = useState(false);

  const tax = subtotal ? (Number(subtotal) * 0.1).toFixed(2) : "0.00";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);

    // тут можно отправлять на API
  };

  return (
    <div className="w-[600px] bg-[var(--card)] border border-[var(--main-border)] rounded-[var(--main-radius)] shadow-[var(--main-shadows)] p-8 flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Latitude */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[var(--second-txt-color)]">
            Latitude
          </label>
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="h-11 px-4 rounded-[var(--main-radius)] border border-[var(--main-border)] focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter latitude"
            required
          />
        </div>

        {/* Longitude */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[var(--second-txt-color)]">
            Longitude
          </label>
          <input
            type="number"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="h-11 px-4 rounded-[var(--main-radius)] border border-[var(--main-border)] focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter longitude"
            required
          />
        </div>

        {/* Subtotal */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[var(--second-txt-color)]">
            Subtotal
          </label>
          <input
            type="number"
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
            className="h-11 px-4 rounded-[var(--main-radius)] border border-[var(--main-border)] focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter subtotal"
            required
          />
        </div>

        {/* Calculated Tax */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[var(--second-txt-color)]">
            Calculated Tax (10%)
          </label>
          <div className="h-11 px-4 flex items-center rounded-[var(--main-radius)] bg-[var(--white-bg)] border border-[var(--main-border)] text-[var(--main-txt-color)] font-medium">
            ${tax}
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="h-11 mt-2 rounded-[var(--main-radius)] bg-[var(--accent)] text-white font-medium hover:opacity-90 transition"
        >
          Save Order
        </button>
      </form>

      {/* Success */}
      {saved && (
        <div className="mt-4 p-4 rounded-[var(--main-radius)] bg-green-50 border border-green-200 text-green-700 text-sm">
          Order successfully created.
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import useOrders from "../hooks/useOrders";
import type { IOrder } from "../types/order.interface";
import Table from "../components/table";
import Search from "../components/ui/search";
import { Trash } from "lucide-react";

export default function OrdersPage() {
  const [order, setOrder] = useState<"ASC" | "DESC">("ASC");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const { orders, loading, hasMore, fetchMore, removeAllOrders } = useOrders(
    20,
    order,
    search,
  );

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        if (hasMore && !loading) fetchMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, fetchMore]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedOrder(null);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    if (typeof value === "number") {
      return value.toFixed(2);
    }

    if (typeof value === "string" && value.includes("T")) {
      return new Date(value).toLocaleString();
    }

    if (typeof value === "object") {
      return (
        <div className="ml-4 space-y-1 border-l pl-3">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-gray-600">{k}</span>
              <span>{renderValue(v)}</span>
            </div>
          ))}
        </div>
      );
    }

    return String(value);
  };

  return (
    <div className="p-8">
      <div className="mb-4 flex justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setOrder("ASC")}
            className={`px-4 py-2 rounded ${
              order === "ASC" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            ID ↑
          </button>

          <button
            onClick={() => setOrder("DESC")}
            className={`px-4 py-2 rounded ${
              order === "DESC" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            ID ↓
          </button>

          <Search onChange={setSearch} />
        </div>

        <button
          onClick={removeAllOrders}
          className="px-4 py-2 rounded bg-red-500"
        >
          <Trash color="white" />
        </button>
      </div>

      <Table<IOrder>
        isLoading={loading}
        data={orders}
        onView={(row) => setSelectedOrder(row)}
        options={[
          { title: "Order ID", key: "id", width: "120px" },
          { title: "County", key: "county", width: "150px" },
          { title: "Latitude", key: "latitude", width: "160px" },
          { title: "Longitude", key: "longitude", width: "160px" },
          { title: "Subtotal", key: "subtotal", width: "140px" },
          { title: "Tax", key: "tax_amount", width: "140px" },
          { title: "Total", key: "total_amount", width: "140px" },
        ]}
      />

      {loading && (
        <div className="text-center py-6 text-gray-500">Loading more...</div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Order #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-black text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {Object.entries(selectedOrder).map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <div className="font-medium mb-1">{key}</div>
                  <div>{renderValue(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

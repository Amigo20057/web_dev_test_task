import { useEffect, useState } from "react";
import useOrders from "../hooks/useOrders";
import type { IOrder } from "../types/order.interface";
import Table from "../components/table";
import Search from "../components/ui/search";
import { Trash } from "lucide-react";

export default function OrdersPage() {
  const [order, setOrder] = useState<"ASC" | "DESC">("ASC");
  const [search, setSearch] = useState("");

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
        options={[
          { title: "Order ID", key: "id", width: "120px" },
          { title: "County", key: "county", width: "150px" },
          { title: "Latitude", key: "latitude", width: "160px" },
          { title: "Longitude", key: "longitude", width: "160px" },
          { title: "Subtotal", key: "subtotal", width: "140px" },
          { title: "Tax", key: "tax_amount", width: "140px" },
          { title: "Total", key: "total_amount", width: "140px" },
        ]}
        data={orders}
      />

      {loading && (
        <div className="text-center py-6 text-gray-500">Loading more...</div>
      )}
    </div>
  );
}

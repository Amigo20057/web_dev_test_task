import Table from "../components/table";
import type { IOrder } from "../types/order.interface";

export default function OrdersPage() {
  return (
    <div>
      <Table<IOrder>
        isLoading={false}
        options={[
          { title: "Order ID", key: "id", width: "150px" },
          { title: "Latitude", key: "lat", width: "150px" },
          { title: "Longitude", key: "lon", width: "150px" },
          { title: "Subtotal", key: "subtotal", width: "150px" },
          { title: "Tax", key: "tax", width: "150px" },
        ]}
        data={[
          { id: 1, lat: 50.45, lon: 30.52, subtotal: 120, tax: 12 },
          { id: 2, lat: 49.83, lon: 24.03, subtotal: 80, tax: 8 },
        ]}
      />
    </div>
  );
}

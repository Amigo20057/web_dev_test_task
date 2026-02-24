import { useEffect, useCallback, useState } from "react";
import axios from "../utils/axios";
import type { IOrder } from "../types/order.interface";

export default function useOrders(
  limit: number,
  order: "ASC" | "DESC",
  search: string,
) {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMore = useCallback(
    async (reset = false) => {
      if (loading) return;

      setLoading(true);

      try {
        const response = await axios.get("/orders", {
          params: {
            limit,
            cursor: reset ? null : cursor,
            order,
            search,
          },
        });

        const newOrders = response.data.data;

        setOrders((prev) => (reset ? newOrders : [...prev, ...newOrders]));

        setCursor(response.data.nextCursor);
        setHasMore(newOrders.length === limit);
      } finally {
        setLoading(false);
      }
    },
    [cursor, order, search, limit, loading],
  );

  const removeAllOrders = useCallback(async () => {
    setLoading(true);
    try {
      await axios.delete("/orders");

      setOrders([]);
      setCursor(null);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    fetchMore(true);
  }, [order, search]);

  return { orders, loading, hasMore, fetchMore, removeAllOrders };
}

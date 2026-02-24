export interface IOrder {
  id: number;
  longitude: number;
  latitude: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  county: string;
  timestamp: string;
}

export interface IOrdersResponse {
  data: IOrder[];
  nextCursor: number;
}

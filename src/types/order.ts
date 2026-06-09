export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  thumbnail: string;
}

export interface OrderAddress {
  name: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type ProfileAddress = OrderAddress & {
  id: string;
  type: string;
};

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  address: OrderAddress;
  paymentMethod: string;
  paymentStatus: "Pending" | "Paid" | "Refunded";
  status: "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
  timeline: { status: string; date: string; description: string }[];
  couponUsed?: string;
}

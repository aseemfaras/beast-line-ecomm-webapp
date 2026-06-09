export interface ReturnRequest {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  thumbnail: string;
  reason: string;
  evidenceImage?: string | null;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  customerName: string;
}

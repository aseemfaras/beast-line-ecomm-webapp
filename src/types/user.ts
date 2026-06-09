export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "admin" | "customer" | "super_admin";
  blocked: boolean;
  spending: number;
  ordersCount: number;
}

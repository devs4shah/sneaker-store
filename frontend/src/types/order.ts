export interface CreateOrderRequest {
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  sneakerName: string;
  sneakerPrice: number;
  quantity: number;
  imageUrl: string | null;
  lineSubtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  totalQuantity: number;
  items: OrderItem[];
  createdAt: string;
}

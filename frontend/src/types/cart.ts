export interface CartItem {
  id: string;
  sneakerId: string;
  sneakerName: string;
  brand: string;
  imageUrl: string | null;
  size: number;
  quantity: number;
  priceAtAddition: number;
  currentUnitPrice: number;
  lineSubtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

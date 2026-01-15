import type { Book } from "../../shared/types";

const CART_STORAGE_KEY = "library_cart";

export interface CartItem {
  book: Book;
  quantity: number;
}

// Helper function to dispatch cart change event
const dispatchCartChangeEvent = () => {
  window.dispatchEvent(new CustomEvent('cartChange'));
};

export const getCart = (): CartItem[] => {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const addToCart = (book: Book, quantity: number = 1): void => {
  const cart = getCart();
  const existingItem = cart.find(item => item.book.id === book.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ book, quantity });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  dispatchCartChangeEvent();
};

export const updateCartItemQuantity = (bookId: number, quantity: number): void => {
  const cart = getCart();
  const item = cart.find(item => item.book.id === bookId);

  if (item) {
    if (quantity <= 0) {
      removeFromCart(bookId);
    } else {
      item.quantity = quantity;
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      dispatchCartChangeEvent();
    }
  }
};

export const removeFromCart = (bookId: number): void => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.book.id !== bookId);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
  dispatchCartChangeEvent();
};

export const clearCart = (): void => {
  localStorage.removeItem(CART_STORAGE_KEY);
  dispatchCartChangeEvent();
};

export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.book.price * item.quantity), 0);
};

export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CartItem } from "../utils/cartStorage";
import { getCart, updateCartItemQuantity, removeFromCart, clearCart, getCartTotal } from "../utils/cartStorage";
import { createOrder, getCurrentUserEmail } from "../utils/orderStorage";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const handleQuantityChange = (bookId: number, newQuantity: number) => {
    updateCartItemQuantity(bookId, newQuantity);
    setCartItems(getCart());
  };

  const handleRemove = (bookId: number, bookTitle: string) => {
    const confirmed = window.confirm(`Remove "${bookTitle}" from cart?`);
    if (confirmed) {
      removeFromCart(bookId);
      setCartItems(getCart());
    }
  };

  const handleClearCart = () => {
    const confirmed = window.confirm("Clear all items from cart?");
    if (confirmed) {
      clearCart();
      setCartItems([]);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const confirmed = window.confirm(`Proceed with checkout for $${getCartTotal().toFixed(2)}?`);
    if (confirmed) {
      // Create order from cart items
      const orderItems = cartItems.map((item, index) => ({
        id: index + 1,
        bookId: item.book.id,
        bookTitle: item.book.title,
        bookAuthor: item.book.author,
        quantity: item.quantity,
        price: item.book.price,
      }));

      const order = createOrder({
        totalAmount: getCartTotal(),
        orderDate: new Date().toISOString(),
        status: "PENDING",
        customerEmail: getCurrentUserEmail(),
        items: orderItems,
      });

      console.log("Order created:", order);
      alert("Order placed successfully!");
      clearCart();
      setCartItems([]);
      navigate("/client/orders");
    }
  };

  const total = getCartTotal();

  return (
    <div className="mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Shopping Cart</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </p>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-600 dark:bg-gray-700 text-white text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined text-sm mr-1">delete_sweep</span>
            Clear All
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">
            shopping_cart
          </span>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your cart is empty.
          </p>
          <Link
            to="/client/books"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-[#1173d4] text-white font-bold hover:bg-[#1173d4]/90 transition-colors"
          >
            <span className="material-symbols-outlined mr-2">search</span>
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.book.id}
                className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Book Cover */}
                  <Link
                    to={`/client/books/${item.book.id}`}
                    className="flex-shrink-0"
                  >
                    {item.book.coverImage ? (
                      <img
                        src={item.book.coverImage}
                        alt={`Cover of ${item.book.title}`}
                        className="w-24 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-24 h-32 bg-gradient-to-br from-[#1173d4]/20 to-[#1173d4]/5 rounded-lg flex items-center justify-center ${item.book.coverImage ? 'hidden' : ''}`}>
                      <span className="material-symbols-outlined text-4xl text-[#1173d4]/40">
                        book
                      </span>
                    </div>
                  </Link>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/client/books/${item.book.id}`}
                      className="text-xl font-bold text-gray-900 dark:text-white hover:text-[#1173d4] dark:hover:text-[#1173d4] transition-colors block mb-1"
                    >
                      {item.book.title}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">by {item.book.author}</p>

                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Quantity Control */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.book.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.book.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ${item.book.price} × {item.quantity}
                        </span>
                        <span className="text-lg font-bold text-[#1173d4]">
                          ${(item.book.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.book.id, item.book.title)}
                        className="ml-auto inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm mr-1">delete</span>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-600 dark:text-green-400">Free</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-[#1173d4]">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#1173d4] text-white font-bold text-base hover:bg-[#1173d4]/90 transition-all shadow-md mb-3"
              >
                <span className="material-symbols-outlined mr-2">shopping_bag</span>
                Checkout
              </button>

              <Link
                to="/client/books"
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-base hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined mr-2">arrow_back</span>
                Continue Shopping
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="material-symbols-outlined text-base">info</span>
                  <p>Orders are typically delivered within 2-3 business days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

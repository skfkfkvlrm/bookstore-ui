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
    const confirmed = window.confirm(`장바구니에서 "${bookTitle}"을(를) 제거할까요?`);
    if (confirmed) {
      removeFromCart(bookId);
      setCartItems(getCart());
    }
  };

  const handleClearCart = () => {
    const confirmed = window.confirm("장바구니의 모든 품목을 삭제할까요?");
    if (confirmed) {
      clearCart();
      setCartItems([]);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("장바구니가 비어 있습니다.");
      return;
    }

    const confirmed = window.confirm(`총 $${getCartTotal().toFixed(2)} 결제를 진행할까요?`);
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
      alert("주문이 정상적으로 접수되었습니다!");
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">장바구니</h1>
          <p className="text-gray-600 dark:text-gray-400">총 {cartItems.length}개 항목</p>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-600 dark:bg-gray-700 text-white text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined text-sm mr-1">delete_sweep</span>
            전체 비우기
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">
            shopping_cart
          </span>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            장바구니가 비어 있습니다.
          </p>
          <Link
            to="/client/books"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold hover:bg-[#2f9e5f]/90 transition-colors"
          >
            <span className="material-symbols-outlined mr-2">search</span>
            도서 둘러보기
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
                        alt={`${item.book.title} 표지 이미지`}
                        className="w-24 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-24 h-32 bg-gradient-to-br from-[#2f9e5f]/20 to-[#2f9e5f]/5 rounded-lg flex items-center justify-center ${item.book.coverImage ? 'hidden' : ''}`}>
                      <span className="material-symbols-outlined text-4xl text-[#2f9e5f]/40">
                        book
                      </span>
                    </div>
                  </Link>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/client/books/${item.book.id}`}
                      className="text-xl font-bold text-gray-900 dark:text-white hover:text-[#2f9e5f] dark:hover:text-[#2f9e5f] transition-colors block mb-1"
                    >
                      {item.book.title}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">저자 {item.book.author}</p>

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
                        <span className="text-lg font-bold text-[#2f9e5f]">
                          ${(item.book.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.book.id, item.book.title)}
                        className="ml-auto inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm mr-1">delete</span>
                        삭제
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">주문 요약</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>소계</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>배송비</span>
                  <span className="text-green-600 dark:text-green-400">무료</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>총액</span>
                  <span className="text-[#2f9e5f]">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold text-base hover:bg-[#2f9e5f]/90 transition-all shadow-md mb-3"
              >
                <span className="material-symbols-outlined mr-2">shopping_bag</span>
                결제하기
              </button>

              <Link
                to="/client/books"
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-base hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined mr-2">arrow_back</span>
                계속 쇼핑하기
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="material-symbols-outlined text-base">info</span>
                  <p>주문 상품은 영업일 기준 2~3일 내 배송됩니다.</p>
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

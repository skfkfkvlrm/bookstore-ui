import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, getCartTotal, clearCart } from "../utils/cartStorage";
import { getCurrentUser } from "../utils/authStorage";
import { orderService } from "../../services/orderService";
import axios from "axios";
import type { ApiError } from "../../shared/types";

const PAYMENT_METHODS = [
  { value: "CREDIT_CARD", label: "신용카드" },
  { value: "BANK_TRANSFER", label: "계좌이체" },
  { value: "KAKAO_PAY", label: "카카오페이" },
  { value: "NAVER_PAY", label: "네이버페이" },
  { value: "TOSS_PAY", label: "토스페이" },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]["value"];

const Checkout = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const cartItems = getCart();
  const total = getCartTotal();

  const [recipientName, setRecipientName] = useState(user?.name ?? "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [deliveryMemo, setDeliveryMemo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">shopping_cart</span>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">장바구니가 비어 있습니다.</p>
        <Link to="/client/books" className="inline-flex items-center px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold hover:bg-[#2f9e5f]/90 transition-colors">
          도서 둘러보기
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/client/login");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await orderService.createOrder({
        memberId: user.id,
        items: cartItems.map((item) => ({ bookId: item.book.id, quantity: item.quantity })),
        payment: { method: paymentMethod, amount: total },
        delivery: {
          recipientName,
          phoneNumber,
          address,
          addressDetail: addressDetail || undefined,
          deliveryMemo: deliveryMemo || undefined,
        },
      });
      clearCart();
      navigate("/client/orders");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        setError(apiError?.message ?? "주문 처리 중 오류가 발생했습니다.");
      } else {
        setError("서버에 연결할 수 없습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/client/cart" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">결제하기</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">배송 정보와 결제 방법을 입력해주세요</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Delivery + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2f9e5f]">local_shipping</span>
                배송 정보
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">수령인 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">연락처 <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">주소 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
                    placeholder="기본 주소를 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">상세 주소</label>
                  <input
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
                    placeholder="동, 호수 등"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">배송 메모</label>
                  <input
                    type="text"
                    value={deliveryMemo}
                    onChange={(e) => setDeliveryMemo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
                    placeholder="배송 시 요청사항 (선택)"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2f9e5f]">payment</span>
                결제 수단
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === method.value
                        ? "border-[#2f9e5f] bg-[#2f9e5f]/10 text-[#2f9e5f]"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#2f9e5f]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">주문 상품</h2>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.book.id} className="flex gap-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.book.title}</p>
                      <p className="text-gray-500 dark:text-gray-400">수량 {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#2f9e5f] whitespace-nowrap">
                      {(item.book.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>소계</span>
                  <span>{total.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>배송비</span>
                  <span className="text-green-600 dark:text-green-400">무료</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>총 결제 금액</span>
                  <span className="text-[#2f9e5f]">{total.toLocaleString()}원</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold text-base hover:bg-[#2f9e5f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined mr-2">shopping_bag</span>
                )}
                {submitting ? "처리 중..." : `${total.toLocaleString()}원 결제하기`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, getCartTotal, clearCart } from "../utils/cartStorage";
import { getCurrentUser } from "../utils/authStorage";
import { orderService } from "../../services/orderService";
import { paymentService } from "../../services/paymentService";
import axios from "axios";
import type { ApiError, Order, PaymentResponse } from "../../shared/types";

const PAYMENT_METHODS = [
  { value: "CREDIT_CARD", label: "신용/체크카드", icon: "credit_card" },
  { value: "TOSS_PAY", label: "토스페이", icon: "account_balance_wallet" },
  { value: "KAKAO_PAY", label: "카카오페이", icon: "chat_bubble" },
  { value: "NAVER_PAY", label: "네이버페이", icon: "payments" },
  { value: "BANK_TRANSFER", label: "실시간 계좌이체", icon: "account_balance" },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]["value"];

const CARD_COMPANIES = [
  "토스뱅크", "현대카드", "삼성카드", "KB국민카드", "신한카드", "비씨카드", "하나카드", "롯데카드"
];

const Checkout = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const cartItems = getCart();
  const total = getCartTotal();

  // Top-Level State Declarations (Guaranteed before any conditional returns)
  const [recipientName, setRecipientName] = useState(user?.name ?? "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [deliveryMemo, setDeliveryMemo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [selectedCardCompany, setSelectedCardCompany] = useState(CARD_COMPANIES[0]);
  const [installmentMonths, setInstallmentMonths] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PG 결제창 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);

  if (cartItems.length === 0 && !paymentResult) {
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

  // 1단계: 주문서 생성 및 PG 모달 호출
  const handleOpenPaymentModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/client/login");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await orderService.createOrder({
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

      setPendingOrder(created);
      setIsModalOpen(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        setError(apiError?.message ?? "주문서 생성 중 오류가 발생했습니다.");
      } else {
        setError("서버에 연결할 수 없습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 2단계: PG 결제 승인 및 백엔드 2-Phase 위변조 검증
  const handleConfirmPayment = async () => {
    if (!pendingOrder) return;
    setConfirming(true);
    setError(null);

    const generatedPaymentKey = `toss_pk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const result = await paymentService.confirmPayment({
        orderId: pendingOrder.id,
        paymentKey: generatedPaymentKey,
        amount: total,
        pgProvider: paymentMethod.startsWith("TOSS") ? "TOSS_PAYMENTS" : paymentMethod.startsWith("KAKAO") ? "KAKAO_PAY" : "TOSS_PAYMENTS",
        cardCompany: paymentMethod === "CREDIT_CARD" ? selectedCardCompany : undefined,
        installmentMonths: installmentMonths,
      });

      clearCart();
      setPaymentResult(result);
      setIsModalOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        setError(apiError?.message ?? "결제 승인 처리 중 오류가 발생했습니다.");
      } else {
        setError("결제 승인 서버 통신 오류가 발생했습니다.");
      }
    } finally {
      setConfirming(false);
    }
  };

  // 결제 완료 성공 화면
  if (paymentResult) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-[#2f9e5f]">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">결제가 성공적으로 완료되었습니다!</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            주문이 정상 접수되었으며 출고 준비가 시작됩니다.
          </p>

          <div className="bg-gray-50 dark:bg-[#101922] rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">주문 번호</span>
              <span className="font-bold text-gray-900 dark:text-white">#{paymentResult.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">결제 승인 금액</span>
              <span className="font-bold text-[#2f9e5f]">{paymentResult.amount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">결제 수단</span>
              <span className="text-gray-900 dark:text-white">
                {paymentResult.cardCompany ? `${paymentResult.cardCompany} (${paymentResult.installmentMonths === 0 ? "일시불" : `${paymentResult.installmentMonths}개월`})` : paymentResult.method}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">PG 승인 번호</span>
              <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{paymentResult.paymentKey ?? paymentResult.transactionId}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {paymentResult.receiptUrl && (
              <a
                href={paymentResult.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">receipt_long</span>
                매출전표 영수증
              </a>
            )}
            <Link
              to="/client/orders"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#2f9e5f] text-white font-bold hover:bg-[#2f9e5f]/90 transition-colors"
            >
              내 주문 내역 확인
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

      <form onSubmit={handleOpenPaymentModal}>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2f9e5f]">payment</span>
                  결제 수단 선택
                </h2>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full font-medium">
                  🔒 토스페이먼츠 2-Phase 안전 결제
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === method.value
                        ? "border-[#2f9e5f] bg-[#2f9e5f]/10 text-[#2f9e5f] font-semibold"
                        : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#2f9e5f]/50"
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
                    <span className="material-symbols-outlined text-lg">{method.icon}</span>
                    <span className="text-sm">{method.label}</span>
                  </label>
                ))}
              </div>

              {/* 신용카드 세부 옵션 */}
              {paymentMethod === "CREDIT_CARD" && (
                <div className="p-4 bg-gray-50 dark:bg-[#101922] rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">카드사 선택</label>
                      <select
                        value={selectedCardCompany}
                        onChange={(e) => setSelectedCardCompany(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2332] text-sm text-gray-900 dark:text-white"
                      >
                        {CARD_COMPANIES.map((card) => (
                          <option key={card} value={card}>{card}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">할부 개월수</label>
                      <select
                        value={installmentMonths}
                        onChange={(e) => setInstallmentMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2332] text-sm text-gray-900 dark:text-white"
                      >
                        <option value={0}>일시불</option>
                        <option value={2}>2개월 무이자</option>
                        <option value={3}>3개월 무이자</option>
                        <option value={6}>6개월</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">주문 상품 ({cartItems.length}종)</h2>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.book.id} className="flex gap-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.book.title}</p>
                      <p className="text-gray-500 dark:text-gray-400">수량 {item.quantity}권</p>
                    </div>
                    <p className="font-bold text-[#2f9e5f] whitespace-nowrap">
                      {(item.book.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>도서 금액</span>
                  <span>{total.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>배송비</span>
                  <span className="text-[#2f9e5f] font-semibold">무료 배송</span>
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
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-[#2f9e5f] text-white font-bold text-base hover:bg-[#2f9e5f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? (
                  <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined mr-2">lock</span>
                )}
                {submitting ? "주문서 생성 중..." : `${total.toLocaleString()}원 결제 진행하기`}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* PG사 실시간 결제 승인 팝업 모달 (Toss Payments Simulator & Authenticator) */}
      {isModalOpen && pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2f9e5f]/20 flex items-center justify-center text-[#2f9e5f]">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">토스페이먼츠 전자결제</h3>
                  <p className="text-xs text-gray-500">2-Phase 보안 결제창</p>
                </div>
              </div>
              <button
                onClick={() => !confirming && setIsModalOpen(false)}
                disabled={confirming}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="my-5 space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-[#101922] rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">주문 번호</span>
                  <span className="font-bold text-gray-900 dark:text-white">#{pendingOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">결제 수단</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {paymentMethod === "CREDIT_CARD" ? `${selectedCardCompany} (${installmentMonths === 0 ? "일시불" : `${installmentMonths}개월`})` : paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2 text-base">
                  <span className="font-bold text-gray-700 dark:text-gray-300">최종 결제 금액</span>
                  <span className="font-black text-[#2f9e5f]">{total.toLocaleString()}원</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <span className="material-symbols-outlined text-base shrink-0">info</span>
                <span>[테스트 Sandbox 환경] 실제 계좌나 카드가 청구되지 않으며, 백엔드 위변조 검증과 DB 트랜잭션이 안전하게 실행됩니다.</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={confirming}
                className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                결제 취소
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={confirming}
                className="flex-1 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold hover:bg-[#2f9e5f]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {confirming ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>승인 검증 중...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">check</span>
                    <span>결제 완료</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

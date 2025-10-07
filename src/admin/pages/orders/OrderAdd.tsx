import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../shared/components/common/Input";
import Select from "../../../shared/components/common/Select";
import Button from "../../../shared/components/common/Button";

interface OrderItemInput {
  bookId: string;
  quantity: string;
  price: string;
}

const OrderAdd = () => {
  const navigate = useNavigate();
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([
    { bookId: "", quantity: "1", price: "" },
  ]);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { bookId: "", quantity: "1", price: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItemInput,
    value: string
  ) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
    const shipping = 5.0;
    return { subtotal, shipping, total: subtotal + shipping };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to create order
    // - Calculate total amount
    // - Set status to PENDING
    // - Process payment based on payment method (Strategy pattern)
    // - Send confirmation email on success
    const orderData = {
      customerEmail,
      paymentMethod,
      items: orderItems.map((item) => ({
        bookId: parseInt(item.bookId),
        quantity: parseInt(item.quantity),
      })),
    };
    console.log("Create order:", orderData);
    navigate("/admin/orders");
  };

  const { subtotal, shipping, total } = calculateTotal();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Order</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a new order for multiple books.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Customer Information
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Customer Email"
              type="email"
              placeholder="customer@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: "CREDIT_CARD", label: "Credit Card" },
                { value: "BANK_TRANSFER", label: "Bank Transfer" },
              ]}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Order Items</h3>
              <Button type="button" variant="secondary" onClick={handleAddItem}>
                <span className="material-symbols-outlined">add</span>
                Add Item
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {orderItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <Input
                  label="Book ID"
                  type="number"
                  placeholder="1"
                  value={item.bookId}
                  onChange={(e) => handleItemChange(index, "bookId", e.target.value)}
                  required
                />
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  required
                />
                <Input
                  label="Price per unit"
                  type="number"
                  step="0.01"
                  placeholder="10.99"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, "price", e.target.value)}
                  required
                />
                <div className="flex items-end">
                  {orderItems.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleRemoveItem(index)}
                      className="w-full"
                    >
                      <span className="material-symbols-outlined">delete</span>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h3>
            <div className="max-w-sm ml-auto space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">Order Processing</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Order will be created with PENDING status</li>
                <li>
                  Payment will be processed using{" "}
                  {paymentMethod === "CREDIT_CARD" ? "Credit Card" : "Bank Transfer"}
                </li>
                <li>Confirmation email will be sent upon successful payment</li>
                <li>Order status can be updated later by administrators</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/admin/orders")}>
            Cancel
          </Button>
          <Button type="submit">
            <span className="material-symbols-outlined">shopping_cart</span>
            Create Order
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderAdd;

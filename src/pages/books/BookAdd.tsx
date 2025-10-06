import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

const BookAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    price: "",
    available: "true",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to create book
    console.log("Create book:", formData);
    navigate("/books");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Book</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Register a new book to the catalog.</p>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Book Information</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enter the details of the new book.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Title"
              type="text"
              placeholder="e.g., The Great Gatsby"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="Author"
              type="text"
              placeholder="e.g., F. Scott Fitzgerald"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="ISBN"
              type="text"
              placeholder="e.g., 978-0743273565"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600 dark:text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="10.25"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-7 pr-4 py-2 bg-white dark:bg-[#1a2632] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1173d4] focus:border-transparent dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Availability"
              value={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.value })}
              options={[
                { value: "true", label: "Available" },
                { value: "false", label: "Unavailable" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate("/books")}>
              Cancel
            </Button>
            <Button type="submit">
              <span className="material-symbols-outlined">add</span>
              Add Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAdd;

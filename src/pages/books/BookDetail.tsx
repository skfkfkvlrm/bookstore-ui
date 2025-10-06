import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Book } from "../../types";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

// Mock data - replace with API call
const mockBook: Book = {
  id: 1,
  title: "The Secret Garden",
  author: "Frances Bennett",
  isbn: "978-0140620100",
  price: 9.99,
  available: true,
  createdDate: "2023-01-10T09:00:00",
};

const BookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [book, setBook] = useState<Book>(mockBook);
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    price: book.price.toString(),
    available: book.available.toString(),
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      price: book.price.toString(),
      available: book.available.toString(),
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to update book
    console.log("Update book:", formData);
    setBook({
      ...book,
      title: formData.title,
      author: formData.author,
      isbn: formData.isbn,
      price: parseFloat(formData.price),
      available: formData.available === "true",
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      // TODO: API call to delete book
      console.log("Delete book:", id);
      navigate("/books");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Book Details</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage book information.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Book Information
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                ID: {book.id}
              </p>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit}>
                <span className="material-symbols-outlined">edit</span>
                Edit
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Title"
              type="text"
              placeholder="e.g., The Great Gatsby"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={!isEditing}
              required
            />
            <Input
              label="Author"
              type="text"
              placeholder="e.g., F. Scott Fitzgerald"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              disabled={!isEditing}
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
              disabled={!isEditing}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price
              </label>
              {isEditing ? (
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
              ) : (
                <div className="py-2 text-gray-900 dark:text-white font-medium">
                  ${book.price.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Availability
              </label>
              {isEditing ? (
                <Select
                  value={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                  options={[
                    { value: "true", label: "Available" },
                    { value: "false", label: "Unavailable" },
                  ]}
                />
              ) : (
                <div className="py-2">
                  <Badge variant={book.available ? "available" : "unavailable"}>
                    {book.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Created Date
              </label>
              <div className="py-2 text-gray-600 dark:text-gray-400">
                {new Date(book.createdDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="secondary" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <span className="material-symbols-outlined">save</span>
                Save Changes
              </Button>
            </div>
          )}
        </form>

        {!isEditing && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Danger Zone
            </h4>
            <Button variant="danger" onClick={handleDelete}>
              <span className="material-symbols-outlined">delete</span>
              Delete Book
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <Button variant="secondary" onClick={() => navigate("/books")}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Catalog
        </Button>
      </div>
    </div>
  );
};

export default BookDetail;

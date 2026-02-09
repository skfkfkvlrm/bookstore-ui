import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Book } from "../../../shared/types";
import Input from "../../../shared/components/common/Input";
import Select from "../../../shared/components/common/Select";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";
import booksData from "../../../shared/data/books.json";

const BookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  // Find book from imported data or use first book as fallback
  const initialBook = (booksData as Book[]).find((b) => b.id === Number(id)) || (booksData[0] as Book);
  const [book, setBook] = useState<Book>(initialBook);
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    price: book.price.toString(),
    available: book.available.toString(),
    coverImage: book.coverImage || "",
  });
  const [previewImage, setPreviewImage] = useState<string>(book.coverImage || "");

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPreviewImage(imageUrl);
        setFormData({ ...formData, coverImage: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreviewImage(book.coverImage || "");
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      price: book.price.toString(),
      available: book.available.toString(),
      coverImage: book.coverImage || "",
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
      coverImage: formData.coverImage,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("이 도서를 삭제하시겠습니까?")) {
      // TODO: API call to delete book
      console.log("Delete book:", id);
      navigate("/admin/books");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">도서 상세</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            도서 정보를 확인하고 수정하세요.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                도서 정보
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                도서 ID: {book.id}
              </p>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit}>
                <span className="material-symbols-outlined">edit</span>
                편집
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Book Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              표지 이미지
            </label>
            <div className="flex items-start gap-6">
              <div className="w-48 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 shadow-md">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={`Cover of ${book.title}`}
                    className="aspect-[3/4] w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`aspect-[3/4] w-full bg-gradient-to-br from-[#1173d4]/20 to-[#1173d4]/5 flex items-center justify-center ${previewImage ? 'hidden' : ''}`}>
                  <span className="material-symbols-outlined text-6xl text-[#1173d4]/40">
                    book
                  </span>
                </div>
              </div>
              {isEditing && (
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#1173d4] transition-colors">
                    <input
                      type="file"
                      id="cover-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 mb-2">
                        upload
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        새 표지 이미지를 업로드하세요
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG 최대 10MB
                      </span>
                    </label>
                  </div>
                  {previewImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage("");
                        setFormData({ ...formData, coverImage: "" });
                      }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      이미지 제거
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="도서명"
              type="text"
              placeholder="예: 위대한 개츠비"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={!isEditing}
              required
            />
            <Input
              label="저자"
              type="text"
              placeholder="예: F. Scott Fitzgerald"
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
              placeholder="예: 978-0743273565"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              disabled={!isEditing}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                가격
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
                재고 상태
              </label>
              {isEditing ? (
                <Select
                  value={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                  options={[
                    { value: "true", label: "재고 있음" },
                    { value: "false", label: "재고 없음" },
                  ]}
                />
              ) : (
                <div className="py-2">
                  <Badge variant={book.available ? "available" : "unavailable"}>
                    {book.available ? "재고 있음" : "재고 없음"}
                  </Badge>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                등록일
              </label>
              <div className="py-2 text-gray-600 dark:text-gray-400">
                {new Date(book.createdDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="secondary" type="button" onClick={handleCancel}>
                취소
              </Button>
              <Button type="submit">
                <span className="material-symbols-outlined">save</span>
                변경 사항 저장
              </Button>
            </div>
          )}
        </form>

        {!isEditing && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              주의 영역
            </h4>
            <Button variant="danger" onClick={handleDelete}>
              <span className="material-symbols-outlined">delete</span>
              도서 삭제
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <Button variant="secondary" onClick={() => navigate("/admin/books")}>
          <span className="material-symbols-outlined">arrow_back</span>
          목록으로 돌아가기
        </Button>
      </div>
    </div>
  );
};

export default BookDetail;

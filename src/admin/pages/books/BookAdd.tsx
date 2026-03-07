import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../shared/components/common/Input";
import Select from "../../../shared/components/common/Select";
import Button from "../../../shared/components/common/Button";

const BookAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    price: "",
    available: "true",
    coverImageUrl: "",
  });
  const [previewImage, setPreviewImage] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll just create a local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPreviewImage(imageUrl);
        setFormData({ ...formData, coverImageUrl: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to create book
    console.log("Create book:", formData);
    navigate("/admin/books");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">도서 등록</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">새 도서를 목록에 추가하세요.</p>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">도서 정보</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">등록할 도서의 세부 정보를 입력하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              표지 이미지
            </label>
            <div className="flex items-start gap-6">
              <div className="w-48 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 shadow-md">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Book cover preview"
                    className="aspect-[3/4] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[3/4] w-full bg-gradient-to-br from-[#2f9e5f]/20 to-[#2f9e5f]/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-[#2f9e5f]/40">
                      book
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#2f9e5f] transition-colors">
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
                      클릭하여 표지 이미지를 업로드하세요
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
                      setFormData({ ...formData, coverImageUrl: "" });
                    }}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    이미지 제거
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="도서명"
              type="text"
              placeholder="예: 위대한 개츠비"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="저자"
              type="text"
              placeholder="예: F. Scott Fitzgerald"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
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
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                가격
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
                  className="w-full pl-7 pr-4 py-2 bg-white dark:bg-[#1a2632] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="재고 상태"
              value={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.value })}
              options={[
                { value: "true", label: "재고 있음" },
                { value: "false", label: "재고 없음" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate("/admin/books")}>
              취소
            </Button>
            <Button type="submit">
              <span className="material-symbols-outlined">add</span>
              등록 완료
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAdd;

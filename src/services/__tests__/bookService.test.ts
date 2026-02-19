import { describe, it, expect, vi, beforeEach } from 'vitest';

// apiClient 목킹
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '../apiClient';
import { bookService } from '../bookService';
import type { Book, PageResponse } from '../../shared/types';

const getMock = vi.mocked(apiClient.get);
const postMock = vi.mocked(apiClient.post);
const putMock = vi.mocked(apiClient.put);
const patchMock = vi.mocked(apiClient.patch);
const deleteMock = vi.mocked(apiClient.delete);

const mockBook: Book = {
  id: 1,
  title: '테스트 도서',
  author: '테스트 저자',
  isbn: '978-0000000001',
  price: 15000,
  available: true,
  createdDate: '2026-01-01T00:00:00Z',
};

const mockPage: PageResponse<Book> = {
  content: [mockBook],
  totalElements: 1,
  totalPages: 1,
  size: 12,
  number: 0,
};

describe('bookService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BK-01: 도서 목록 조회 — 기본 파라미터', () => {
    it('GET /api/books?page=0&size=12 로 요청한다', async () => {
      getMock.mockResolvedValue({ data: mockPage });

      await bookService.getBooks();

      expect(getMock).toHaveBeenCalledWith('/api/books', { params: { page: 0, size: 12 } });
    });
  });

  describe('BK-02: 도서 목록 조회 — 커스텀 페이지', () => {
    it('GET /api/books?page=2&size=20 로 요청한다', async () => {
      getMock.mockResolvedValue({ data: mockPage });

      await bookService.getBooks(2, 20);

      expect(getMock).toHaveBeenCalledWith('/api/books', { params: { page: 2, size: 20 } });
    });
  });

  describe('BK-03: 단일 도서 조회', () => {
    it('GET /api/books/5 로 요청하고 도서 데이터를 반환한다', async () => {
      getMock.mockResolvedValue({ data: mockBook });

      const result = await bookService.getBook(5);

      expect(getMock).toHaveBeenCalledWith('/api/books/5');
      expect(result).toEqual(mockBook);
    });
  });

  describe('BK-04: 키워드 검색', () => {
    it('GET /api/books/search/keyword?keyword=react&page=0&size=12 로 요청한다', async () => {
      getMock.mockResolvedValue({ data: mockPage });

      await bookService.searchByKeyword('react', 0, 12);

      expect(getMock).toHaveBeenCalledWith('/api/books/search/keyword', {
        params: { keyword: 'react', page: 0, size: 12 },
      });
    });
  });

  describe('BK-05: 도서 등록', () => {
    it('POST /api/books 로 요청하고 생성된 도서를 반환한다', async () => {
      postMock.mockResolvedValue({ data: mockBook });

      const createData = {
        title: '테스트 도서',
        author: '테스트 저자',
        isbn: '978-0000000001',
        price: 15000,
        available: true,
      };

      const result = await bookService.create(createData);

      expect(postMock).toHaveBeenCalledWith('/api/books', createData);
      expect(result).toEqual(mockBook);
    });
  });

  describe('BK-06: 도서 수정', () => {
    it('PUT /api/books/1 로 요청하고 수정된 도서를 반환한다', async () => {
      const updatedBook = { ...mockBook, title: '수정된 도서' };
      putMock.mockResolvedValue({ data: updatedBook });

      const updateData = {
        title: '수정된 도서',
        author: '테스트 저자',
        isbn: '978-0000000001',
        price: 15000,
        available: true,
      };

      const result = await bookService.update(1, updateData);

      expect(putMock).toHaveBeenCalledWith('/api/books/1', updateData);
      expect(result.title).toBe('수정된 도서');
    });
  });

  describe('BK-07: 도서 삭제', () => {
    it('DELETE /api/books/1 로 요청한다', async () => {
      deleteMock.mockResolvedValue({ data: undefined });

      await bookService.delete(1);

      expect(deleteMock).toHaveBeenCalledWith('/api/books/1');
    });
  });

  describe('BK-08: 재고 상태 변경', () => {
    it('PATCH /api/books/1/availability?available=false 로 요청한다', async () => {
      patchMock.mockResolvedValue({ data: { ...mockBook, available: false } });

      await bookService.updateAvailability(1, false);

      expect(patchMock).toHaveBeenCalledWith(
        '/api/books/1/availability',
        null,
        { params: { available: false } }
      );
    });
  });
});

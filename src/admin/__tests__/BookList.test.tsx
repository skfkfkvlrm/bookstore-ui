import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BookList from '../pages/books/BookList';
import type { Book, PageResponse } from '../../shared/types';

// bookService 목킹
vi.mock('../../services/bookService', () => ({
  bookService: {
    getBooks: vi.fn(),
    searchByKeyword: vi.fn(),
  },
}));

import { bookService } from '../../services/bookService';

const getBooksMock = vi.mocked(bookService.getBooks);
const searchMock = vi.mocked(bookService.searchByKeyword);

const mockBooks: Book[] = [
  {
    id: 1,
    title: '리액트 완벽 가이드',
    author: '김개발',
    isbn: '978-0000000001',
    price: 32000,
    available: true,
    createdDate: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: '타입스크립트 핸드북',
    author: '이코딩',
    isbn: '978-0000000002',
    price: 28000,
    available: false,
    createdDate: '2026-01-02T00:00:00Z',
  },
];

const mockPage: PageResponse<Book> = {
  content: mockBooks,
  totalElements: 2,
  totalPages: 1,
  size: 100,
  number: 0,
};

const emptyPage: PageResponse<Book> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 100,
  number: 0,
};

function renderBookList() {
  return render(
    <MemoryRouter>
      <BookList />
    </MemoryRouter>
  );
}

describe('BookList (Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AB-01: 초기 로딩', () => {
    it('도서 목록이 테이블에 렌더링된다', async () => {
      getBooksMock.mockResolvedValue(mockPage);

      renderBookList();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });

      expect(screen.getByText('타입스크립트 핸드북')).toBeInTheDocument();
    });
  });

  describe('AB-02: 도서 정보 표시', () => {
    it('저자·ISBN·가격이 테이블에 표시된다', async () => {
      getBooksMock.mockResolvedValue(mockPage);

      renderBookList();

      await waitFor(() => {
        expect(screen.getByText('김개발')).toBeInTheDocument();
      });

      expect(screen.getByText('978-0000000001')).toBeInTheDocument();
    });
  });

  describe('AB-03: 검색 기능', () => {
    it('Enter 키 검색 시 bookService.searchByKeyword가 호출된다', async () => {
      getBooksMock.mockResolvedValue(mockPage);
      searchMock.mockResolvedValue(mockPage);

      renderBookList();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/검색/);
      await userEvent.type(searchInput, '리액트{enter}');

      await waitFor(() => {
        expect(searchMock).toHaveBeenCalledWith('리액트', 0, 100);
      });
    });
  });

  describe('AB-04: 검색 결과 없음', () => {
    it('"조건에 맞는 도서가 없습니다" 메시지가 노출된다', async () => {
      getBooksMock.mockResolvedValue(emptyPage);

      renderBookList();

      expect(
        await screen.findByText('조건에 맞는 도서가 없습니다.')
      ).toBeInTheDocument();
    });
  });

  describe('AB-05: API 에러', () => {
    it('에러 메시지와 다시 시도 버튼이 노출된다', async () => {
      getBooksMock.mockRejectedValue(new Error('Server Error'));

      renderBookList();

      expect(
        await screen.findByText('도서 목록을 불러오는 데 실패했습니다.')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    });
  });

  describe('AB-06: 총 도서 수 표시', () => {
    it('총 도서 수가 헤더에 표시된다', async () => {
      getBooksMock.mockResolvedValue(mockPage);

      renderBookList();

      await waitFor(() => {
        expect(screen.getByText(/2권/)).toBeInTheDocument();
      });
    });
  });
});

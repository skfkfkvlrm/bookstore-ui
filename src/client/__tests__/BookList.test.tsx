import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BookList from '../pages/BookList';
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
  {
    id: 3,
    title: 'Node.js 입문',
    author: '박서버',
    isbn: '978-0000000003',
    price: 25000,
    available: true,
    createdDate: '2026-01-03T00:00:00Z',
  },
];

const mockPage: PageResponse<Book> = {
  content: mockBooks,
  totalElements: 3,
  totalPages: 1,
  size: 12,
  number: 0,
};

const emptyPage: PageResponse<Book> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 12,
  number: 0,
};

function renderBookList(search = '') {
  const url = search ? `/client/books?search=${encodeURIComponent(search)}` : '/client/books';
  return render(
    <MemoryRouter initialEntries={[url]}>
      <BookList />
    </MemoryRouter>
  );
}

describe('BookList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BL-01: 초기 로딩', () => {
    it('로딩 후 도서 목록이 렌더링된다', async () => {
      getBooksMock.mockResolvedValue(mockPage);

      renderBookList();

      // 로딩 스피너가 잠시 노출되다가 사라짐
      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });
    });
  });

  describe('BL-02: 도서 카드 렌더링', () => {
    it('도서 제목·저자·가격이 모두 노출된다', async () => {
      getBooksMock.mockResolvedValue(mockPage);

      renderBookList();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });

      // 3권 모두 확인
      expect(screen.getByText('타입스크립트 핸드북')).toBeInTheDocument();
      expect(screen.getByText('Node.js 입문')).toBeInTheDocument();
      expect(screen.getByText('저자 김개발')).toBeInTheDocument();
      expect(screen.getByText('32,000원')).toBeInTheDocument();
    });
  });

  describe('BL-03: 검색 기능', () => {
    it('검색어 입력 후 Enter 시 searchByKeyword가 호출된다', async () => {
      getBooksMock.mockResolvedValue(mockPage);
      searchMock.mockResolvedValue(mockPage);

      renderBookList();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('제목·저자·ISBN으로 검색');
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, '리액트{enter}');

      await waitFor(() => {
        expect(searchMock).toHaveBeenCalledWith('리액트', 0, 12);
      });
    });
  });

  describe('BL-04: 검색 결과 없음', () => {
    it('"조건에 맞는 도서를 찾지 못했습니다" 메시지가 노출된다', async () => {
      getBooksMock.mockResolvedValue(emptyPage);

      renderBookList();

      expect(
        await screen.findByText('조건에 맞는 도서를 찾지 못했습니다.')
      ).toBeInTheDocument();
    });
  });

  describe('BL-06: API 에러', () => {
    it('에러 메시지와 다시 시도 버튼이 노출된다', async () => {
      getBooksMock.mockRejectedValue(new Error('Server Error'));

      renderBookList();

      expect(
        await screen.findByText('도서 목록을 불러오는 데 실패했습니다.')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    });
  });

  describe('BL-07: 다시 시도', () => {
    it('에러 후 "다시 시도" 버튼 클릭 시 getBooks가 재호출된다', async () => {
      getBooksMock
        .mockRejectedValueOnce(new Error('Server Error'))
        .mockResolvedValue(mockPage);

      renderBookList();

      const retryButton = await screen.findByRole('button', { name: '다시 시도' });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(getBooksMock).toHaveBeenCalledTimes(2);
      });
    });
  });
});

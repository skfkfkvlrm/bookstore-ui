import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BookDetail from '../pages/books/BookDetail';
import type { Book } from '../../shared/types';

// bookService 목킹
vi.mock('../../services/bookService', () => ({
  bookService: {
    getBook: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { bookService } from '../../services/bookService';

const getBookMock = vi.mocked(bookService.getBook);
const updateMock = vi.mocked(bookService.update);
const deleteMock = vi.mocked(bookService.delete);

const mockBook: Book = {
  id: 1,
  title: '리액트 완벽 가이드',
  author: '김개발',
  isbn: '978-0000000001',
  price: 32000,
  available: true,
  createdDate: '2026-01-01T00:00:00Z',
};

function renderBookDetail(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/admin/books/${id}`]}>
      <Routes>
        <Route path="/admin/books/:id" element={<BookDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('BookDetail (Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ABD-01: 초기 로딩', () => {
    it('도서 정보가 폼에 렌더링된다', async () => {
      getBookMock.mockResolvedValue(mockBook);

      renderBookDetail();

      await waitFor(() => {
        expect(screen.getByDisplayValue('리액트 완벽 가이드')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('김개발')).toBeInTheDocument();
      expect(screen.getByDisplayValue('978-0000000001')).toBeInTheDocument();
    });
  });

  describe('ABD-02: 편집 모드 진입', () => {
    it('편집 버튼 클릭 시 입력 필드가 활성화된다', async () => {
      getBookMock.mockResolvedValue(mockBook);

      renderBookDetail();

      await waitFor(() => {
        expect(screen.getByDisplayValue('리액트 완벽 가이드')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /편집/ });
      await userEvent.click(editButton);

      const titleInput = screen.getByDisplayValue('리액트 완벽 가이드');
      expect(titleInput).not.toBeDisabled();
    });
  });

  describe('ABD-03: 도서 수정', () => {
    it('저장 시 bookService.update가 호출된다', async () => {
      getBookMock.mockResolvedValue(mockBook);
      updateMock.mockResolvedValue({ ...mockBook, title: '수정된 가이드' });

      renderBookDetail();

      await waitFor(() => {
        expect(screen.getByDisplayValue('리액트 완벽 가이드')).toBeInTheDocument();
      });

      // 편집 모드 진입
      await userEvent.click(screen.getByRole('button', { name: /편집/ }));

      // 제목 수정
      const titleInput = screen.getByDisplayValue('리액트 완벽 가이드');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '수정된 가이드');

      // 저장
      await userEvent.click(screen.getByRole('button', { name: /변경 사항 저장/ }));

      await waitFor(() => {
        expect(updateMock).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ title: '수정된 가이드' })
        );
      });
    });
  });

  describe('ABD-04: 편집 취소', () => {
    it('취소 버튼 클릭 시 원본 데이터로 복원된다', async () => {
      getBookMock.mockResolvedValue(mockBook);

      renderBookDetail();

      await waitFor(() => {
        expect(screen.getByDisplayValue('리액트 완벽 가이드')).toBeInTheDocument();
      });

      // 편집 모드 진입
      await userEvent.click(screen.getByRole('button', { name: /편집/ }));

      // 제목 변경
      const titleInput = screen.getByDisplayValue('리액트 완벽 가이드');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '임시 제목');

      // 취소
      await userEvent.click(screen.getByRole('button', { name: /취소/ }));

      // 원본 복원 확인
      await waitFor(() => {
        expect(screen.getByDisplayValue('리액트 완벽 가이드')).toBeInTheDocument();
      });
    });
  });

  describe('ABD-05: 도서 삭제', () => {
    it('삭제 확인 후 bookService.delete가 호출된다', async () => {
      getBookMock.mockResolvedValue(mockBook);
      deleteMock.mockResolvedValue(undefined);
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderBookDetail();

      await waitFor(() => {
        expect(screen.getByDisplayValue('리액트 완벽 가이드')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /도서 삭제/ });
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(deleteMock).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('ABD-06: API 에러 — 도서 없음', () => {
    it('에러 시 에러 메시지가 노출된다', async () => {
      getBookMock.mockRejectedValue(new Error('Not Found'));

      renderBookDetail('999');

      expect(
        await screen.findByText('도서 정보를 불러오는 데 실패했습니다.')
      ).toBeInTheDocument();
    });
  });
});

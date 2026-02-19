import { apiClient } from './apiClient';
import type { Book, PageResponse } from '../shared/types';

export interface BookSearchParams {
  title?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  page?: number;
  size?: number;
}

export const bookService = {
  getBooks: (page = 0, size = 12): Promise<PageResponse<Book>> =>
    apiClient.get<PageResponse<Book>>('/api/books', { params: { page, size } })
      .then((r) => r.data),

  getBook: (id: number): Promise<Book> =>
    apiClient.get<Book>(`/api/books/${id}`).then((r) => r.data),

  searchByKeyword: (keyword: string, page = 0, size = 12): Promise<PageResponse<Book>> =>
    apiClient.get<PageResponse<Book>>('/api/books/search/keyword', {
      params: { keyword, page, size },
    }).then((r) => r.data),

  searchByTitle: (title: string, page = 0, size = 12): Promise<PageResponse<Book>> =>
    apiClient.get<PageResponse<Book>>('/api/books/search/title', {
      params: { title, page, size },
    }).then((r) => r.data),

  searchByAuthor: (author: string, page = 0, size = 12): Promise<PageResponse<Book>> =>
    apiClient.get<PageResponse<Book>>('/api/books/search/author', {
      params: { author, page, size },
    }).then((r) => r.data),

  searchComplex: (params: BookSearchParams): Promise<PageResponse<Book>> =>
    apiClient.get<PageResponse<Book>>('/api/books/search', { params }).then((r) => r.data),

  getByAvailability: (available: boolean): Promise<Book[]> =>
    apiClient.get<Book[]>(`/api/books/availability/${available}`).then((r) => r.data),

  getStatistics: (): Promise<{ totalBooks: number; activeBooks: number; deletedBooks: number }> =>
    apiClient.get('/api/books/statistics').then((r) => r.data),

  create: (data: Omit<Book, 'id' | 'createdDate' | 'coverImage'>): Promise<Book> =>
    apiClient.post<Book>('/api/books', data).then((r) => r.data),

  update: (id: number, data: Omit<Book, 'id' | 'createdDate' | 'coverImage'>): Promise<Book> =>
    apiClient.put<Book>(`/api/books/${id}`, data).then((r) => r.data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/books/${id}`).then(() => undefined),

  restore: (id: number): Promise<Book> =>
    apiClient.patch<Book>(`/api/books/${id}/restore`).then((r) => r.data),

  updateAvailability: (id: number, available: boolean): Promise<Book> =>
    apiClient.patch<Book>(`/api/books/${id}/availability`, null, {
      params: { available },
    }).then((r) => r.data),

  validateIsbn: (isbn: string): Promise<boolean> =>
    apiClient.get<boolean>('/api/books/validate/isbn', { params: { isbn } })
      .then((r) => r.data),
};

import { techdengueClient } from '@/lib/api/client';
import type { AxiosRequestConfig } from 'axios';

// Alias for backwards compatibility
const api = techdengueClient;

/**
 * Base service class with CRUD methods
 * Extend this class to create specific services
 */
export class BaseService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  protected readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  /**
   * Get all items with optional query params
   */
  async getAll(params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T[]> {
    const response = await api.get<T[]>(this.basePath, { params, ...config });
    return response.data;
  }

  /**
   * Get paginated items
   */
  async getPaginated(
    page: number = 1,
    limit: number = 10,
    params?: Record<string, unknown>
  ): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
    const response = await api.get<{
      data: T[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(this.basePath, {
      params: { page, limit, ...params },
    });
    return response.data;
  }

  /**
   * Get a single item by ID
   */
  async getById(id: string | number, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<T>(`${this.basePath}/${id}`, config);
    return response.data;
  }

  /**
   * Create a new item
   */
  async create(data: CreateDTO, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.post<T>(this.basePath, data, config);
    return response.data;
  }

  /**
   * Update an existing item
   */
  async update(id: string | number, data: UpdateDTO, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.put<T>(`${this.basePath}/${id}`, data, config);
    return response.data;
  }

  /**
   * Partially update an item
   */
  async patch(id: string | number, data: Partial<UpdateDTO>, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.patch<T>(`${this.basePath}/${id}`, data, config);
    return response.data;
  }

  /**
   * Delete an item
   */
  async delete(id: string | number, config?: AxiosRequestConfig): Promise<void> {
    await api.delete(`${this.basePath}/${id}`, config);
  }

  /**
   * Bulk delete items
   */
  async bulkDelete(ids: (string | number)[], config?: AxiosRequestConfig): Promise<void> {
    await api.delete(this.basePath, { data: { ids }, ...config });
  }

  /**
   * Search items
   */
  async search(query: string, params?: Record<string, unknown>): Promise<T[]> {
    const response = await api.get<T[]>(`${this.basePath}/search`, {
      params: { q: query, ...params },
    });
    return response.data;
  }

  /**
   * Export data to specified format
   */
  async export(format: 'csv' | 'xlsx' | 'pdf', params?: Record<string, unknown>): Promise<Blob> {
    const response = await api.get(`${this.basePath}/export`, {
      params: { format, ...params },
      responseType: 'blob',
    });
    return response.data;
  }
}

/**
 * Helper function to create a typed service instance
 */
export function createService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>(
  basePath: string
): BaseService<T, CreateDTO, UpdateDTO> {
  return new BaseService<T, CreateDTO, UpdateDTO>(basePath);
}

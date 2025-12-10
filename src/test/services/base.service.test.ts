import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseService, createService } from '@/lib/services/base.service';

// Mock the API client - use vi.hoisted to ensure mock is available during hoisting
const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  techdengueClient: mockApi,
  default: mockApi,
}));

interface TestEntity {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface CreateTestDTO {
  name: string;
  description?: string;
}

interface UpdateTestDTO {
  name?: string;
  description?: string;
}

describe('BaseService', () => {
  let service: BaseService<TestEntity, CreateTestDTO, UpdateTestDTO>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BaseService<TestEntity, CreateTestDTO, UpdateTestDTO>('/test-entities');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should set basePath', () => {
      const customService = new BaseService('/custom-path');
      expect(customService['basePath']).toBe('/custom-path');
    });
  });

  describe('getAll', () => {
    const mockEntities: TestEntity[] = [
      { id: '1', name: 'Entity 1', createdAt: '2024-01-01' },
      { id: '2', name: 'Entity 2', createdAt: '2024-01-02' },
    ];

    it('should fetch all entities without params', async () => {
      mockApi.get.mockResolvedValue({ data: mockEntities });

      const result = await service.getAll();

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities', { params: undefined });
      expect(result).toEqual(mockEntities);
    });

    it('should fetch all entities with params', async () => {
      mockApi.get.mockResolvedValue({ data: mockEntities });

      const params = { status: 'active', sort: 'name' };
      const result = await service.getAll(params);

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities', { params, undefined });
      expect(result).toEqual(mockEntities);
    });

    it('should pass additional config', async () => {
      mockApi.get.mockResolvedValue({ data: mockEntities });

      const config = { headers: { 'X-Custom-Header': 'value' } };
      await service.getAll(undefined, config);

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities', expect.objectContaining(config));
    });

    it('should throw error when API fails', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(service.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getPaginated', () => {
    const mockPaginatedResponse = {
      data: [{ id: '1', name: 'Entity 1', createdAt: '2024-01-01' }],
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
    };

    it('should fetch paginated entities with default params', async () => {
      mockApi.get.mockResolvedValue({ data: mockPaginatedResponse });

      const result = await service.getPaginated();

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should fetch paginated entities with custom page and limit', async () => {
      mockApi.get.mockResolvedValue({ data: mockPaginatedResponse });

      const result = await service.getPaginated(2, 20);

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities', {
        params: { page: 2, limit: 20 },
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should fetch paginated entities with additional params', async () => {
      mockApi.get.mockResolvedValue({ data: mockPaginatedResponse });

      const result = await service.getPaginated(1, 10, { status: 'active' });

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities', {
        params: { page: 1, limit: 10, status: 'active' },
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should throw error when API fails', async () => {
      mockApi.get.mockRejectedValue(new Error('Server error'));

      await expect(service.getPaginated()).rejects.toThrow('Server error');
    });
  });

  describe('getById', () => {
    const mockEntity: TestEntity = {
      id: '123',
      name: 'Test Entity',
      description: 'A test entity',
      createdAt: '2024-01-01',
    };

    it('should fetch entity by string id', async () => {
      mockApi.get.mockResolvedValue({ data: mockEntity });

      const result = await service.getById('123');

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities/123', undefined);
      expect(result).toEqual(mockEntity);
    });

    it('should fetch entity by number id', async () => {
      mockApi.get.mockResolvedValue({ data: mockEntity });

      const result = await service.getById(456);

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities/456', undefined);
      expect(result).toEqual(mockEntity);
    });

    it('should pass additional config', async () => {
      mockApi.get.mockResolvedValue({ data: mockEntity });

      const config = { headers: { Authorization: 'Bearer token' } };
      await service.getById('123', config);

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities/123', config);
    });

    it('should throw error for non-existent id', async () => {
      mockApi.get.mockRejectedValue({ response: { status: 404 } });

      await expect(service.getById('non-existent')).rejects.toEqual({ response: { status: 404 } });
    });
  });

  describe('create', () => {
    const mockCreatedEntity: TestEntity = {
      id: '999',
      name: 'New Entity',
      description: 'Newly created',
      createdAt: '2024-01-15',
    };

    it('should create entity', async () => {
      mockApi.post.mockResolvedValue({ data: mockCreatedEntity });

      const createData: CreateTestDTO = { name: 'New Entity', description: 'Newly created' };
      const result = await service.create(createData);

      expect(mockApi.post).toHaveBeenCalledWith('/test-entities', createData, undefined);
      expect(result).toEqual(mockCreatedEntity);
    });

    it('should create entity with minimal data', async () => {
      mockApi.post.mockResolvedValue({ data: mockCreatedEntity });

      const createData: CreateTestDTO = { name: 'Minimal Entity' };
      await service.create(createData);

      expect(mockApi.post).toHaveBeenCalledWith('/test-entities', createData, undefined);
    });

    it('should pass additional config', async () => {
      mockApi.post.mockResolvedValue({ data: mockCreatedEntity });

      const config = { headers: { 'Content-Type': 'application/json' } };
      await service.create({ name: 'Test' }, config);

      expect(mockApi.post).toHaveBeenCalledWith('/test-entities', { name: 'Test' }, config);
    });

    it('should throw error when creation fails', async () => {
      mockApi.post.mockRejectedValue(new Error('Validation error'));

      await expect(service.create({ name: '' })).rejects.toThrow('Validation error');
    });
  });

  describe('update', () => {
    const mockUpdatedEntity: TestEntity = {
      id: '123',
      name: 'Updated Entity',
      description: 'Updated description',
      createdAt: '2024-01-01',
    };

    it('should update entity by string id', async () => {
      mockApi.put.mockResolvedValue({ data: mockUpdatedEntity });

      const updateData: UpdateTestDTO = { name: 'Updated Entity' };
      const result = await service.update('123', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/test-entities/123', updateData, undefined);
      expect(result).toEqual(mockUpdatedEntity);
    });

    it('should update entity by number id', async () => {
      mockApi.put.mockResolvedValue({ data: mockUpdatedEntity });

      const updateData: UpdateTestDTO = { name: 'Updated Entity' };
      await service.update(456, updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/test-entities/456', updateData, undefined);
    });

    it('should pass additional config', async () => {
      mockApi.put.mockResolvedValue({ data: mockUpdatedEntity });

      const config = { timeout: 5000 };
      await service.update('123', { name: 'Test' }, config);

      expect(mockApi.put).toHaveBeenCalledWith('/test-entities/123', { name: 'Test' }, config);
    });

    it('should throw error when update fails', async () => {
      mockApi.put.mockRejectedValue(new Error('Not found'));

      await expect(service.update('999', { name: 'Test' })).rejects.toThrow('Not found');
    });
  });

  describe('patch', () => {
    const mockPatchedEntity: TestEntity = {
      id: '123',
      name: 'Patched Entity',
      createdAt: '2024-01-01',
    };

    it('should patch entity by string id', async () => {
      mockApi.patch.mockResolvedValue({ data: mockPatchedEntity });

      const patchData = { name: 'Patched Entity' };
      const result = await service.patch('123', patchData);

      expect(mockApi.patch).toHaveBeenCalledWith('/test-entities/123', patchData, undefined);
      expect(result).toEqual(mockPatchedEntity);
    });

    it('should patch entity by number id', async () => {
      mockApi.patch.mockResolvedValue({ data: mockPatchedEntity });

      await service.patch(456, { description: 'Updated' });

      expect(mockApi.patch).toHaveBeenCalledWith('/test-entities/456', { description: 'Updated' }, undefined);
    });

    it('should pass additional config', async () => {
      mockApi.patch.mockResolvedValue({ data: mockPatchedEntity });

      const config = { headers: { 'X-Request-Id': 'req-123' } };
      await service.patch('123', { name: 'Test' }, config);

      expect(mockApi.patch).toHaveBeenCalledWith('/test-entities/123', { name: 'Test' }, config);
    });

    it('should throw error when patch fails', async () => {
      mockApi.patch.mockRejectedValue(new Error('Forbidden'));

      await expect(service.patch('123', { name: 'Test' })).rejects.toThrow('Forbidden');
    });
  });

  describe('delete', () => {
    it('should delete entity by string id', async () => {
      mockApi.delete.mockResolvedValue({ data: undefined });

      await service.delete('123');

      expect(mockApi.delete).toHaveBeenCalledWith('/test-entities/123', undefined);
    });

    it('should delete entity by number id', async () => {
      mockApi.delete.mockResolvedValue({ data: undefined });

      await service.delete(456);

      expect(mockApi.delete).toHaveBeenCalledWith('/test-entities/456', undefined);
    });

    it('should pass additional config', async () => {
      mockApi.delete.mockResolvedValue({ data: undefined });

      const config = { headers: { Authorization: 'Bearer token' } };
      await service.delete('123', config);

      expect(mockApi.delete).toHaveBeenCalledWith('/test-entities/123', config);
    });

    it('should throw error when delete fails', async () => {
      mockApi.delete.mockRejectedValue(new Error('Not found'));

      await expect(service.delete('999')).rejects.toThrow('Not found');
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete entities by string ids', async () => {
      mockApi.delete.mockResolvedValue({ data: undefined });

      await service.bulkDelete(['1', '2', '3']);

      expect(mockApi.delete).toHaveBeenCalledWith('/test-entities', { data: { ids: ['1', '2', '3'] } });
    });

    it('should bulk delete entities by number ids', async () => {
      mockApi.delete.mockResolvedValue({ data: undefined });

      await service.bulkDelete([1, 2, 3]);

      expect(mockApi.delete).toHaveBeenCalledWith('/test-entities', { data: { ids: [1, 2, 3] } });
    });

    it('should pass additional config', async () => {
      mockApi.delete.mockResolvedValue({ data: undefined });

      const config = { timeout: 10000 };
      await service.bulkDelete(['1', '2'], config);

      expect(mockApi.delete).toHaveBeenCalledWith('/test-entities', expect.objectContaining({ data: { ids: ['1', '2'] } }));
    });

    it('should throw error when bulk delete fails', async () => {
      mockApi.delete.mockRejectedValue(new Error('Bulk delete failed'));

      await expect(service.bulkDelete(['1', '2'])).rejects.toThrow('Bulk delete failed');
    });
  });

  describe('search', () => {
    const mockSearchResults: TestEntity[] = [
      { id: '1', name: 'Search Result 1', createdAt: '2024-01-01' },
    ];

    it('should search entities with query', async () => {
      mockApi.get.mockResolvedValue({ data: mockSearchResults });

      const result = await service.search('test query');

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities/search', {
        params: { q: 'test query' },
      });
      expect(result).toEqual(mockSearchResults);
    });

    it('should search entities with query and additional params', async () => {
      mockApi.get.mockResolvedValue({ data: mockSearchResults });

      const result = await service.search('query', { status: 'active', limit: 5 });

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities/search', {
        params: { q: 'query', status: 'active', limit: 5 },
      });
      expect(result).toEqual(mockSearchResults);
    });

    it('should return empty array for no results', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await service.search('nonexistent');

      expect(result).toEqual([]);
    });

    it('should throw error when search fails', async () => {
      mockApi.get.mockRejectedValue(new Error('Search error'));

      await expect(service.search('query')).rejects.toThrow('Search error');
    });
  });

  describe('export', () => {
    const mockBlob = new Blob(['test data'], { type: 'text/csv' });

    it('should export to CSV format', async () => {
      mockApi.get.mockResolvedValue({ data: mockBlob });

      const result = await service.export('csv');

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities/export', {
        params: { format: 'csv' },
        responseType: 'blob',
      });
      expect(result).toBe(mockBlob);
    });

    it('should export to XLSX format', async () => {
      mockApi.get.mockResolvedValue({ data: mockBlob });

      const result = await service.export('xlsx');

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities/export', {
        params: { format: 'xlsx' },
        responseType: 'blob',
      });
      expect(result).toBe(mockBlob);
    });

    it('should export to PDF format', async () => {
      mockApi.get.mockResolvedValue({ data: mockBlob });

      const result = await service.export('pdf');

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities/export', {
        params: { format: 'pdf' },
        responseType: 'blob',
      });
      expect(result).toBe(mockBlob);
    });

    it('should export with additional params', async () => {
      mockApi.get.mockResolvedValue({ data: mockBlob });

      await service.export('csv', { status: 'active', dateRange: '2024' });

      expect(mockApi.get).toHaveBeenCalledWith('/test-entities/export', {
        params: { format: 'csv', status: 'active', dateRange: '2024' },
        responseType: 'blob',
      });
    });

    it('should throw error when export fails', async () => {
      mockApi.get.mockRejectedValue(new Error('Export error'));

      await expect(service.export('csv')).rejects.toThrow('Export error');
    });
  });
});

describe('createService', () => {
  it('should create typed service instance', () => {
    const service = createService<TestEntity>('/entities');

    expect(service).toBeInstanceOf(BaseService);
    expect(service['basePath']).toBe('/entities');
  });

  it('should create service with custom DTOs', () => {
    const service = createService<TestEntity, CreateTestDTO, UpdateTestDTO>('/entities');

    expect(service).toBeInstanceOf(BaseService);
  });
});

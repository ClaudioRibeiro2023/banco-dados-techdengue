import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      response: { use: vi.fn() },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_CLICKUP_API_KEY', 'test-api-key');
vi.stubEnv('NEXT_PUBLIC_CLICKUP_TEAM_ID', 'team-123');

// Mock data
const mockTask: {
  id: string;
  name: string;
  description: string;
  status: { status: string; color: string; type: string };
  priority: { id: string; priority: string; color: string };
  assignees: Array<{ id: number; username: string; email: string; color: string; initials: string }>;
  due_date: string;
  start_date: string;
  time_estimate: number;
  time_spent: number;
  tags: Array<{ name: string; tag_fg: string; tag_bg: string }>;
  custom_fields: Array<{ id: string; name: string; type: string }>;
  list: { id: string; name: string };
  folder: { id: string; name: string };
  space: { id: string; name: string };
  url: string;
  date_created: string;
  date_updated: string;
  creator: { id: number; username: string; email: string; color: string; initials: string };
} = {
  id: 'task-1',
  name: 'Test Task',
  description: 'Task description',
  status: { status: 'in progress', color: '#7c4dff', type: 'open' },
  priority: { id: '1', priority: 'high', color: '#f50057' },
  assignees: [
    { id: 1, username: 'user1', email: 'user1@test.com', color: '#7c4dff', initials: 'U1' },
  ],
  due_date: '1704067200000',
  start_date: '1703980800000',
  time_estimate: 3600000,
  time_spent: 1800000,
  tags: [{ name: 'bug', tag_fg: '#fff', tag_bg: '#f50057' }],
  custom_fields: [],
  list: { id: 'list-1', name: 'Sprint 1' },
  folder: { id: 'folder-1', name: 'Development' },
  space: { id: 'space-1', name: 'TechDengue' },
  url: 'https://app.clickup.com/t/task-1',
  date_created: '2024-01-01T00:00:00.000Z',
  date_updated: '2024-01-02T00:00:00.000Z',
  creator: { id: 1, username: 'user1', email: 'user1@test.com', color: '#7c4dff', initials: 'U1' },
};

const mockTasks = [
  mockTask,
  {
    ...mockTask,
    id: 'task-2',
    name: 'Task 2',
    status: { status: 'closed', color: '#00c853', type: 'closed' },
  },
  {
    ...mockTask,
    id: 'task-3',
    name: 'Task 3',
    status: { status: 'to do', color: '#90a4ae', type: 'open' },
  },
];

const mockTeam = {
  id: 'team-123',
  name: 'TechDengue Team',
  color: '#7c4dff',
  members: [
    {
      user: { id: 1, username: 'user1', email: 'user1@test.com', color: '#7c4dff', initials: 'U1' },
      role: 1,
    },
  ],
};

const mockSpace = {
  id: 'space-1',
  name: 'TechDengue',
  color: '#7c4dff',
  private: false,
  statuses: [
    { status: 'to do', color: '#90a4ae', type: 'open' },
    { status: 'in progress', color: '#7c4dff', type: 'open' },
    { status: 'closed', color: '#00c853', type: 'closed' },
  ],
  features: {
    due_dates: { enabled: true },
    time_tracking: { enabled: true },
    tags: { enabled: true },
    priorities: { enabled: true },
  },
};

const mockList = {
  id: 'list-1',
  name: 'Sprint 1',
  content: 'Sprint 1 tasks',
  folder: { id: 'folder-1', name: 'Development' },
  space: { id: 'space-1', name: 'TechDengue' },
  task_count: 10,
};

const mockTimeEntry = {
  id: 'time-1',
  task: { id: 'task-1', name: 'Test Task' },
  user: { id: 1, username: 'user1', email: 'user1@test.com', color: '#7c4dff', initials: 'U1' },
  start: '2024-01-01T08:00:00.000Z',
  end: '2024-01-01T10:00:00.000Z',
  duration: 7200000,
  description: 'Working on task',
  tags: [],
  billable: true,
};

describe('ClickUpService', () => {
  let mockAxiosInstance: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockAxiosInstance = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value || {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isConfigured', () => {
    it('should return true when API key and team ID are set', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      expect(clickUpService.isConfigured()).toBe(true);
    });
  });

  describe('Team/Workspace Operations', () => {
    it('should fetch team by id', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: mockTeam });

      const result = await clickUpService.getTeam();

      expect(client.get).toHaveBeenCalledWith('/team/team-123');
      expect(result).toEqual(mockTeam);
    });

    it('should fetch all teams', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { teams: [mockTeam] } });

      const result = await clickUpService.getTeams();

      expect(client.get).toHaveBeenCalledWith('/team');
      expect(result.teams).toHaveLength(1);
    });
  });

  describe('Space Operations', () => {
    it('should fetch spaces for team', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { spaces: [mockSpace] } });

      const result = await clickUpService.getSpaces();

      expect(client.get).toHaveBeenCalledWith('/team/team-123/space');
      expect(result.spaces).toHaveLength(1);
    });

    it('should fetch space by id', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: mockSpace });

      const result = await clickUpService.getSpace('space-1');

      expect(client.get).toHaveBeenCalledWith('/space/space-1');
      expect(result).toEqual(mockSpace);
    });
  });

  describe('List Operations', () => {
    it('should fetch lists for folder', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { lists: [mockList] } });

      const result = await clickUpService.getLists('folder-1');

      expect(client.get).toHaveBeenCalledWith('/folder/folder-1/list');
      expect(result.lists).toHaveLength(1);
    });

    it('should fetch folderless lists for space', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { lists: [mockList] } });

      const result = await clickUpService.getFolderlessLists('space-1');

      expect(client.get).toHaveBeenCalledWith('/space/space-1/list');
      expect(result.lists).toHaveLength(1);
    });

    it('should fetch list by id', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: mockList });

      const result = await clickUpService.getList('list-1');

      expect(client.get).toHaveBeenCalledWith('/list/list-1');
      expect(result).toEqual(mockList);
    });
  });

  describe('Task Operations', () => {
    it('should fetch tasks for list', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const result = await clickUpService.getTasks('list-1');

      expect(client.get).toHaveBeenCalledWith('/list/list-1/task', { params: undefined });
      expect(result.tasks).toHaveLength(3);
    });

    it('should fetch tasks with query params', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const params = { page: 1, include_closed: true, assignees: ['1'] };
      await clickUpService.getTasks('list-1', params);

      expect(client.get).toHaveBeenCalledWith('/list/list-1/task', { params });
    });

    it('should fetch task by id', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: mockTask });

      const result = await clickUpService.getTask('task-1');

      expect(client.get).toHaveBeenCalledWith('/task/task-1');
      expect(result).toEqual(mockTask);
    });

    it('should create task', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.post.mockResolvedValue({ data: mockTask });

      const taskData = {
        name: 'New Task',
        description: 'Task description',
        assignees: [1],
        priority: 1,
      };

      const result = await clickUpService.createTask('list-1', taskData);

      expect(client.post).toHaveBeenCalledWith('/list/list-1/task', taskData);
      expect(result).toEqual(mockTask);
    });

    it('should update task', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      const updatedTask = { ...mockTask, name: 'Updated Task' };
      client.put.mockResolvedValue({ data: updatedTask });

      const result = await clickUpService.updateTask('task-1', { name: 'Updated Task' });

      expect(client.put).toHaveBeenCalledWith('/task/task-1', { name: 'Updated Task' });
      expect(result.name).toBe('Updated Task');
    });

    it('should delete task', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.delete.mockResolvedValue({});

      await clickUpService.deleteTask('task-1');

      expect(client.delete).toHaveBeenCalledWith('/task/task-1');
    });

    it('should fetch filtered tasks for team', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const params = { statuses: ['in progress'], assignees: ['1'] };
      const result = await clickUpService.getFilteredTasks(params);

      expect(client.get).toHaveBeenCalledWith('/team/team-123/task', { params });
      expect(result.tasks).toHaveLength(3);
    });
  });

  describe('Time Tracking Operations', () => {
    it('should fetch time entries for task', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { data: [mockTimeEntry] } });

      const result = await clickUpService.getTimeEntries('task-1');

      expect(client.get).toHaveBeenCalledWith('/task/task-1/time', { params: undefined });
      expect(result.data).toHaveLength(1);
    });

    it('should fetch time entries with date range', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { data: [mockTimeEntry] } });

      const params = { start_date: 1704067200000, end_date: 1704153600000 };
      await clickUpService.getTimeEntries('task-1', params);

      expect(client.get).toHaveBeenCalledWith('/task/task-1/time', { params });
    });

    it('should create time entry', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.post.mockResolvedValue({ data: mockTimeEntry });

      const entryData = {
        start: 1704067200000,
        duration: 3600000,
        description: 'Working on task',
      };

      const result = await clickUpService.createTimeEntry('task-1', entryData);

      expect(client.post).toHaveBeenCalledWith('/task/task-1/time', entryData);
      expect(result).toEqual(mockTimeEntry);
    });

    it('should delete time entry', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.delete.mockResolvedValue({});

      await clickUpService.deleteTimeEntry('task-1', 'time-1');

      expect(client.delete).toHaveBeenCalledWith('/task/task-1/time/time-1');
    });

    it('should fetch team time entries', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { data: [mockTimeEntry] } });

      const params = { start_date: 1704067200000, end_date: 1704153600000 };
      const result = await clickUpService.getTeamTimeEntries(params);

      expect(client.get).toHaveBeenCalledWith('/team/team-123/time_entries', { params });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('Comment Operations', () => {
    it('should fetch task comments', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      const mockComments = {
        comments: [
          {
            id: 'comment-1',
            comment_text: 'Test comment',
            user: { id: 1, username: 'user1', email: 'user1@test.com', color: '#7c4dff', initials: 'U1' },
            date: '2024-01-01T12:00:00.000Z',
          },
        ],
      };
      client.get.mockResolvedValue({ data: mockComments });

      const result = await clickUpService.getTaskComments('task-1');

      expect(client.get).toHaveBeenCalledWith('/task/task-1/comment');
      expect(result.comments).toHaveLength(1);
    });

    it('should create task comment', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.post.mockResolvedValue({ data: { id: 'comment-2' } });

      await clickUpService.createTaskComment('task-1', 'New comment', 1, true);

      expect(client.post).toHaveBeenCalledWith('/task/task-1/comment', {
        comment_text: 'New comment',
        assignee: 1,
        notify_all: true,
      });
    });
  });

  describe('TechDengue Helper Functions', () => {
    it('should get tasks by status', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const result = await clickUpService.getTasksByStatus('list-1');

      expect(result).toHaveProperty('in progress');
      expect(result).toHaveProperty('closed');
      expect(result).toHaveProperty('to do');
      expect(result['in progress']).toHaveLength(1);
    });

    it('should get tasks assigned to user', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { tasks: mockTasks } });

      await clickUpService.getMyTasks(1, { include_closed: false });

      expect(client.get).toHaveBeenCalledWith('/team/team-123/task', {
        params: expect.objectContaining({
          assignees: ['1'],
          include_closed: false,
        }),
      });
    });

    it('should get overdue tasks', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { tasks: [mockTask] } });

      const result = await clickUpService.getOverdueTasks('list-1');

      expect(client.get).toHaveBeenCalledWith('/list/list-1/task', {
        params: expect.objectContaining({
          due_date_lt: expect.any(Number),
          include_closed: false,
        }),
      });
      expect(result).toHaveLength(1);
    });

    it('should get tasks due this week', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const result = await clickUpService.getTasksDueThisWeek('list-1');

      expect(client.get).toHaveBeenCalledWith('/list/list-1/task', {
        params: expect.objectContaining({
          due_date_gt: expect.any(Number),
          due_date_lt: expect.any(Number),
          include_closed: false,
        }),
      });
      expect(result).toHaveLength(3);
    });

    it('should calculate task metrics', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const result = await clickUpService.getTaskMetrics('list-1');

      expect(result).toHaveProperty('total', 3);
      expect(result).toHaveProperty('completed', 1);
      expect(result).toHaveProperty('inProgress', 1);
      expect(result).toHaveProperty('overdue');
      expect(result).toHaveProperty('completionRate');
    });

    it('should calculate completion rate correctly', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const result = await clickUpService.getTaskMetrics('list-1');

      // 1 out of 3 tasks completed = 33.33%
      expect(result.completionRate).toBeCloseTo(33.33, 1);
    });

    it('should handle empty task list for metrics', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockResolvedValue({ data: { tasks: [] } });

      const result = await clickUpService.getTaskMetrics('list-1');

      expect(result.total).toBe(0);
      expect(result.completed).toBe(0);
      expect(result.inProgress).toBe(0);
      expect(result.overdue).toBe(0);
      expect(result.completionRate).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockRejectedValue(new Error('API Error'));

      await expect(clickUpService.getTeam()).rejects.toThrow('API Error');
    });

    it('should handle network errors', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockRejectedValue({ message: 'Network Error' });

      await expect(clickUpService.getTasks('list-1')).rejects.toEqual({ message: 'Network Error' });
    });

    it('should handle 401 unauthorized', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockRejectedValue({
        response: { status: 401, data: { message: 'Unauthorized' } },
      });

      await expect(clickUpService.getTeam()).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    it('should handle 403 forbidden', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockRejectedValue({
        response: { status: 403, data: { message: 'Forbidden' } },
      });

      await expect(clickUpService.getSpace('space-1')).rejects.toMatchObject({
        response: { status: 403 },
      });
    });

    it('should handle 404 not found', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockRejectedValue({
        response: { status: 404, data: { message: 'Not found' } },
      });

      await expect(clickUpService.getTask('invalid-id')).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('should handle 500 server error', async () => {
      const { clickUpService } = await import('@/lib/services/clickup.service');
      const client = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      client.get.mockRejectedValue({
        response: { status: 500, data: { message: 'Internal Server Error' } },
      });

      await expect(clickUpService.getLists('folder-1')).rejects.toMatchObject({
        response: { status: 500 },
      });
    });
  });
});

import axios, { AxiosInstance } from 'axios';

// ClickUp API Types
export interface ClickUpTask {
  id: string;
  name: string;
  description?: string;
  status: {
    status: string;
    color: string;
    type: string;
  };
  priority?: {
    id: string;
    priority: string;
    color: string;
  };
  assignees: ClickUpUser[];
  due_date?: string;
  start_date?: string;
  time_estimate?: number;
  time_spent?: number;
  tags: ClickUpTag[];
  custom_fields: ClickUpCustomField[];
  list: { id: string; name: string };
  folder: { id: string; name: string };
  space: { id: string; name: string };
  url: string;
  date_created: string;
  date_updated: string;
  creator: ClickUpUser;
}

export interface ClickUpUser {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture?: string;
  initials: string;
}

export interface ClickUpTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
}

export interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  value?: unknown;
}

export interface ClickUpList {
  id: string;
  name: string;
  content?: string;
  status?: { status: string; color: string };
  priority?: { priority: string; color: string };
  due_date?: string;
  start_date?: string;
  folder: { id: string; name: string };
  space: { id: string; name: string };
  task_count: number;
}

export interface ClickUpSpace {
  id: string;
  name: string;
  color?: string;
  private: boolean;
  statuses: Array<{ status: string; color: string; type: string }>;
  features: {
    due_dates: { enabled: boolean };
    time_tracking: { enabled: boolean };
    tags: { enabled: boolean };
    priorities: { enabled: boolean };
  };
}

export interface ClickUpTeam {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  members: ClickUpMember[];
}

export interface ClickUpMember {
  user: ClickUpUser;
  role: number;
}

export interface CreateTaskDTO {
  name: string;
  description?: string;
  assignees?: number[];
  tags?: string[];
  status?: string;
  priority?: number;
  due_date?: number;
  start_date?: number;
  time_estimate?: number;
  notify_all?: boolean;
  parent?: string;
  custom_fields?: Array<{ id: string; value: unknown }>;
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
  archived?: boolean;
}

export interface TaskQueryParams {
  page?: number;
  archived?: boolean;
  include_closed?: boolean;
  assignees?: string[];
  statuses?: string[];
  tags?: string[];
  due_date_gt?: number;
  due_date_lt?: number;
  date_created_gt?: number;
  date_created_lt?: number;
  date_updated_gt?: number;
  date_updated_lt?: number;
  custom_fields?: Array<{ field_id: string; operator: string; value: unknown }>;
  order_by?: 'id' | 'created' | 'updated' | 'due_date';
  reverse?: boolean;
  subtasks?: boolean;
  include_markdown_description?: boolean;
}

export interface ClickUpTimeEntry {
  id: string;
  task: { id: string; name: string };
  user: ClickUpUser;
  start: string;
  end?: string;
  duration: number;
  description?: string;
  tags: ClickUpTag[];
  billable: boolean;
}

export interface CreateTimeEntryDTO {
  description?: string;
  start: number;
  end?: number;
  duration?: number;
  assignee?: number;
  billable?: boolean;
  tags?: string[];
}

class ClickUpService {
  private client: AxiosInstance;
  private apiKey: string;
  private teamId: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_CLICKUP_API_KEY || '';
    this.teamId = process.env.NEXT_PUBLIC_CLICKUP_TEAM_ID || '';

    this.client = axios.create({
      baseURL: 'https://api.clickup.com/api/v2',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey,
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[ClickUp API Error]:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Check if service is configured
  isConfigured(): boolean {
    return !!this.apiKey && !!this.teamId;
  }

  // =====================
  // TEAM / WORKSPACE
  // =====================

  async getTeam(): Promise<ClickUpTeam> {
    const response = await this.client.get<ClickUpTeam>(`/team/${this.teamId}`);
    return response.data;
  }

  async getTeams(): Promise<{ teams: ClickUpTeam[] }> {
    const response = await this.client.get<{ teams: ClickUpTeam[] }>('/team');
    return response.data;
  }

  // =====================
  // SPACES
  // =====================

  async getSpaces(): Promise<{ spaces: ClickUpSpace[] }> {
    const response = await this.client.get<{ spaces: ClickUpSpace[] }>(
      `/team/${this.teamId}/space`
    );
    return response.data;
  }

  async getSpace(spaceId: string): Promise<ClickUpSpace> {
    const response = await this.client.get<ClickUpSpace>(`/space/${spaceId}`);
    return response.data;
  }

  // =====================
  // LISTS
  // =====================

  async getLists(folderId: string): Promise<{ lists: ClickUpList[] }> {
    const response = await this.client.get<{ lists: ClickUpList[] }>(
      `/folder/${folderId}/list`
    );
    return response.data;
  }

  async getFolderlessLists(spaceId: string): Promise<{ lists: ClickUpList[] }> {
    const response = await this.client.get<{ lists: ClickUpList[] }>(
      `/space/${spaceId}/list`
    );
    return response.data;
  }

  async getList(listId: string): Promise<ClickUpList> {
    const response = await this.client.get<ClickUpList>(`/list/${listId}`);
    return response.data;
  }

  // =====================
  // TASKS
  // =====================

  async getTasks(listId: string, params?: TaskQueryParams): Promise<{ tasks: ClickUpTask[] }> {
    const response = await this.client.get<{ tasks: ClickUpTask[] }>(
      `/list/${listId}/task`,
      { params }
    );
    return response.data;
  }

  async getTask(taskId: string): Promise<ClickUpTask> {
    const response = await this.client.get<ClickUpTask>(`/task/${taskId}`);
    return response.data;
  }

  async createTask(listId: string, data: CreateTaskDTO): Promise<ClickUpTask> {
    const response = await this.client.post<ClickUpTask>(
      `/list/${listId}/task`,
      data
    );
    return response.data;
  }

  async updateTask(taskId: string, data: UpdateTaskDTO): Promise<ClickUpTask> {
    const response = await this.client.put<ClickUpTask>(`/task/${taskId}`, data);
    return response.data;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.client.delete(`/task/${taskId}`);
  }

  // Get filtered tasks by team (all tasks in workspace)
  async getFilteredTasks(params?: TaskQueryParams): Promise<{ tasks: ClickUpTask[] }> {
    const response = await this.client.get<{ tasks: ClickUpTask[] }>(
      `/team/${this.teamId}/task`,
      { params }
    );
    return response.data;
  }

  // =====================
  // TIME TRACKING
  // =====================

  async getTimeEntries(
    taskId: string,
    params?: { start_date?: number; end_date?: number }
  ): Promise<{ data: ClickUpTimeEntry[] }> {
    const response = await this.client.get<{ data: ClickUpTimeEntry[] }>(
      `/task/${taskId}/time`,
      { params }
    );
    return response.data;
  }

  async createTimeEntry(taskId: string, data: CreateTimeEntryDTO): Promise<ClickUpTimeEntry> {
    const response = await this.client.post<ClickUpTimeEntry>(
      `/task/${taskId}/time`,
      data
    );
    return response.data;
  }

  async deleteTimeEntry(taskId: string, entryId: string): Promise<void> {
    await this.client.delete(`/task/${taskId}/time/${entryId}`);
  }

  // Get all time entries in a date range
  async getTeamTimeEntries(params: {
    start_date: number;
    end_date: number;
    assignee?: number;
  }): Promise<{ data: ClickUpTimeEntry[] }> {
    const response = await this.client.get<{ data: ClickUpTimeEntry[] }>(
      `/team/${this.teamId}/time_entries`,
      { params }
    );
    return response.data;
  }

  // =====================
  // COMMENTS
  // =====================

  async getTaskComments(taskId: string): Promise<{ comments: Array<{
    id: string;
    comment_text: string;
    user: ClickUpUser;
    date: string;
  }> }> {
    const response = await this.client.get(`/task/${taskId}/comment`);
    return response.data;
  }

  async createTaskComment(
    taskId: string,
    commentText: string,
    assignee?: number,
    notifyAll?: boolean
  ): Promise<unknown> {
    const response = await this.client.post(`/task/${taskId}/comment`, {
      comment_text: commentText,
      assignee,
      notify_all: notifyAll,
    });
    return response.data;
  }

  // =====================
  // HELPERS - TECHDENGUE SPECIFIC
  // =====================

  // Get tasks by status for dashboard
  async getTasksByStatus(listId: string): Promise<Record<string, ClickUpTask[]>> {
    const { tasks } = await this.getTasks(listId, { include_closed: true });

    return tasks.reduce((acc, task) => {
      const status = task.status.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {} as Record<string, ClickUpTask[]>);
  }

  // Get tasks assigned to a specific user
  async getMyTasks(userId: number, params?: TaskQueryParams): Promise<{ tasks: ClickUpTask[] }> {
    return this.getFilteredTasks({
      ...params,
      assignees: [userId.toString()],
    });
  }

  // Get overdue tasks
  async getOverdueTasks(listId: string): Promise<ClickUpTask[]> {
    const now = Date.now();
    const { tasks } = await this.getTasks(listId, {
      due_date_lt: now,
      include_closed: false,
    });
    return tasks;
  }

  // Get tasks due this week
  async getTasksDueThisWeek(listId: string): Promise<ClickUpTask[]> {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const { tasks } = await this.getTasks(listId, {
      due_date_gt: now.getTime(),
      due_date_lt: endOfWeek.getTime(),
      include_closed: false,
    });
    return tasks;
  }

  // Calculate task metrics for dashboard
  async getTaskMetrics(listId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  }> {
    const { tasks } = await this.getTasks(listId, { include_closed: true });
    const now = Date.now();

    const completed = tasks.filter((t) => t.status.type === 'closed').length;
    const inProgress = tasks.filter(
      (t) => t.status.type !== 'closed' && t.status.status.toLowerCase() !== 'to do'
    ).length;
    const overdue = tasks.filter(
      (t) => t.due_date && parseInt(t.due_date) < now && t.status.type !== 'closed'
    ).length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      overdue,
      completionRate: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
    };
  }
}

export const clickUpService = new ClickUpService();

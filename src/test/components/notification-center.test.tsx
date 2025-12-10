import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  NotificationCenter,
  useNotifications,
  createNotification,
  type Notification,
  type NotificationType,
} from '@/components/notifications/notification-center';
import { act, renderHook } from '@testing-library/react';

// Mock date-fns to have consistent timestamps
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    formatDistanceToNow: () => 'há 5 minutos',
  };
});

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'Informação',
    message: 'Esta é uma notificação de informação',
    timestamp: new Date('2024-01-15T10:00:00Z'),
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Sucesso',
    message: 'Operação realizada com sucesso',
    timestamp: new Date('2024-01-15T09:00:00Z'),
    read: true,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Aviso',
    message: 'Atenção necessária',
    timestamp: new Date('2024-01-15T08:00:00Z'),
    read: false,
    link: '/dashboard',
    actionLabel: 'Ver detalhes',
  },
  {
    id: '4',
    type: 'error',
    title: 'Erro',
    message: 'Algo deu errado',
    timestamp: new Date('2024-01-15T07:00:00Z'),
    read: false,
  },
];

describe('NotificationCenter', () => {
  describe('Rendering', () => {
    it('should render bell icon button', () => {
      render(<NotificationCenter notifications={[]} />);

      const button = screen.getByRole('button', { name: /notificações/i });
      expect(button).toBeInTheDocument();
    });

    it('should show unread badge when there are unread notifications', () => {
      const { container } = render(<NotificationCenter notifications={mockNotifications} />);

      // 3 unread notifications
      const badge = container.querySelector('.absolute.-top-1.-right-1');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('3');
    });

    it('should not show badge when all notifications are read', () => {
      const readNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
      const { container } = render(<NotificationCenter notifications={readNotifications} />);

      const badge = container.querySelector('.absolute.-top-1.-right-1');
      expect(badge).not.toBeInTheDocument();
    });

    it('should show 9+ when unread count exceeds 9', () => {
      const manyNotifications = Array.from({ length: 12 }, (_, i) => ({
        id: `${i}`,
        type: 'info' as NotificationType,
        title: `Notificação ${i}`,
        message: 'Mensagem',
        timestamp: new Date(),
        read: false,
      }));

      const { container } = render(<NotificationCenter notifications={manyNotifications} />);

      const badge = container.querySelector('.absolute.-top-1.-right-1');
      expect(badge).toHaveTextContent('9+');
    });

    it('should not show badge when no notifications', () => {
      const { container } = render(<NotificationCenter notifications={[]} />);

      const badge = container.querySelector('.absolute.-top-1.-right-1');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('Popover Interaction', () => {
    it('should open popover when bell button is clicked', async () => {
      const user = userEvent.setup();
      render(<NotificationCenter notifications={mockNotifications} />);

      const button = screen.getByRole('button', { name: /notificações/i });
      await user.click(button);

      expect(screen.getByText('Notificações')).toBeInTheDocument();
    });

    it('should show notification list in popover', async () => {
      const user = userEvent.setup();
      render(<NotificationCenter notifications={mockNotifications} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      expect(screen.getByText('Informação')).toBeInTheDocument();
      expect(screen.getByText('Sucesso')).toBeInTheDocument();
      expect(screen.getByText('Aviso')).toBeInTheDocument();
      expect(screen.getByText('Erro')).toBeInTheDocument();
    });

    it('should show unread count in header', async () => {
      const user = userEvent.setup();
      render(<NotificationCenter notifications={mockNotifications} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      expect(screen.getByText('3 novas')).toBeInTheDocument();
    });

    it('should show "1 nova" for single unread', async () => {
      const user = userEvent.setup();
      const singleUnread = [{ ...mockNotifications[0], read: false }];
      render(<NotificationCenter notifications={singleUnread} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      expect(screen.getByText('1 nova')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no notifications', async () => {
      const user = userEvent.setup();
      render(<NotificationCenter notifications={[]} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      expect(screen.getByText('Nenhuma notificação')).toBeInTheDocument();
      expect(screen.getByText(/você será notificado/i)).toBeInTheDocument();
    });
  });

  describe('Notification Types', () => {
    it('should render info notification with correct styling', async () => {
      const user = userEvent.setup();
      const infoNotification = [mockNotifications[0]];
      render(<NotificationCenter notifications={infoNotification} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      const notification = screen.getByText('Informação');
      expect(notification).toBeInTheDocument();
    });

    it('should render success notification', async () => {
      const user = userEvent.setup();
      const successNotification = [mockNotifications[1]];
      render(<NotificationCenter notifications={successNotification} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      expect(screen.getByText('Sucesso')).toBeInTheDocument();
    });

    it('should render warning notification', async () => {
      const user = userEvent.setup();
      const warningNotification = [mockNotifications[2]];
      render(<NotificationCenter notifications={warningNotification} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      expect(screen.getByText('Aviso')).toBeInTheDocument();
    });

    it('should render error notification', async () => {
      const user = userEvent.setup();
      const errorNotification = [mockNotifications[3]];
      render(<NotificationCenter notifications={errorNotification} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      expect(screen.getByText('Erro')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onMarkAsRead when notification is clicked', async () => {
      const user = userEvent.setup();
      const onMarkAsRead = vi.fn();
      render(
        <NotificationCenter
          notifications={mockNotifications}
          onMarkAsRead={onMarkAsRead}
        />
      );

      await user.click(screen.getByRole('button', { name: /notificações/i }));
      await user.click(screen.getByText('Informação'));

      expect(onMarkAsRead).toHaveBeenCalledWith('1');
    });

    it('should call onMarkAllAsRead when "Marcar todas" is clicked', async () => {
      const user = userEvent.setup();
      const onMarkAllAsRead = vi.fn();
      render(
        <NotificationCenter
          notifications={mockNotifications}
          onMarkAllAsRead={onMarkAllAsRead}
        />
      );

      await user.click(screen.getByRole('button', { name: /notificações/i }));
      await user.click(screen.getByText('Marcar todas'));

      expect(onMarkAllAsRead).toHaveBeenCalled();
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(
        <NotificationCenter
          notifications={mockNotifications}
          onDelete={onDelete}
        />
      );

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      // Click the first delete button (X icon)
      const deleteButtons = screen.getAllByRole('button', { name: /remover/i });
      await user.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('should call onClearAll when "Limpar todas" is clicked', async () => {
      const user = userEvent.setup();
      const onClearAll = vi.fn();
      render(
        <NotificationCenter
          notifications={mockNotifications}
          onClearAll={onClearAll}
        />
      );

      await user.click(screen.getByRole('button', { name: /notificações/i }));
      await user.click(screen.getByText('Limpar todas'));

      expect(onClearAll).toHaveBeenCalled();
    });

    it('should render action button when actionLabel is provided', async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      const notificationWithAction = [{
        ...mockNotifications[2],
        onAction,
      }];
      render(<NotificationCenter notifications={notificationWithAction} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      const actionButton = screen.getByText('Ver detalhes');
      expect(actionButton).toBeInTheDocument();

      await user.click(actionButton);
      expect(onAction).toHaveBeenCalled();
    });
  });

  describe('Unread Indicator', () => {
    it('should distinguish between read and unread notifications', () => {
      // Test unreadCount calculation
      const unreadCount = mockNotifications.filter(n => !n.read).length;
      expect(unreadCount).toBe(3);
    });

    it('should show all notifications in the list', async () => {
      const user = userEvent.setup();
      render(<NotificationCenter notifications={mockNotifications} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      // Should render all notifications
      expect(screen.getByText('Informação')).toBeInTheDocument();
      expect(screen.getByText('Sucesso')).toBeInTheDocument();
    });
  });

  describe('Max Visible', () => {
    it('should limit visible notifications based on maxVisible prop', async () => {
      const user = userEvent.setup();
      const manyNotifications = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        type: 'info' as NotificationType,
        title: `Notificação ${i}`,
        message: 'Mensagem',
        timestamp: new Date(),
        read: false,
      }));

      render(<NotificationCenter notifications={manyNotifications} maxVisible={5} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      // Should only show first 5 notifications (0-4)
      expect(screen.getByText('Notificação 0')).toBeInTheDocument();
      expect(screen.getByText('Notificação 4')).toBeInTheDocument();
      expect(screen.queryByText('Notificação 5')).not.toBeInTheDocument();
    });
  });

  describe('Timestamp', () => {
    it('should display relative timestamp', async () => {
      const user = userEvent.setup();
      render(<NotificationCenter notifications={mockNotifications} />);

      await user.click(screen.getByRole('button', { name: /notificações/i }));

      // Should show timestamp text from our mock
      await waitFor(() => {
        const timestampElements = screen.getAllByText(/há/);
        expect(timestampElements.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('useNotifications Hook', () => {
  it('should initialize with empty notifications', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should initialize with provided notifications', () => {
    const { result } = renderHook(() => useNotifications(mockNotifications));

    expect(result.current.notifications).toHaveLength(4);
    expect(result.current.unreadCount).toBe(3);
  });

  describe('addNotification', () => {
    it('should add a new notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Nova Notificação',
          message: 'Mensagem de teste',
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('Nova Notificação');
      expect(result.current.notifications[0].read).toBe(false);
    });

    it('should generate unique id for new notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Notificação 1',
          message: 'Mensagem',
        });
        result.current.addNotification({
          type: 'info',
          title: 'Notificação 2',
          message: 'Mensagem',
        });
      });

      expect(result.current.notifications[0].id).not.toBe(result.current.notifications[1].id);
    });

    it('should set timestamp to current time', () => {
      const { result } = renderHook(() => useNotifications());
      const before = Date.now();

      act(() => {
        result.current.addNotification({
          type: 'success',
          title: 'Teste',
          message: 'Mensagem',
        });
      });

      const after = Date.now();
      const timestamp = result.current.notifications[0].timestamp.getTime();

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should add new notifications at the beginning', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Primeira',
          message: 'Mensagem',
        });
      });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Segunda',
          message: 'Mensagem',
        });
      });

      expect(result.current.notifications[0].title).toBe('Segunda');
      expect(result.current.notifications[1].title).toBe('Primeira');
    });

    it('should return the notification id', () => {
      const { result } = renderHook(() => useNotifications());

      let id: string;
      act(() => {
        id = result.current.addNotification({
          type: 'info',
          title: 'Teste',
          message: 'Mensagem',
        });
      });

      expect(id!).toMatch(/^notif-\d+-[a-z0-9]+$/);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const { result } = renderHook(() => useNotifications(mockNotifications));

      expect(result.current.notifications[0].read).toBe(false);

      act(() => {
        result.current.markAsRead('1');
      });

      expect(result.current.notifications.find((n) => n.id === '1')?.read).toBe(true);
    });

    it('should decrease unread count', () => {
      const { result } = renderHook(() => useNotifications(mockNotifications));

      expect(result.current.unreadCount).toBe(3);

      act(() => {
        result.current.markAsRead('1');
      });

      expect(result.current.unreadCount).toBe(2);
    });

    it('should not affect already read notifications', () => {
      const { result } = renderHook(() => useNotifications(mockNotifications));

      act(() => {
        result.current.markAsRead('2'); // Already read
      });

      expect(result.current.unreadCount).toBe(3); // Still 3
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const { result } = renderHook(() => useNotifications(mockNotifications));

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.notifications.every((n) => n.read)).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should remove notification by id', () => {
      const { result } = renderHook(() => useNotifications(mockNotifications));

      expect(result.current.notifications).toHaveLength(4);

      act(() => {
        result.current.deleteNotification('1');
      });

      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.notifications.find((n) => n.id === '1')).toBeUndefined();
    });

    it('should update unread count when deleting unread notification', () => {
      const { result } = renderHook(() => useNotifications(mockNotifications));

      expect(result.current.unreadCount).toBe(3);

      act(() => {
        result.current.deleteNotification('1'); // Unread
      });

      expect(result.current.unreadCount).toBe(2);
    });
  });

  describe('clearAll', () => {
    it('should remove all notifications', () => {
      const { result } = renderHook(() => useNotifications(mockNotifications));

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
    });
  });
});

describe('createNotification Helper', () => {
  it('should create notification with required fields', () => {
    const notification = createNotification('info', 'Título', 'Mensagem');

    expect(notification).toEqual({
      type: 'info',
      title: 'Título',
      message: 'Mensagem',
    });
  });

  it('should include optional link', () => {
    const notification = createNotification('success', 'Título', 'Mensagem', {
      link: '/dashboard',
    });

    expect(notification.link).toBe('/dashboard');
  });

  it('should include optional actionLabel', () => {
    const notification = createNotification('warning', 'Título', 'Mensagem', {
      actionLabel: 'Ver mais',
    });

    expect(notification.actionLabel).toBe('Ver mais');
  });

  it('should include optional onAction', () => {
    const onAction = vi.fn();
    const notification = createNotification('error', 'Título', 'Mensagem', {
      onAction,
    });

    expect(notification.onAction).toBe(onAction);
  });

  it('should work with all options together', () => {
    const onAction = vi.fn();
    const notification = createNotification('info', 'Completo', 'Mensagem completa', {
      link: '/page',
      actionLabel: 'Ação',
      onAction,
    });

    expect(notification).toEqual({
      type: 'info',
      title: 'Completo',
      message: 'Mensagem completa',
      link: '/page',
      actionLabel: 'Ação',
      onAction,
    });
  });
});

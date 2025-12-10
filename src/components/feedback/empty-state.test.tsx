import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { EmptyState, InlineEmpty } from './empty-state';

describe('EmptyState', () => {
  it('should render with default props', () => {
    render(<EmptyState />);

    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    expect(screen.getByText('Não há dados para exibir no momento.')).toBeInTheDocument();
  });

  it('should render with custom title and description', () => {
    render(
      <EmptyState
        title="Custom Title"
        description="Custom description"
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        action={{
          label: 'Add Item',
          onClick,
        }}
      />
    );

    const actionButton = screen.getByRole('button', { name: /add item/i });
    expect(actionButton).toBeInTheDocument();

    fireEvent.click(actionButton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not render action button when not provided', () => {
    render(<EmptyState />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render search type', () => {
    render(<EmptyState type="search" />);

    expect(screen.getByText('Nenhum resultado')).toBeInTheDocument();
  });

  it('should render filter type', () => {
    render(<EmptyState type="filter" />);

    expect(screen.getByText('Nenhum resultado com esses filtros')).toBeInTheDocument();
  });

  it('should render map type', () => {
    render(<EmptyState type="map" />);

    expect(screen.getByText('Nenhum ponto no mapa')).toBeInTheDocument();
  });

  it('should render calendar type', () => {
    render(<EmptyState type="calendar" />);

    expect(screen.getByText('Nenhuma atividade')).toBeInTheDocument();
  });

  it('should render compact variant', () => {
    render(<EmptyState compact />);

    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
  });

  it('should render compact variant with action', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        compact
        action={{
          label: 'Add',
          onClick,
        }}
      />
    );

    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });
});

describe('InlineEmpty', () => {
  it('should render message', () => {
    render(<InlineEmpty message="No items found" />);

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });
});

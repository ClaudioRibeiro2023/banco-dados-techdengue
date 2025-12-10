import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { ErrorState, InlineError } from './error-state';

describe('ErrorState', () => {
  it('should render with default props', () => {
    render(<ErrorState />);

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Ocorreu um erro inesperado. Tente novamente.')).toBeInTheDocument();
  });

  it('should render with custom title and description', () => {
    render(
      <ErrorState
        title="Custom Error"
        description="Custom description"
      />
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorState />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render network error type', () => {
    render(<ErrorState type="network" />);

    expect(screen.getByText('Sem conexão')).toBeInTheDocument();
  });

  it('should render server error type', () => {
    render(<ErrorState type="server" />);

    expect(screen.getByText('Erro no servidor')).toBeInTheDocument();
  });

  it('should render notFound error type', () => {
    render(<ErrorState type="notFound" />);

    expect(screen.getByText('Não encontrado')).toBeInTheDocument();
  });

  it('should render compact variant', () => {
    render(<ErrorState compact />);

    // Compact version has smaller text
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
  });
});

describe('InlineError', () => {
  it('should render error message', () => {
    render(<InlineError message="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<InlineError message="Error" onRetry={onRetry} />);

    const retryButton = screen.getByRole('button');
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

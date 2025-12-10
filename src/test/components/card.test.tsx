import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card';

describe('Card', () => {
  describe('Rendering', () => {
    it('should render card with children', () => {
      render(<Card>Card Content</Card>);

      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Card>Content</Card>);

      const card = screen.getByText('Content').closest('[data-slot="card"]');
      expect(card).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Card className="custom-class">Content</Card>);

      const card = screen.getByText('Content').closest('[data-slot="card"]');
      expect(card).toHaveClass('custom-class');
    });

    it('should have bg-card class', () => {
      render(<Card>Content</Card>);

      const card = screen.getByText('Content').closest('[data-slot="card"]');
      expect(card).toHaveClass('bg-card');
    });

    it('should have rounded-xl class', () => {
      render(<Card>Content</Card>);

      const card = screen.getByText('Content').closest('[data-slot="card"]');
      expect(card).toHaveClass('rounded-xl');
    });

    it('should have border class', () => {
      render(<Card>Content</Card>);

      const card = screen.getByText('Content').closest('[data-slot="card"]');
      expect(card).toHaveClass('border');
    });

    it('should have shadow-sm class', () => {
      render(<Card>Content</Card>);

      const card = screen.getByText('Content').closest('[data-slot="card"]');
      expect(card).toHaveClass('shadow-sm');
    });
  });

  describe('CardHeader', () => {
    it('should render header with children', () => {
      render(
        <Card>
          <CardHeader>Header Content</CardHeader>
        </Card>
      );

      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );

      const header = screen.getByText('Header').closest('[data-slot="card-header"]');
      expect(header).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Card>
          <CardHeader className="header-class">Header</CardHeader>
        </Card>
      );

      const header = screen.getByText('Header').closest('[data-slot="card-header"]');
      expect(header).toHaveClass('header-class');
    });

    it('should have px-6 class', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );

      const header = screen.getByText('Header').closest('[data-slot="card-header"]');
      expect(header).toHaveClass('px-6');
    });
  });

  describe('CardTitle', () => {
    it('should render title with children', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByText('Title').closest('[data-slot="card-title"]');
      expect(title).toBeInTheDocument();
    });

    it('should have font-semibold class', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByText('Title').closest('[data-slot="card-title"]');
      expect(title).toHaveClass('font-semibold');
    });

    it('should apply custom className', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle className="title-class">Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByText('Title').closest('[data-slot="card-title"]');
      expect(title).toHaveClass('title-class');
    });
  });

  describe('CardDescription', () => {
    it('should render description with children', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Card Description')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      );

      const desc = screen.getByText('Description').closest('[data-slot="card-description"]');
      expect(desc).toBeInTheDocument();
    });

    it('should have text-muted-foreground class', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      );

      const desc = screen.getByText('Description').closest('[data-slot="card-description"]');
      expect(desc).toHaveClass('text-muted-foreground');
    });

    it('should have text-sm class', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      );

      const desc = screen.getByText('Description').closest('[data-slot="card-description"]');
      expect(desc).toHaveClass('text-sm');
    });
  });

  describe('CardAction', () => {
    it('should render action with children', () => {
      render(
        <Card>
          <CardHeader>
            <CardAction>Action</CardAction>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Card>
          <CardHeader>
            <CardAction>Action</CardAction>
          </CardHeader>
        </Card>
      );

      const action = screen.getByText('Action').closest('[data-slot="card-action"]');
      expect(action).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Card>
          <CardHeader>
            <CardAction className="action-class">Action</CardAction>
          </CardHeader>
        </Card>
      );

      const action = screen.getByText('Action').closest('[data-slot="card-action"]');
      expect(action).toHaveClass('action-class');
    });
  });

  describe('CardContent', () => {
    it('should render content with children', () => {
      render(
        <Card>
          <CardContent>Main Content</CardContent>
        </Card>
      );

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      );

      const content = screen.getByText('Content').closest('[data-slot="card-content"]');
      expect(content).toBeInTheDocument();
    });

    it('should have px-6 class', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      );

      const content = screen.getByText('Content').closest('[data-slot="card-content"]');
      expect(content).toHaveClass('px-6');
    });

    it('should apply custom className', () => {
      render(
        <Card>
          <CardContent className="content-class">Content</CardContent>
        </Card>
      );

      const content = screen.getByText('Content').closest('[data-slot="card-content"]');
      expect(content).toHaveClass('content-class');
    });
  });

  describe('CardFooter', () => {
    it('should render footer with children', () => {
      render(
        <Card>
          <CardFooter>Footer Content</CardFooter>
        </Card>
      );

      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      const footer = screen.getByText('Footer').closest('[data-slot="card-footer"]');
      expect(footer).toBeInTheDocument();
    });

    it('should have flex class', () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      const footer = screen.getByText('Footer').closest('[data-slot="card-footer"]');
      expect(footer).toHaveClass('flex');
    });

    it('should have items-center class', () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      const footer = screen.getByText('Footer').closest('[data-slot="card-footer"]');
      expect(footer).toHaveClass('items-center');
    });

    it('should have px-6 class', () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      const footer = screen.getByText('Footer').closest('[data-slot="card-footer"]');
      expect(footer).toHaveClass('px-6');
    });

    it('should apply custom className', () => {
      render(
        <Card>
          <CardFooter className="footer-class">Footer</CardFooter>
        </Card>
      );

      const footer = screen.getByText('Footer').closest('[data-slot="card-footer"]');
      expect(footer).toHaveClass('footer-class');
    });
  });

  describe('Complete Card', () => {
    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should render card with action', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
        </Card>
      );

      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });
});

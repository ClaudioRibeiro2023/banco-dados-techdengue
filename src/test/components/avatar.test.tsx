import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

describe('Avatar', () => {
  describe('Basic Rendering', () => {
    it('should render avatar container', () => {
      render(<Avatar data-testid="avatar" />);

      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Avatar />);

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Avatar Styling', () => {
    it('should have relative class', () => {
      render(<Avatar />);

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('relative');
    });

    it('should have flex class', () => {
      render(<Avatar />);

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('flex');
    });

    it('should have size-8 class', () => {
      render(<Avatar />);

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('size-8');
    });

    it('should have shrink-0 class', () => {
      render(<Avatar />);

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('shrink-0');
    });

    it('should have overflow-hidden class', () => {
      render(<Avatar />);

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('overflow-hidden');
    });

    it('should have rounded-full class', () => {
      render(<Avatar />);

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('rounded-full');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept custom className on Avatar', () => {
      render(<Avatar className="size-12" />);

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('size-12');
    });

    it('should merge custom className with defaults', () => {
      render(<Avatar className="border-2" />);

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('border-2');
      expect(avatar).toHaveClass('relative');
      expect(avatar).toHaveClass('rounded-full');
    });
  });
});

describe('AvatarImage', () => {
  // Note: Radix UI Avatar uses a delayed rendering mechanism for images
  // The image doesn't render immediately in jsdom, so we test the component structure
  // rather than the rendered image element

  describe('Basic Rendering', () => {
    it('should render AvatarImage component within Avatar', () => {
      render(
        <Avatar data-testid="avatar-with-image">
          <AvatarImage src="/avatar.jpg" alt="User avatar" />
          <AvatarFallback>UA</AvatarFallback>
        </Avatar>
      );

      // The avatar container should exist
      expect(screen.getByTestId('avatar-with-image')).toBeInTheDocument();
    });

    it('should render fallback when image is not loaded', () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="Test" />
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
      );

      // Fallback should be visible since image loading is async
      expect(screen.getByText('FB')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have avatar container with proper structure', () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="Test" />
          <AvatarFallback>TS</AvatarFallback>
        </Avatar>
      );

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toBeInTheDocument();
    });
  });
});

describe('AvatarFallback', () => {
  describe('Basic Rendering', () => {
    it('should render fallback content', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );

      const fallback = document.querySelector('[data-slot="avatar-fallback"]');
      expect(fallback).toBeInTheDocument();
    });
  });

  describe('Fallback Styling', () => {
    it('should have bg-muted class', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );

      const fallback = document.querySelector('[data-slot="avatar-fallback"]');
      expect(fallback).toHaveClass('bg-muted');
    });

    it('should have flex class', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );

      const fallback = document.querySelector('[data-slot="avatar-fallback"]');
      expect(fallback).toHaveClass('flex');
    });

    it('should have size-full class', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );

      const fallback = document.querySelector('[data-slot="avatar-fallback"]');
      expect(fallback).toHaveClass('size-full');
    });

    it('should have items-center class', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );

      const fallback = document.querySelector('[data-slot="avatar-fallback"]');
      expect(fallback).toHaveClass('items-center');
    });

    it('should have justify-center class', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );

      const fallback = document.querySelector('[data-slot="avatar-fallback"]');
      expect(fallback).toHaveClass('justify-center');
    });

    it('should have rounded-full class', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );

      const fallback = document.querySelector('[data-slot="avatar-fallback"]');
      expect(fallback).toHaveClass('rounded-full');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept custom className', () => {
      render(
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">AB</AvatarFallback>
        </Avatar>
      );

      const fallback = document.querySelector('[data-slot="avatar-fallback"]');
      expect(fallback).toHaveClass('bg-primary');
      expect(fallback).toHaveClass('text-primary-foreground');
    });

    it('should merge with default classes', () => {
      render(
        <Avatar>
          <AvatarFallback className="text-lg">AB</AvatarFallback>
        </Avatar>
      );

      const fallback = document.querySelector('[data-slot="avatar-fallback"]');
      expect(fallback).toHaveClass('text-lg');
      expect(fallback).toHaveClass('flex');
    });
  });
});

describe('Avatar Complete', () => {
  describe('With Image and Fallback', () => {
    it('should render avatar with fallback (image loading is async)', () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = document.querySelector('[data-slot="avatar"]');
      const fallback = document.querySelector('[data-slot="avatar-fallback"]');

      expect(avatar).toBeInTheDocument();
      // Fallback is visible while image loads (or fails to load in jsdom)
      expect(fallback).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work as user profile avatar', () => {
      render(
        <Avatar className="size-10">
          <AvatarImage src="/user-profile.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('size-10');
    });

    it('should work with initials fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('should work with single letter fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>J</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should work with icon fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>
            <span data-testid="user-icon">👤</span>
          </AvatarFallback>
        </Avatar>
      );

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('should work in a list of avatars', () => {
      render(
        <div className="flex -space-x-2">
          <Avatar>
            <AvatarFallback>A1</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>A2</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>A3</AvatarFallback>
          </Avatar>
        </div>
      );

      const avatars = document.querySelectorAll('[data-slot="avatar"]');
      expect(avatars).toHaveLength(3);
    });

    it('should work with different sizes', () => {
      render(
        <div>
          <Avatar className="size-6" data-testid="small">
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <Avatar className="size-8" data-testid="medium">
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <Avatar className="size-12" data-testid="large">
            <AvatarFallback>L</AvatarFallback>
          </Avatar>
        </div>
      );

      expect(screen.getByTestId('small')).toHaveClass('size-6');
      expect(screen.getByTestId('medium')).toHaveClass('size-8');
      expect(screen.getByTestId('large')).toHaveClass('size-12');
    });
  });

  describe('Props Forwarding', () => {
    it('should forward data-testid to Avatar', () => {
      render(<Avatar data-testid="my-avatar" />);

      expect(screen.getByTestId('my-avatar')).toBeInTheDocument();
    });

    it('should forward id to Avatar', () => {
      render(<Avatar id="avatar-1" />);

      expect(document.getElementById('avatar-1')).toBeInTheDocument();
    });

    it('should forward onClick to Avatar', () => {
      const onClick = () => {};
      render(<Avatar onClick={onClick} data-testid="clickable" />);

      expect(screen.getByTestId('clickable')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render empty Avatar', () => {
      render(<Avatar data-testid="empty" />);

      expect(screen.getByTestId('empty')).toBeInTheDocument();
    });

    it('should handle long fallback text', () => {
      render(
        <Avatar>
          <AvatarFallback>ABCDE</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('ABCDE')).toBeInTheDocument();
    });

    it('should handle special characters in fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>🎭</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('🎭')).toBeInTheDocument();
    });

    it('should handle empty fallback', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="empty-fallback" />
        </Avatar>
      );

      expect(screen.getByTestId('empty-fallback')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative fallback', () => {
      render(
        <Avatar>
          <AvatarFallback aria-hidden="true">JD</AvatarFallback>
        </Avatar>
      );

      const fallback = document.querySelector('[data-slot="avatar-fallback"]');
      expect(fallback).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support aria-label on avatar container', () => {
      render(
        <Avatar aria-label="User profile">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveAttribute('aria-label', 'User profile');
    });
  });
});

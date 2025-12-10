import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualTable, VirtualTableColumn } from '@/components/data-display/virtual-table';

// Note: @tanstack/react-virtual requires a real DOM with dimensions for virtualization.
// In jsdom, the scroll container has no height, so items may not render.
// These tests focus on what's testable in jsdom.

// Using Record<string, unknown> compatible type
type TestData = Record<string, unknown> & {
  id: number;
  name: string;
  email: string;
  status: string;
};

const mockColumns: VirtualTableColumn<TestData>[] = [
  { key: 'id', header: 'ID', width: 80 },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'status', header: 'Status', width: 100 },
];

const mockData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
];

describe('VirtualTable Component', () => {
  describe('Header Rendering', () => {
    it('should render table with column headers', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render all column headers', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      mockColumns.forEach((column) => {
        expect(screen.getByText(column.header)).toBeInTheDocument();
      });
    });

    it('should have header with background styling', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      const header = screen.getByText('ID').parentElement;
      expect(header).toHaveClass('bg-muted/50');
    });

    it('should have header with border-b', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      const header = screen.getByText('ID').parentElement;
      expect(header).toHaveClass('border-b');
    });

    it('should have header with font-medium', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      const header = screen.getByText('ID').parentElement;
      expect(header).toHaveClass('font-medium');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when data is empty', () => {
      render(<VirtualTable data={[]} columns={mockColumns} />);

      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      render(
        <VirtualTable
          data={[]}
          columns={mockColumns}
          emptyMessage="No users found"
        />
      );

      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('should not show headers when empty', () => {
      render(<VirtualTable data={[]} columns={mockColumns} />);

      expect(screen.queryByText('ID')).not.toBeInTheDocument();
      expect(screen.queryByText('Name')).not.toBeInTheDocument();
    });
  });

  describe('Container Styling', () => {
    it('should have rounded-lg class on container', () => {
      const { container } = render(
        <VirtualTable data={mockData} columns={mockColumns} />
      );

      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('should have border class on container', () => {
      const { container } = render(
        <VirtualTable data={mockData} columns={mockColumns} />
      );

      expect(container.firstChild).toHaveClass('border');
    });

    it('should have overflow-hidden class on container', () => {
      const { container } = render(
        <VirtualTable data={mockData} columns={mockColumns} />
      );

      expect(container.firstChild).toHaveClass('overflow-hidden');
    });

    it('should accept custom className', () => {
      const { container } = render(
        <VirtualTable
          data={mockData}
          columns={mockColumns}
          className="custom-table"
        />
      );

      expect(container.firstChild).toHaveClass('custom-table');
    });
  });

  describe('Sticky Header', () => {
    it('should have sticky header by default', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      const headerRow = screen.getByText('ID').parentElement;
      expect(headerRow).toHaveClass('sticky');
    });

    it('should not have sticky header when stickyHeader is false', () => {
      render(
        <VirtualTable
          data={mockData}
          columns={mockColumns}
          stickyHeader={false}
        />
      );

      const headerRow = screen.getByText('ID').parentElement;
      expect(headerRow).not.toHaveClass('sticky');
    });

    it('should have z-10 on sticky header', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      const headerRow = screen.getByText('ID').parentElement;
      expect(headerRow).toHaveClass('z-10');
    });
  });

  describe('Column Configuration', () => {
    it('should render columns with custom width style', () => {
      const columnsWithWidth: VirtualTableColumn<TestData>[] = [
        { key: 'id', header: 'ID', width: 100 },
        { key: 'name', header: 'Name' },
      ];

      render(<VirtualTable data={mockData} columns={columnsWithWidth} />);

      const idHeader = screen.getByText('ID');
      expect(idHeader).toHaveStyle({ width: '100px' });
    });

    it('should handle column with center alignment', () => {
      const columnsWithAlign: VirtualTableColumn<TestData>[] = [
        { key: 'id', header: 'ID', align: 'center' },
      ];

      render(<VirtualTable data={mockData} columns={columnsWithAlign} />);

      const header = screen.getByText('ID');
      expect(header).toHaveClass('text-center');
    });

    it('should handle column with right alignment', () => {
      const columnsWithAlign: VirtualTableColumn<TestData>[] = [
        { key: 'id', header: 'ID', align: 'right' },
      ];

      render(<VirtualTable data={mockData} columns={columnsWithAlign} />);

      const header = screen.getByText('ID');
      expect(header).toHaveClass('text-right');
    });

    it('should handle single column', () => {
      const singleColumn: VirtualTableColumn<TestData>[] = [
        { key: 'name', header: 'Name' },
      ];

      render(<VirtualTable data={mockData} columns={singleColumn} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.queryByText('ID')).not.toBeInTheDocument();
    });

    it('should handle many columns', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('should use default empty message', () => {
      render(<VirtualTable data={[]} columns={mockColumns} />);

      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });

    it('should have sticky header by default', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      const headerRow = screen.getByText('ID').parentElement;
      expect(headerRow).toHaveClass('sticky');
    });
  });

  describe('Header Cell Styling', () => {
    it('should have px-4 padding on header cells', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      const headerCell = screen.getByText('ID');
      expect(headerCell).toHaveClass('px-4');
    });

    it('should have py-3 padding on header cells', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      const headerCell = screen.getByText('ID');
      expect(headerCell).toHaveClass('py-3');
    });

    it('should have flex-shrink-0 on header cells', () => {
      render(<VirtualTable data={mockData} columns={mockColumns} />);

      const headerCell = screen.getByText('ID');
      expect(headerCell).toHaveClass('flex-shrink-0');
    });
  });

  describe('Body Container', () => {
    it('should have overflow-auto on body container', () => {
      const { container } = render(
        <VirtualTable data={mockData} columns={mockColumns} />
      );

      const bodyContainer = container.querySelector('.overflow-auto');
      expect(bodyContainer).toBeInTheDocument();
    });
  });
});

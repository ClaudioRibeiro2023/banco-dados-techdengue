import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';

describe('Table Component', () => {
  describe('Table', () => {
    it('should render table component', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole('table');

      expect(table).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole('table');

      expect(table).toHaveAttribute('data-slot', 'table');
    });

    it('should have default styling classes', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole('table');

      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
    });

    it('should accept custom className', () => {
      render(
        <Table className="custom-table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole('table');

      expect(table).toHaveClass('custom-table');
    });

    it('should be wrapped in container with data-slot', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const container = document.querySelector('[data-slot="table-container"]');

      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('relative', 'w-full', 'overflow-x-auto');
    });
  });

  describe('TableHeader', () => {
    it('should render table header', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      // There are multiple rowgroups (thead, tbody), use getAllByRole
      const rowgroups = screen.getAllByRole('rowgroup');

      expect(rowgroups.length).toBeGreaterThan(0);
    });

    it('should have data-slot attribute', () => {
      render(
        <Table>
          <TableHeader data-testid="table-header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const header = screen.getByTestId('table-header');

      expect(header).toHaveAttribute('data-slot', 'table-header');
    });

    it('should accept custom className', () => {
      render(
        <Table>
          <TableHeader className="custom-header" data-testid="table-header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const header = screen.getByTestId('table-header');

      expect(header).toHaveClass('custom-header');
    });
  });

  describe('TableBody', () => {
    it('should render table body', () => {
      render(
        <Table>
          <TableBody data-testid="table-body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const body = screen.getByTestId('table-body');

      expect(body).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Table>
          <TableBody data-testid="table-body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const body = screen.getByTestId('table-body');

      expect(body).toHaveAttribute('data-slot', 'table-body');
    });

    it('should accept custom className', () => {
      render(
        <Table>
          <TableBody className="custom-body" data-testid="table-body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const body = screen.getByTestId('table-body');

      expect(body).toHaveClass('custom-body');
    });
  });

  describe('TableFooter', () => {
    it('should render table footer', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter data-testid="table-footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      const footer = screen.getByTestId('table-footer');

      expect(footer).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Table>
          <TableFooter data-testid="table-footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      const footer = screen.getByTestId('table-footer');

      expect(footer).toHaveAttribute('data-slot', 'table-footer');
    });

    it('should have styling classes', () => {
      render(
        <Table>
          <TableFooter data-testid="table-footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      const footer = screen.getByTestId('table-footer');

      expect(footer).toHaveClass('border-t', 'font-medium');
    });

    it('should accept custom className', () => {
      render(
        <Table>
          <TableFooter className="custom-footer" data-testid="table-footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      const footer = screen.getByTestId('table-footer');

      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('TableRow', () => {
    it('should render table row', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = screen.getByRole('row');

      expect(row).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = screen.getByRole('row');

      expect(row).toHaveAttribute('data-slot', 'table-row');
    });

    it('should have styling classes', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = screen.getByRole('row');

      expect(row).toHaveClass('border-b', 'transition-colors');
    });

    it('should accept custom className', () => {
      render(
        <Table>
          <TableBody>
            <TableRow className="custom-row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = screen.getByRole('row');

      expect(row).toHaveClass('custom-row');
    });

    it('should support data-state=selected', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-state="selected">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = screen.getByRole('row');

      expect(row).toHaveAttribute('data-state', 'selected');
    });
  });

  describe('TableHead', () => {
    it('should render table head', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const head = screen.getByRole('columnheader');

      expect(head).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const head = screen.getByRole('columnheader');

      expect(head).toHaveAttribute('data-slot', 'table-head');
    });

    it('should have styling classes', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const head = screen.getByRole('columnheader');

      expect(head).toHaveClass('h-10', 'px-2', 'text-left', 'align-middle', 'font-medium');
    });

    it('should accept custom className', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="custom-head">Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const head = screen.getByRole('columnheader');

      expect(head).toHaveClass('custom-head');
    });

    it('should render content correctly', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column Name</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      expect(screen.getByText('Column Name')).toBeInTheDocument();
    });
  });

  describe('TableCell', () => {
    it('should render table cell', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByRole('cell');

      expect(cell).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByRole('cell');

      expect(cell).toHaveAttribute('data-slot', 'table-cell');
    });

    it('should have styling classes', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByRole('cell');

      expect(cell).toHaveClass('p-2', 'align-middle', 'whitespace-nowrap');
    });

    it('should accept custom className', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="custom-cell">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByRole('cell');

      expect(cell).toHaveClass('custom-cell');
    });

    it('should render content correctly', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText('Cell Content')).toBeInTheDocument();
    });
  });

  describe('TableCaption', () => {
    it('should render table caption', () => {
      render(
        <Table>
          <TableCaption>Table Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const caption = screen.getByText('Table Caption');

      expect(caption).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Table>
          <TableCaption data-testid="table-caption">Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const caption = screen.getByTestId('table-caption');

      expect(caption).toHaveAttribute('data-slot', 'table-caption');
    });

    it('should have styling classes', () => {
      render(
        <Table>
          <TableCaption data-testid="table-caption">Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const caption = screen.getByTestId('table-caption');

      expect(caption).toHaveClass('mt-4', 'text-sm');
    });

    it('should accept custom className', () => {
      render(
        <Table>
          <TableCaption className="custom-caption" data-testid="table-caption">
            Caption
          </TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const caption = screen.getByTestId('table-caption');

      expect(caption).toHaveClass('custom-caption');
    });
  });

  describe('Complete Table Structure', () => {
    it('should render complete table with all components', () => {
      render(
        <Table>
          <TableCaption>User List</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total: 2 users</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(screen.getByText('User List')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Total: 2 users')).toBeInTheDocument();
    });

    it('should render multiple rows', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Row 1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Row 2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Row 3</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const rows = screen.getAllByRole('row');

      expect(rows).toHaveLength(3);
    });

    it('should render multiple columns', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Col 1</TableHead>
              <TableHead>Col 2</TableHead>
              <TableHead>Col 3</TableHead>
              <TableHead>Col 4</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const headers = screen.getAllByRole('columnheader');

      expect(headers).toHaveLength(4);
    });
  });

  describe('Props Forwarding', () => {
    it('should forward id to table', () => {
      render(
        <Table id="data-table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole('table');

      expect(table).toHaveAttribute('id', 'data-table');
    });

    it('should forward colSpan to cell', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3}>Merged Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByRole('cell');

      expect(cell).toHaveAttribute('colspan', '3');
    });

    it('should forward rowSpan to cell', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell rowSpan={2}>Merged Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByRole('cell');

      expect(cell).toHaveAttribute('rowspan', '2');
    });

    it('should forward scope to head', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const head = screen.getByRole('columnheader');

      expect(head).toHaveAttribute('scope', 'col');
    });
  });

  describe('Accessibility', () => {
    it('should have table role', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should have row role', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByRole('row')).toBeInTheDocument();
    });

    it('should have cell role', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByRole('cell')).toBeInTheDocument();
    });

    it('should have columnheader role for TableHead', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      expect(screen.getByRole('columnheader')).toBeInTheDocument();
    });

    it('should support aria-label on table', () => {
      render(
        <Table aria-label="User data table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole('table', { name: 'User data table' });

      expect(table).toBeInTheDocument();
    });
  });
});

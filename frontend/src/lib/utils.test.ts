import { describe, it, expect } from 'vitest'
import { cn, formatNumber, formatPercent, formatDate } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('should merge Tailwind classes correctly', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with locale', () => {
      expect(formatNumber(1000)).toBe('1.000')
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('should handle large numbers', () => {
      expect(formatNumber(1234567)).toBe('1.234.567')
    })
  })

  describe('formatPercent', () => {
    it('should format percentage', () => {
      expect(formatPercent(94.5)).toBe('94.5%')
    })

    it('should handle custom decimals', () => {
      expect(formatPercent(94.567, 2)).toBe('94.57%')
    })

    it('should handle zero', () => {
      expect(formatPercent(0)).toBe('0.0%')
    })
  })

  describe('formatDate', () => {
    it('should format date in short format', () => {
      const date = new Date('2025-10-31T14:30:00')
      const formatted = formatDate(date, 'short')
      expect(formatted).toContain('31')
      expect(formatted).toContain('10')
      expect(formatted).toContain('2025')
    })

    it('should format date in long format', () => {
      const date = new Date('2025-10-31T14:30:00')
      const formatted = formatDate(date, 'long')
      expect(formatted).toContain('outubro')
      expect(formatted).toContain('2025')
    })

    it('should handle string dates', () => {
      const formatted = formatDate('2025-10-31T14:30:00', 'short')
      expect(formatted).toBeTruthy()
    })
  })
})

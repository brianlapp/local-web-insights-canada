import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuditScore } from './AuditScore'

describe('AuditScore Component', () => {
  // Test score rendering
  it('renders the score value correctly', () => {
    render(<AuditScore score={85} />)
    expect(screen.getByText('85')).toBeInTheDocument()
  })

  // High score threshold tests (>80%)
  describe('High Score (>80%)', () => {
    it('applies correct styles for high scores', () => {
      render(<AuditScore score={85} />)
      const scoreContainer = screen.getByTestId('score-container')
      
      expect(scoreContainer).toHaveClass('bg-green-50')
      expect(scoreContainer).toHaveClass('text-green-700')
      expect(screen.getByTestId('score-icon')).toHaveClass('text-green-500')
    })

    it('shows appropriate icon for high scores', () => {
      render(<AuditScore score={90} />)
      const icon = screen.getByTestId('score-icon')
      expect(icon).toHaveAttribute('data-icon', 'check-circle')
    })

    it('displays correct message for high scores', () => {
      render(<AuditScore score={95} />)
      expect(screen.getByText(/excellent/i)).toBeInTheDocument()
    })
  })

  // Medium score threshold tests (50-80%)
  describe('Medium Score (50-80%)', () => {
    it('applies correct styles for medium scores', () => {
      render(<AuditScore score={65} />)
      const scoreContainer = screen.getByTestId('score-container')
      
      expect(scoreContainer).toHaveClass('bg-yellow-50')
      expect(scoreContainer).toHaveClass('text-yellow-700')
      expect(screen.getByTestId('score-icon')).toHaveClass('text-yellow-500')
    })

    it('shows appropriate icon for medium scores', () => {
      render(<AuditScore score={75} />)
      const icon = screen.getByTestId('score-icon')
      expect(icon).toHaveAttribute('data-icon', 'alert-circle')
    })

    it('displays correct message for medium scores', () => {
      render(<AuditScore score={60} />)
      expect(screen.getByText(/needs improvement/i)).toBeInTheDocument()
    })
  })

  // Low score threshold tests (<50%)
  describe('Low Score (<50%)', () => {
    it('applies correct styles for low scores', () => {
      render(<AuditScore score={35} />)
      const scoreContainer = screen.getByTestId('score-container')
      
      expect(scoreContainer).toHaveClass('bg-red-50')
      expect(scoreContainer).toHaveClass('text-red-700')
      expect(screen.getByTestId('score-icon')).toHaveClass('text-red-500')
    })

    it('shows appropriate icon for low scores', () => {
      render(<AuditScore score={25} />)
      const icon = screen.getByTestId('score-icon')
      expect(icon).toHaveAttribute('data-icon', 'x-circle')
    })

    it('displays correct message for low scores', () => {
      render(<AuditScore score={45} />)
      expect(screen.getByText(/critical/i)).toBeInTheDocument()
    })
  })

  // Boundary tests
  describe('Threshold Boundaries', () => {
    it('correctly handles 80% boundary', () => {
      render(<AuditScore score={80} />)
      expect(screen.getByTestId('score-container')).toHaveClass('bg-yellow-50')
      
      render(<AuditScore score={81} />)
      expect(screen.getByTestId('score-container')).toHaveClass('bg-green-50')
    })

    it('correctly handles 50% boundary', () => {
      render(<AuditScore score={50} />)
      expect(screen.getByTestId('score-container')).toHaveClass('bg-yellow-50')
      
      render(<AuditScore score={49} />)
      expect(screen.getByTestId('score-container')).toHaveClass('bg-red-50')
    })
  })

  // Edge cases
  describe('Edge Cases', () => {
    it('handles scores above 100', () => {
      render(<AuditScore score={110} />)
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('handles negative scores', () => {
      render(<AuditScore score={-10} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles decimal scores', () => {
      render(<AuditScore score={75.6} />)
      expect(screen.getByText('76')).toBeInTheDocument() // Should round to nearest integer
    })
  })

  // Accessibility tests
  describe('Accessibility', () => {
    it('provides appropriate aria-label', () => {
      render(<AuditScore score={85} />)
      const container = screen.getByTestId('score-container')
      expect(container).toHaveAttribute('aria-label', 'Audit score: 85 - Excellent')
    })

    it('uses semantic HTML for score representation', () => {
      render(<AuditScore score={85} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })
}) 
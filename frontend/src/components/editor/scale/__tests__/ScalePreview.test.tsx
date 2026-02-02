import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScalePreview from '../ScalePreview';
import { ScaleConfig } from '../../../../types/question';

describe('ScalePreview', () => {
  const mockScale: ScaleConfig = {
    type: 'preset',
    presetName: '5点Likert量表',
    points: [
      { value: 1, label: '非常不同意' },
      { value: 2, label: '不同意' },
      { value: 3, label: '中立' },
      { value: 4, label: '同意' },
      { value: 5, label: '非常同意' },
    ],
    showValue: true,
    showLabel: true,
  };

  it('should render scale points', () => {
    render(<ScalePreview scale={mockScale} />);

    expect(screen.getByText('非常不同意')).toBeInTheDocument();
    expect(screen.getByText('不同意')).toBeInTheDocument();
    expect(screen.getByText('中立')).toBeInTheDocument();
    expect(screen.getByText('同意')).toBeInTheDocument();
    expect(screen.getByText('非常同意')).toBeInTheDocument();
  });

  it('should show values when showValue is true', () => {
    render(<ScalePreview scale={mockScale} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should not show values when showValue is false', () => {
    const scaleNoValue = { ...mockScale, showValue: false };
    render(<ScalePreview scale={scaleNoValue} />);

    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('should not show labels when showLabel is false', () => {
    const scaleNoLabel = { ...mockScale, showLabel: false };
    render(<ScalePreview scale={scaleNoLabel} />);

    expect(screen.queryByText('非常不同意')).not.toBeInTheDocument();
  });
});

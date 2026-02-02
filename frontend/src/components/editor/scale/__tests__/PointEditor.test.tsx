import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PointEditor from '../PointEditor';
import { ScalePoint } from '../../../../types/question';

describe('PointEditor', () => {
  const mockPoints: ScalePoint[] = [
    { value: 1, label: '非常不同意' },
    { value: 2, label: '不同意' },
    { value: 3, label: '中立' },
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render all points', () => {
    render(<PointEditor points={mockPoints} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('非常不同意')).toBeInTheDocument();
    expect(screen.getByDisplayValue('不同意')).toBeInTheDocument();
    expect(screen.getByDisplayValue('中立')).toBeInTheDocument();
  });

  it('should call onChange when point label is edited', () => {
    render(<PointEditor points={mockPoints} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('不同意');
    fireEvent.change(input, { target: { value: '有点不同意' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      { value: 1, label: '非常不同意' },
      { value: 2, label: '有点不同意' },
      { value: 3, label: '中立' },
    ]);
  });

  it('should call onChange when point value is edited', () => {
    render(<PointEditor points={mockPoints} onChange={mockOnChange} />);

    const valueInput = screen.getAllByRole('spinbutton')[1];
    fireEvent.change(valueInput, { target: { value: '5' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      { value: 1, label: '非常不同意' },
      { value: 5, label: '不同意' },
      { value: 3, label: '中立' },
    ]);
  });

  it('should call onDelete when delete button is clicked', () => {
    const mockOnDelete = vi.fn();
    render(
      <PointEditor
        points={mockPoints}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('×');
    fireEvent.click(deleteButtons[1]);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('should not show delete buttons when only 2 points remain', () => {
    render(
      <PointEditor
        points={[mockPoints[0], mockPoints[1]]}
        onChange={mockOnChange}
      />
    );

    const deleteButtons = screen.queryAllByText('×');
    expect(deleteButtons).toHaveLength(0);
  });
});

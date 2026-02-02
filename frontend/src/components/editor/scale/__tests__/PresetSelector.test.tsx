import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PresetSelector from '../PresetSelector';

describe('PresetSelector', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('should render dropdown with all presets', () => {
    render(<PresetSelector onSelect={mockOnSelect} />);

    expect(screen.getByText('预设模板')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should call onSelect when preset is selected', () => {
    render(<PresetSelector onSelect={mockOnSelect} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '5点Likert量表' } });

    expect(mockOnSelect).toHaveBeenCalledWith(
      '5点Likert量表',
      expect.objectContaining({
        presetName: '5点Likert量表',
        points: expect.arrayContaining([
          expect.objectContaining({ value: 1, label: '非常不同意' })
        ])
      })
    );
  });

  it('should have correct preset options', () => {
    render(<PresetSelector onSelect={mockOnSelect} />);

    const select = screen.getByRole('combobox');
    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(6); // 5 presets + 1 empty option
    expect(options[1]).toHaveTextContent('5点Likert量表');
    expect(options[2]).toHaveTextContent('7点Likert量表');
    expect(options[3]).toHaveTextContent('1-10评分');
    expect(options[4]).toHaveTextContent('满意度5级');
    expect(options[5]).toHaveTextContent('频率5级');
  });
});

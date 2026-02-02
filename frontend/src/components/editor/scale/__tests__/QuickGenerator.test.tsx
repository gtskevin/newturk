import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickGenerator from '../QuickGenerator';
import { ScalePoint } from '../../../../types/question';

describe('QuickGenerator', () => {
  const mockOnGenerate = vi.fn();

  beforeEach(() => {
    mockOnGenerate.mockClear();
  });

  it('should render all input fields', () => {
    render(<QuickGenerator onGenerate={mockOnGenerate} />);

    expect(screen.getByPlaceholderText('起始值')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('结束值')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('起始标签')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('结束标签')).toBeInTheDocument();
    expect(screen.getByText('生成刻度')).toBeInTheDocument();
  });

  it('should call onGenerate with correct parameters', () => {
    render(<QuickGenerator onGenerate={mockOnGenerate} />);

    fireEvent.change(screen.getByPlaceholderText('起始值'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('结束值'), { target: { value: '5' } });
    fireEvent.change(screen.getByPlaceholderText('起始标签'), { target: { value: '非常不同意' } });
    fireEvent.change(screen.getByPlaceholderText('结束标签'), { target: { value: '非常同意' } });

    fireEvent.click(screen.getByText('生成刻度'));

    expect(mockOnGenerate).toHaveBeenCalledWith(1, 5, '非常不同意', '非常同意');
  });

  it('should validate inputs before generating', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<QuickGenerator onGenerate={mockOnGenerate} />);

    // Missing end value
    fireEvent.change(screen.getByPlaceholderText('起始值'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('生成刻度'));

    expect(mockOnGenerate).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('请填写完整的起止值和标签');

    alertSpy.mockRestore();
  });
});

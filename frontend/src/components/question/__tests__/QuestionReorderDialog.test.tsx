import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuestionReorderDialog from '../QuestionReorderDialog';

describe('QuestionReorderDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    questionId: 'Q_123',
    questionOrder: 2, // 0-indexed, displays as "第 3 题"
    totalQuestions: 10,
    selectedCount: 0,
    onMove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog when isOpen is true', () => {
      render(<QuestionReorderDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('移动问题')).toBeInTheDocument();
    });

    it('should not render dialog when isOpen is false', () => {
      render(<QuestionReorderDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show "批量移动问题" when selectedCount > 0', () => {
      render(<QuestionReorderDialog {...defaultProps} selectedCount={3} />);
      expect(screen.getByText('批量移动问题')).toBeInTheDocument();
      expect(screen.getByText('将 3 个问题 移动到：')).toBeInTheDocument();
    });

    it('should show question number when single question', () => {
      render(<QuestionReorderDialog {...defaultProps} />);
      expect(screen.getByText(/将 .*第 3 题.* 移动到/)).toBeInTheDocument();
    });

    it('should display position range hint', () => {
      render(<QuestionReorderDialog {...defaultProps} totalQuestions={10} />);
      expect(screen.getByText('(1-10)')).toBeInTheDocument();
    });
  });

  describe('Radio Mode Selection', () => {
    it('should start with "position" mode selected', () => {
      render(<QuestionReorderDialog {...defaultProps} />);
      const positionRadio = screen.getByLabelText(/移动到第.*题/);
      expect(positionRadio).toBeChecked();
    });

    it('should switch to "start" mode', () => {
      render(<QuestionReorderDialog {...defaultProps} />);
      const startRadio = screen.getByLabelText('移动到问卷开头');

      fireEvent.click(startRadio);
      expect(startRadio).toBeChecked();
    });

    it('should switch to "end" mode', () => {
      render(<QuestionReorderDialog {...defaultProps} />);
      const endRadio = screen.getByLabelText('移动到问卷末尾');

      fireEvent.click(endRadio);
      expect(endRadio).toBeChecked();
    });

    it('should disable input when non-position mode selected', () => {
      render(<QuestionReorderDialog {...defaultProps} />);
      const startRadio = screen.getByLabelText('移动到问卷开头');
      const input = screen.getByRole('spinbutton');

      fireEvent.click(startRadio);
      expect(input).toBeDisabled();
    });
  });

  describe('Input Validation', () => {
    it('should show error for empty input', () => {
      render(<QuestionReorderDialog {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '' } });
      expect(screen.getByText(/位置必须在/)).toBeInTheDocument();
    });

    it('should show error for out of range input', () => {
      render(<QuestionReorderDialog {...defaultProps} totalQuestions={10} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '15' } });
      expect(screen.getByText('位置必须在 1-10 之间')).toBeInTheDocument();
    });

    it('should show error for non-numeric input', () => {
      render(<QuestionReorderDialog {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: 'abc' } });
      expect(screen.getByText(/位置必须在/)).toBeInTheDocument();
    });

    it('should disable confirm button when input is invalid', () => {
      render(<QuestionReorderDialog {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      const confirmBtn = screen.getByRole('button', { name: '确认移动' });

      fireEvent.change(input, { target: { value: '999' } });
      expect(confirmBtn).toBeDisabled();
    });

    it('should clear error when valid input entered', () => {
      render(<QuestionReorderDialog {...defaultProps} questionOrder={2} totalQuestions={10} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '5' } });
      expect(screen.queryByText(/位置必须在/)).not.toBeInTheDocument();
    });
  });

  describe('Move Actions', () => {
    it('should call onMove with correct targetOrder for position mode', () => {
      const onMove = vi.fn();
      render(<QuestionReorderDialog {...defaultProps} onMove={onMove} />);
      const confirmBtn = screen.getByRole('button', { name: '确认移动' });

      fireEvent.click(confirmBtn);

      expect(onMove).toHaveBeenCalledWith(2); // questionOrder (2, displays as 3)
    });

    it('should call onMove with 0 for start mode', () => {
      const onMove = vi.fn();
      render(<QuestionReorderDialog {...defaultProps} onMove={onMove} />);
      const startRadio = screen.getByLabelText('移动到问卷开头');
      const confirmBtn = screen.getByRole('button', { name: '确认移动' });

      fireEvent.click(startRadio);
      fireEvent.click(confirmBtn);

      expect(onMove).toHaveBeenCalledWith(0);
    });

    it('should call onMove with last index for end mode', () => {
      const onMove = vi.fn();
      render(<QuestionReorderDialog {...defaultProps} onMove={onMove} totalQuestions={10} />);
      const endRadio = screen.getByLabelText('移动到问卷末尾');
      const confirmBtn = screen.getByRole('button', { name: '确认移动' });

      fireEvent.click(endRadio);
      fireEvent.click(confirmBtn);

      expect(onMove).toHaveBeenCalledWith(9); // totalQuestions - 1
    });

    it('should call onClose when confirmed', () => {
      const onClose = vi.fn();
      render(<QuestionReorderDialog {...defaultProps} onClose={onClose} />);
      const confirmBtn = screen.getByRole('button', { name: '确认移动' });

      fireEvent.click(confirmBtn);

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when cancelled', () => {
      const onClose = vi.fn();
      render(<QuestionReorderDialog {...defaultProps} onClose={onClose} />);
      const cancelBtn = screen.getByRole('button', { name: '取消' });

      fireEvent.click(cancelBtn);

      expect(onClose).toHaveBeenCalled();
      expect(defaultProps.onMove).not.toHaveBeenCalled();
    });
  });

  describe('State Reset', () => {
    it('should reset state when dialog reopens', () => {
      const { rerender } = render(<QuestionReorderDialog {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      // Change state
      fireEvent.change(input, { target: { value: '5' } });
      fireEvent.click(screen.getByLabelText('移动到问卷开头'));

      // Close and reopen
      rerender(<QuestionReorderDialog {...defaultProps} isOpen={false} />);
      rerender(<QuestionReorderDialog {...defaultProps} isOpen={true} />);

      // Should be back to initial state
      const positionRadio = screen.getByLabelText(/移动到第.*题/);
      expect(positionRadio).toBeChecked();
    });
  });
});

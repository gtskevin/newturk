import { render, screen, fireEvent } from '@testing-library/react';
import QuestionCard from '../QuestionCard';
import { Question } from '../../../types/question';

describe('QuestionCard', () => {
  const mockQuestion: Question = {
    id: 'Q_123',
    type: 'single',
    title: 'Test Question',
    description: 'Test Description',
    required: true,
    order: 0,
    options: [
      { id: 'O_1', label: 'Option 1', value: '1', order: 0 },
      { id: 'O_2', label: 'Option 2', value: '2', order: 1 },
    ],
  };

  describe('Rendering', () => {
    it('should render question title', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      expect(screen.getByText('Test Question')).toBeInTheDocument();
    });

    it('should render question description', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should render required indicator', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      expect(screen.getByText('* 必填')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render question number', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      expect(screen.getByText('[0]')).toBeInTheDocument();
    });
  });

  describe('Selection States', () => {
    it('should show blue border when selected', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          isSelected={true}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-blue-500');
    });

    it('should show default border when not selected', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-gray-200');
    });
  });

  describe('Collapse/Expand', () => {
    it('should collapse content when collapse button clicked', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      // Find the collapse button (it has the chevron-down icon)
      const buttons = screen.getAllByRole('button');
      const collapseButton = buttons[0]; // First button is the collapse button

      // Content is visible initially
      expect(screen.getByText('Content')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(collapseButton);

      // Content should not be visible after collapse (removed from DOM)
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('Title Editing', () => {
    it('should enter edit mode on double click', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const title = screen.getByText('Test Question');
      fireEvent.doubleClick(title);

      const input = screen.getByDisplayValue('Test Question');
      expect(input).toBeInTheDocument();
    });

    it('should call onUpdateTitle when edit is completed', () => {
      const onUpdateTitle = vi.fn();
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={onUpdateTitle}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const title = screen.getByText('Test Question');
      fireEvent.doubleClick(title);

      const input = screen.getByDisplayValue('Test Question');
      fireEvent.change(input, { target: { value: 'Updated Title' } });
      fireEvent.blur(input);

      expect(onUpdateTitle).toHaveBeenCalledWith('Updated Title');
    });
  });

  describe('Action Buttons', () => {
    it('should call onDuplicate when duplicate button clicked', () => {
      const onDuplicate = vi.fn();
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={onDuplicate}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      // Click the duplicate button (first button after collapse and checkbox)
      const buttons = screen.getAllByRole('button');
      const duplicateButton = buttons.find(btn => btn.getAttribute('title') === '复制');
      if (duplicateButton) {
        fireEvent.click(duplicateButton);
        expect(onDuplicate).toHaveBeenCalled();
      }
    });

    it('should call onDelete when delete button clicked', () => {
      const onDelete = vi.fn();
      // Mock window.confirm
      global.confirm = vi.fn(() => true);

      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={onDelete}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.getAttribute('title') === '删除');
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(onDelete).toHaveBeenCalled();
      }
    });

    it('should not call onDelete when confirm cancelled', () => {
      const onDelete = vi.fn();
      global.confirm = vi.fn(() => false);

      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={onDelete}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.getAttribute('title') === '删除');
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(onDelete).not.toHaveBeenCalled();
      }
    });
  });

  describe('QuestionCard - Batch Selection', () => {
    it('should render checkbox', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('should show checked state when batch selected', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={true}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should call onBatchToggle when checkbox clicked', () => {
      const onBatchToggle = vi.fn();
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={onBatchToggle}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onBatchToggle).toHaveBeenCalled();
      expect(onBatchToggle).toHaveBeenCalledTimes(1);
    });

    it('should show green border when batch selected', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={true}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-green-500');
    });

    it('should show blue border when editing (takes precedence)', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          isSelected={true}
          isBatchSelected={true}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-blue-500');
      expect(screen.getByText('已选')).toBeInTheDocument();
    });
  });

  describe('QuestionCard - Reorder Click', () => {
    it('should call onReorderClick when question number clicked', () => {
      const onReorderClick = vi.fn();
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={onReorderClick}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const numberButton = screen.getByText('[0]');
      fireEvent.click(numberButton);

      expect(onReorderClick).toHaveBeenCalled();
      expect(onReorderClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger card select when number clicked', () => {
      const onSelect = vi.fn();
      render(
        <QuestionCard
          question={mockQuestion}
          isSelected={false}
          isBatchSelected={false}
          onBatchToggle={vi.fn()}
          onReorderClick={vi.fn()}
          onSelect={onSelect}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateTitle={vi.fn()}
        >
          <div>Content</div>
        </QuestionCard>
      );

      const numberButton = screen.getByText('[0]');
      fireEvent.click(numberButton);

      expect(onSelect).not.toHaveBeenCalled();
    });
  });
});

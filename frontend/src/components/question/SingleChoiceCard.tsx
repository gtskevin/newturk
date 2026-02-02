import { Circle } from 'lucide-react';
import { useState } from 'react';
import { SingleChoiceQuestion } from '../../types/question';
import QuestionCard from './QuestionCard';
import { BatchInputDialog } from '../editor/BatchInputDialog';
import { PreviewDialog } from '../editor/PreviewDialog';
import { parseBatchInput } from '../../lib/batchParser';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';

interface SingleChoiceCardProps {
  question: SingleChoiceQuestion;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdateTitle: (title: string) => void;
  onAddOption: () => void;
  onUpdateOption: (optionId: string, label: string) => void;
  onDeleteOption: (optionId: string) => void;
}

export default function SingleChoiceCard({
  question,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  onUpdateTitle,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}: SingleChoiceCardProps) {
  const { batchAddOptions } = useSurveyEditor();
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewItems, setPreviewItems] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState<'append' | 'replace'>('replace');

  const handleBatchPreview = (text: string, mode: 'append' | 'replace') => {
    const items = parseBatchInput(text);
    if (items.length === 0) {
      alert('请输入至少一个选项');
      return;
    }
    setPreviewItems(items);
    setBatchMode(mode);
    setShowBatchDialog(false);
    setShowPreviewDialog(true);
  };

  const handleBatchConfirm = () => {
    batchAddOptions(question.id, previewItems.join('\n'), batchMode);
    setShowPreviewDialog(false);
    setPreviewItems([]);
  };

  const getLayoutClass = () => {
    switch (question.layout) {
      case 'horizontal':
        return 'flex-row gap-6';
      case 'two-column':
        return 'grid grid-cols-2 gap-4';
      default:
        return 'flex-col gap-3';
    }
  };

  return (
    <QuestionCard
      question={question}
      isSelected={isSelected}
      onSelect={onSelect}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onUpdateTitle={onUpdateTitle}
    >
      {/* Options */}
      <div className={`flex ${getLayoutClass()}`}>
        {question.options.map((option) => (
          <div
            key={option.id}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors group"
          >
            <Circle size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={option.label}
              onChange={(e) => onUpdateOption(option.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-2 py-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-all"
            />
            {question.options.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('确定要删除这个选项吗？')) {
                    onDeleteOption(option.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add option button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddOption();
        }}
        className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        + 添加选项
      </button>

      {/* Batch edit button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowBatchDialog(true);
        }}
        className="mt-2 ml-4 text-sm text-blue-500 hover:text-blue-700"
      >
        批量编辑
      </button>

      <BatchInputDialog
        isOpen={showBatchDialog}
        title="批量添加选项"
        placeholder="选项一&#10;选项二&#10;选项三"
        onClose={() => setShowBatchDialog(false)}
        onPreview={handleBatchPreview}
      />

      <PreviewDialog
        isOpen={showPreviewDialog}
        title="预览 - 将添加以下选项"
        items={previewItems}
        mode={batchMode}
        onClose={() => {
          setShowPreviewDialog(false);
          setShowBatchDialog(true);
        }}
        onConfirm={handleBatchConfirm}
      />
    </QuestionCard>
  );
}

import { Circle } from 'lucide-react';
import { useState } from 'react';
import { MatrixQuestion } from '../../types/question';
import QuestionCard from './QuestionCard';
import { BatchInputDialog } from '../editor/BatchInputDialog';
import { PreviewDialog } from '../editor/PreviewDialog';
import { ScaleEditDialog } from '../editor/ScaleEditDialog';
import { parseBatchInput } from '../../lib/batchParser';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';

interface MatrixCardProps {
  question: MatrixQuestion;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdateTitle: (title: string) => void;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, label: string) => void;
  onDeleteItem: (itemId: string) => void;
  onEditScale: () => void;
}

export default function MatrixCard({
  question,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  onUpdateTitle,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onEditScale,
}: MatrixCardProps) {
  const { batchAddMatrixItems } = useSurveyEditor();
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showScaleDialog, setShowScaleDialog] = useState(false);
  const [previewItems, setPreviewItems] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState<'append' | 'replace'>('replace');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleBatchPreview = (text: string, mode: 'append' | 'replace') => {
    const items = parseBatchInput(text);
    if (items.length === 0) {
      alert('请输入至少一个评价项');
      return;
    }
    setPreviewItems(items);
    setBatchMode(mode);
    setShowBatchDialog(false);
    setShowPreviewDialog(true);
  };

  const handleBatchConfirm = () => {
    setIsConfirming(true);
    batchAddMatrixItems(question.id, previewItems.join('\n'), batchMode);
    setShowPreviewDialog(false);
    setShowBatchDialog(false);
    setPreviewItems([]);
    setIsConfirming(false);

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const renderScaleHeader = () => {
    if (question.layout === 'vertical') {
      return null;
    }

    return (
      <div className="flex items-center gap-1 ml-48">
        {question.scale.points.map((point) => (
          <div
            key={point.value}
            className="flex-1 text-center text-xs text-gray-600 px-2"
          >
            {question.scale.showLabel && point.label && (
              <div className="mb-1">{point.label}</div>
            )}
            {question.scale.showValue && (
              <div className="font-medium">{point.value}</div>
            )}
          </div>
        ))}
      </div>
    );
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
      {/* Scale header */}
      <div className="mb-4">
        {renderScaleHeader()}
      </div>

      {/* Matrix items */}
      <div className="space-y-3">
        {question.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors group"
          >
            {/* Item label input */}
            <div className="w-44 flex-shrink-0">
              <input
                type="text"
                value={item.label}
                onChange={(e) => onUpdateItem(item.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Scale options */}
            <div className="flex-1 flex items-center gap-1">
              {question.scale.points.map((point) => (
                <div key={point.value} className="flex-1 flex justify-center">
                  <Circle size={18} className="text-gray-400" />
                </div>
              ))}
            </div>

            {/* Delete button */}
            {question.items.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('确定要删除这个评价项吗？')) {
                    onDeleteItem(item.id);
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

      {/* Action buttons */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddItem();
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + 添加评价项
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowBatchDialog(true);
          }}
          className="text-sm text-orange-500 hover:text-orange-700"
        >
          批量添加评价项
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowScaleDialog(true);
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          修改量表
        </button>
      </div>

      {/* Scale info */}
      <div className="mt-3 text-xs text-gray-500">
        量表: {question.scale.presetName || '自定义'} ({question.scale.points.length}点)
      </div>

      <BatchInputDialog
        isOpen={showBatchDialog}
        title="批量添加评价项"
        placeholder="产品的质量&#10;产品的外观设计&#10;产品的性价比"
        onClose={() => setShowBatchDialog(false)}
        onPreview={handleBatchPreview}
      />

      <PreviewDialog
        isOpen={showPreviewDialog}
        title="预览 - 将添加以下评价项"
        items={previewItems}
        mode={batchMode}
        onClose={() => {
          setShowPreviewDialog(false);
          setShowBatchDialog(true);
        }}
        onConfirm={handleBatchConfirm}
        isConfirming={isConfirming}
      />

      <ScaleEditDialog
        isOpen={showScaleDialog}
        questionId={question.id}
        initialScale={question.scale}
        onClose={() => setShowScaleDialog(false)}
      />

      {/* Success notification */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
          已添加 {previewItems.length} 个新评价项
        </div>
      )}
    </QuestionCard>
  );
}

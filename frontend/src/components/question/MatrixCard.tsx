import { Circle } from 'lucide-react';
import { MatrixQuestion } from '../../types/question';
import QuestionCard from './QuestionCard';

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
            // TODO: Open batch add dialog
            alert('批量添加功能即将推出');
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          批量添加
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditScale();
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
    </QuestionCard>
  );
}

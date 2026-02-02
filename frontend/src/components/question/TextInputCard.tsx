import { TextInputQuestion } from '../../types/question';
import QuestionCard from './QuestionCard';

interface TextInputCardProps {
  question: TextInputQuestion;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdateTitle: (title: string) => void;
}

export default function TextInputCard({
  question,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  onUpdateTitle,
}: TextInputCardProps) {
  const renderInput = () => {
    const placeholder = question.placeholder || '请输入...';
    const maxLength = question.maxLength;

    switch (question.inputType) {
      case 'textarea':
        return (
          <textarea
            placeholder={placeholder}
            maxLength={maxLength}
            rows={4}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed resize-none"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            placeholder={placeholder}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          />
        );
      default:
        return (
          <input
            type="text"
            placeholder={placeholder}
            maxLength={maxLength}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          />
        );
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
      {/* Input preview */}
      <div className="max-w-md">
        {renderInput()}
        {question.validation && (
          <div className="mt-2 text-xs text-gray-500">
            {question.validation.min !== undefined && `最小值: ${question.validation.min}`}
            {question.validation.min !== undefined && question.validation.max !== undefined && ' | '}
            {question.validation.max !== undefined && `最大值: ${question.validation.max}`}
            {question.validation.pattern && ' | 自定义验证规则'}
          </div>
        )}
      </div>

      {/* Config info */}
      <div className="mt-3 flex gap-4 text-xs text-gray-500">
        <span>
          类型: {
            question.inputType === 'textarea' ? '多行文本' :
            question.inputType === 'number' ? '数字' : '单行文本'
          }
        </span>
        {question.maxLength && <span>最大长度: {question.maxLength}</span>}
      </div>
    </QuestionCard>
  );
}

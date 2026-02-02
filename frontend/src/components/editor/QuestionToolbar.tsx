import { Circle, Square, Type, Grid3x3 } from 'lucide-react';
import { Question } from '../../types/question';

interface QuestionToolbarProps {
  onAddQuestion: (type: Question['type']) => void;
  disabled?: boolean;
}

export default function QuestionToolbar({ onAddQuestion, disabled = false }: QuestionToolbarProps) {
  const questionTypes = [
    {
      type: 'single' as const,
      label: '单选题',
      icon: Circle,
      description: '从多个选项中选择一个',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      type: 'multiple' as const,
      label: '多选题',
      icon: Square,
      description: '从多个选项中选择多个',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      type: 'text' as const,
      label: '文本题',
      icon: Type,
      description: '开放式文本输入',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      type: 'matrix' as const,
      label: '矩阵题',
      icon: Grid3x3,
      description: '多个项目使用相同量表评分',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
    },
  ];

  return (
    <div className="w-48 bg-white border-r border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">添加问题</h3>

      <div className="space-y-2">
        {questionTypes.map((questionType) => {
          const Icon = questionType.icon;

          return (
            <button
              key={questionType.type}
              onClick={() => onAddQuestion(questionType.type)}
              disabled={disabled}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg border-2 border-transparent
                transition-all duration-200
                ${disabled
                  ? 'opacity-50 cursor-not-allowed bg-gray-50'
                  : `${questionType.bgColor} cursor-pointer border-transparent hover:border-gray-300`
                }
              `}
              title={questionType.description}
            >
              <div className={`p-2 rounded-md ${questionType.color}`}>
                <Icon size={20} />
              </div>

              <div className="text-left flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {questionType.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {questionType.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Help text */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 leading-relaxed">
          点击上方按钮添加问题，或者双击问题卡片进行编辑。
        </p>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 text-xs text-gray-500">
        <div className="font-medium mb-2">快捷键提示：</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>新建问题</span>
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Ctrl+N</kbd>
          </div>
          <div className="flex justify-between">
            <span>保存</span>
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Ctrl+S</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

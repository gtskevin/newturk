import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Question, SingleChoiceQuestion, MultipleChoiceQuestion, TextInputQuestion, MatrixQuestion } from '../../types/question';
import { BatchInputDialog } from './BatchInputDialog';
import { PreviewDialog } from './PreviewDialog';
import { parseBatchInput } from '../../lib/batchParser';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';

interface ConfigurationPanelProps {
  question: Question | null;
  onUpdateQuestion: (updates: Partial<Question>) => void;
  onBatchAddOptions?: () => void;
  onEditScale?: () => void;
}

export default function ConfigurationPanel({
  question,
  onUpdateQuestion,
  onBatchAddOptions,
  onEditScale,
}: ConfigurationPanelProps) {
  const { batchAddOptions, batchAddMatrixItems } = useSurveyEditor();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewItems, setPreviewItems] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState<'append' | 'replace'>('replace');

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleBatchPreview = (text: string, mode: 'append' | 'replace') => {
    const items = parseBatchInput(text);
    const isChoiceQuestion = question?.type === 'single' || question?.type === 'multiple';

    if (items.length === 0) {
      alert(isChoiceQuestion ? '请输入至少一个选项' : '请输入至少一个评价项');
      return;
    }
    setPreviewItems(items);
    setBatchMode(mode);
    setShowBatchDialog(false);
    setShowPreviewDialog(true);
  };

  const handleBatchConfirm = () => {
    if (!question) return;

    if (question.type === 'single' || question.type === 'multiple') {
      batchAddOptions(question.id, previewItems.join('\n'), batchMode);
    } else if (question.type === 'matrix') {
      batchAddMatrixItems(question.id, previewItems.join('\n'), batchMode);
    }

    setShowPreviewDialog(false);
    setPreviewItems([]);
  };

  if (!question) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-500 py-12">
          <p className="text-sm">请选择一个问题</p>
          <p className="text-xs mt-2">点击问题卡片以查看和编辑配置</p>
        </div>
      </div>
    );
  }

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="border-b border-gray-200 pb-4 mb-4 last:border-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between py-2 text-left"
        >
          <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isExpanded && <div className="mt-3 space-y-3">{children}</div>}
      </div>
    );
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">问题配置</h3>

      {/* Basic Info Section */}
      <Section id="basic" title="基本信息">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">题目类型</label>
          <div className="text-sm text-gray-900 capitalize">
            {question.type === 'single' && '单选题'}
            {question.type === 'multiple' && '多选题'}
            {question.type === 'text' && '文本题'}
            {question.type === 'matrix' && '矩阵题'}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">问题ID</label>
          <input
            type="text"
            value={question.id}
            disabled
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">题干文字</label>
          <textarea
            value={question.title}
            onChange={(e) => onUpdateQuestion({ title: e.target.value })}
            rows={3}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">题目说明</label>
          <textarea
            value={question.description || ''}
            onChange={(e) => onUpdateQuestion({ description: e.target.value })}
            rows={2}
            placeholder="可选的补充说明"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="required"
            checked={question.required}
            onChange={(e) => onUpdateQuestion({ required: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="required" className="text-sm text-gray-700">必填</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hideNumber"
            checked={question.metadata?.hideNumber || false}
            onChange={(e) =>
              onUpdateQuestion({
                metadata: { ...question.metadata, hideNumber: e.target.checked },
              })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="hideNumber" className="text-sm text-gray-700">隐藏题号</label>
        </div>
      </Section>

      {/* Options Configuration (for choice questions) */}
      {(question.type === 'single' || question.type === 'multiple') && (
        <Section id="options" title="选项配置">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">布局方式</label>
            <select
              value={question.layout || 'vertical'}
              onChange={(e) =>
                onUpdateQuestion({ layout: e.target.value as 'vertical' | 'horizontal' | 'two-column' })
              }
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vertical">垂直排列</option>
              <option value="horizontal">水平排列</option>
              <option value="two-column">两列排列</option>
            </select>
          </div>

          {(question as SingleChoiceQuestion | MultipleChoiceQuestion).randomize !== undefined && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="randomize"
                checked={(question as SingleChoiceQuestion | MultipleChoiceQuestion).randomize || false}
                onChange={(e) => onUpdateQuestion({ randomize: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="randomize" className="text-sm text-gray-700">随机化选项顺序</label>
            </div>
          )}

          {onBatchAddOptions && (
            <button
              onClick={onBatchAddOptions}
              className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              批量添加选项
            </button>
          )}
        </Section>
      )}

      {/* Text Input Configuration */}
      {question.type === 'text' && (
        <Section id="textConfig" title="文本配置">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">输入类型</label>
            <select
              value={(question as TextInputQuestion).inputType || 'text'}
              onChange={(e) =>
                onUpdateQuestion({ inputType: e.target.value as 'text' | 'textarea' | 'number' })
              }
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">单行文本</option>
              <option value="textarea">多行文本</option>
              <option value="number">数字</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">最大长度</label>
            <input
              type="number"
              value={(question as TextInputQuestion).maxLength || ''}
              onChange={(e) =>
                onUpdateQuestion({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })
              }
              placeholder="无限制"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">占位符文本</label>
            <input
              type="text"
              value={(question as TextInputQuestion).placeholder || ''}
              onChange={(e) => onUpdateQuestion({ placeholder: e.target.value })}
              placeholder="请输入..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Section>
      )}

      {/* Matrix Configuration */}
      {question.type === 'matrix' && (
        <Section id="matrixConfig" title="矩阵配置">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">布局方式</label>
            <select
              value={(question as MatrixQuestion).layout || 'horizontal'}
              onChange={(e) =>
                onUpdateQuestion({ layout: e.target.value as 'horizontal' | 'vertical' })
              }
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="horizontal">水平</option>
              <option value="vertical">垂直</option>
            </select>
          </div>

          {onEditScale && (
            <button
              onClick={onEditScale}
              className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              修改量表
            </button>
          )}
        </Section>
      )}

      {/* Batch Operations */}
      <Section id="batch" title="批量操作">
        <div className="space-y-2">
          {(question.type === 'single' || question.type === 'multiple') && (
            <>
              <button
                onClick={() => setShowBatchDialog(true)}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                批量添加选项...
              </button>
              {onBatchAddOptions && (
                <button
                  onClick={onBatchAddOptions}
                  className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  复制其他问题的选项...
                </button>
              )}
            </>
          )}

          {question.type === 'matrix' && (
            <>
              <button
                onClick={() => setShowBatchDialog(true)}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                批量添加评价项...
              </button>
              {onEditScale && (
                <button
                  onClick={onEditScale}
                  className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  修改量表...
                </button>
              )}
            </>
          )}
        </div>
      </Section>

      {/* Advanced Settings */}
      <Section id="advanced" title="高级设置">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hidden"
            checked={question.metadata?.hidden || false}
            onChange={(e) =>
              onUpdateQuestion({
                metadata: { ...question.metadata, hidden: e.target.checked },
              })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="hidden" className="text-sm text-gray-700">隐藏此问题</label>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          隐藏的问题不会在问卷中显示，但可用于数据存储或逻辑判断。
        </div>
      </Section>

      {/* Batch Input and Preview Dialogs */}
      {question && (
        <>
          <BatchInputDialog
            isOpen={showBatchDialog}
            title={question.type === 'single' || question.type === 'multiple' ? '批量添加选项' : '批量添加评价项'}
            placeholder={
              question.type === 'single' || question.type === 'multiple'
                ? '选项一\n选项二\n选项三'
                : '产品的质量\n产品的外观设计\n产品的性价比'
            }
            onClose={() => setShowBatchDialog(false)}
            onPreview={handleBatchPreview}
          />

          <PreviewDialog
            isOpen={showPreviewDialog}
            title={`预览 - 将添加以下${question.type === 'single' || question.type === 'multiple' ? '选项' : '评价项'}`}
            items={previewItems}
            mode={batchMode}
            onClose={() => {
              setShowPreviewDialog(false);
              setShowBatchDialog(true);
            }}
            onConfirm={handleBatchConfirm}
          />
        </>
      )}
    </div>
  );
}

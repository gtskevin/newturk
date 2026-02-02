import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ScaleConfig, Question, MatrixQuestion } from '../../types/question';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';

interface ScaleApplyDialogProps {
  isOpen: boolean;
  sourceScale: ScaleConfig;
  sourceQuestionId: string;
  onClose: () => void;
  onApplied?: (count: number) => void;
}

interface MatrixQuestionWithCurrent extends MatrixQuestion {
  current?: string; // Display string for current scale
}

export default function ScaleApplyDialog({
  isOpen,
  sourceScale,
  sourceQuestionId,
  onClose,
  onApplied,
}: ScaleApplyDialogProps) {
  const { survey, applyScaleToQuestions } = useSurveyEditor();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get all matrix questions except source
  const matrixQuestions = survey.questions.filter(
    (q): q is MatrixQuestion => q.type === 'matrix' && q.id !== sourceQuestionId
  );

  // Pre-select questions with different scales
  React.useEffect(() => {
    const different = matrixQuestions
      .filter(q => JSON.stringify(q.scale) !== JSON.stringify(sourceScale))
      .map(q => q.id);
    setSelectedIds(different);
  }, [sourceScale, matrixQuestions]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    if (selectedIds.length === 0) {
      alert('请选择至少一个问题');
      return;
    }
    applyScaleToQuestions(selectedIds, sourceScale);
    onApplied?.(selectedIds.length);
    onClose();
  };

  const formatScaleInfo = (scale: ScaleConfig): string => {
    const name = scale.presetName || '自定义';
    return `${name} (${scale.points.length}点)`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">应用量表到其他矩阵题</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Current scale info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-medium text-blue-900">当前量表</p>
            <p className="text-sm text-blue-700">{formatScaleInfo(sourceScale)}</p>
          </div>

          <p className="text-sm font-medium text-gray-700 mb-3">选择要应用此量表的问题:</p>

          {/* Question list */}
          <div className="space-y-2">
            {matrixQuestions.map((q) => {
              const isSame = JSON.stringify(q.scale) === JSON.stringify(sourceScale);
              const isSelected = selectedIds.includes(q.id);

              return (
                <label
                  key={q.id}
                  className={`flex items-start p-3 border rounded cursor-pointer transition-colors ${
                    isSame
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(q.id)}
                    disabled={isSame}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {q.order + 1}. {q.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      当前: {formatScaleInfo(q.scale)}
                      {isSame && ' (相同)'}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              已选择 <span className="font-semibold">{selectedIds.length}</span> 个问题
              (共 {matrixQuestions.length} 个矩阵题)
            </p>
            {selectedIds.length > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                ℹ️ 将覆盖这些问题原有的量表配置
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            确认应用
          </button>
        </div>
      </div>
    </div>
  );
}

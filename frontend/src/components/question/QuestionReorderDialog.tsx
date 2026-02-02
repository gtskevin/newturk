import React, { useState, useEffect } from 'react';

interface QuestionReorderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  questionOrder: number;
  totalQuestions: number;
  selectedCount: number;
  onMove: (targetOrder: number) => void;
}

export default function QuestionReorderDialog({
  isOpen,
  onClose,
  questionId,
  questionOrder,
  totalQuestions,
  selectedCount,
  onMove,
}: QuestionReorderDialogProps) {
  const [mode, setMode] = useState<'position' | 'start' | 'end'>('position');
  const [targetPosition, setTargetPosition] = useState(questionOrder + 1);
  const [inputError, setInputError] = useState<string>('');

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setMode('position');
      setTargetPosition(questionOrder + 1);
      setInputError('');
    }
  }, [isOpen, questionOrder]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    let targetOrder: number;

    if (mode === 'start') {
      targetOrder = 0;
    } else if (mode === 'end') {
      targetOrder = totalQuestions - 1;
    } else {
      targetOrder = targetPosition - 1; // Convert to 0-indexed
    }

    onMove(targetOrder);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {selectedCount > 0 ? '批量移动问题' : '移动问题'}
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          将 {selectedCount > 0 ? `${selectedCount} 个问题` : '"第 ' + (questionOrder + 1) + ' 题"'} 移动到：
        </p>

        {/* Radio options */}
        <div className="space-y-3 mb-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="moveMode"
              checked={mode === 'position'}
              onChange={() => setMode('position')}
              className="mt-1"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">移动到第</span>
              <input
                type="number"
                min="1"
                max={totalQuestions}
                value={mode === 'position' ? targetPosition : questionOrder + 1}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val) || val < 1 || val > totalQuestions) {
                    setInputError(`位置必须在 1-${totalQuestions} 之间`);
                  } else {
                    setInputError('');
                    setTargetPosition(val);
                  }
                }}
                disabled={mode !== 'position'}
                className={`mx-2 w-20 px-2 py-1 border rounded ${
                  mode === 'position' ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                }`}
              />
              <span className="text-sm font-medium text-gray-900">题</span>
              <span className="text-xs text-gray-500 ml-2">
                (1-{totalQuestions})
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="moveMode"
              checked={mode === 'start'}
              onChange={() => setMode('start')}
              className="mt-1"
            />
            <span className="text-sm font-medium text-gray-900">移动到问卷开头</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="moveMode"
              checked={mode === 'end'}
              onChange={() => setMode('end')}
              className="mt-1"
            />
            <span className="text-sm font-medium text-gray-900">移动到问卷末尾</span>
          </label>
        </div>

        {/* Error or helper text */}
        {inputError && (
          <p className="text-sm text-red-600 mb-4">{inputError}</p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={mode === 'position' && (!!inputError || !targetPosition)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            确认移动
          </button>
        </div>
      </div>
    </div>
  );
}

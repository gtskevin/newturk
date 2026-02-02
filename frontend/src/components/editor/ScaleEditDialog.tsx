import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ScaleConfig, ScalePoint } from '../../types/question';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';
import PresetSelector from './scale/PresetSelector';
import QuickGenerator from './scale/QuickGenerator';
import PointEditor from './scale/PointEditor';
import ScalePreview from './scale/ScalePreview';
import { ScaleApplyDialog } from './index';
import { generateScale } from '../../lib/scaleInterpolator';

interface ScaleEditDialogProps {
  isOpen: boolean;
  questionId: string;
  initialScale: ScaleConfig;
  onClose: () => void;
  onApplyToAll?: () => void;
}

export default function ScaleEditDialog({
  isOpen,
  questionId,
  initialScale,
  onClose,
  onApplyToAll,
}: ScaleEditDialogProps) {
  const { updateScale } = useSurveyEditor();
  const [scale, setScale] = useState<ScaleConfig>(initialScale);
  const [originalScale, setOriginalScale] = useState<ScaleConfig>(initialScale);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScale(initialScale);
      setOriginalScale(initialScale);
    }
  }, [isOpen, initialScale]);

  // Live update as user edits
  useEffect(() => {
    if (isOpen) {
      updateScale(questionId, scale);
    }
  }, [scale, questionId, updateScale, isOpen]);

  const handlePresetSelect = (name: string, presetScale: ScaleConfig) => {
    setScale(presetScale);
  };

  const handleGenerate = (startValue: number, endValue: number, startLabel: string, endLabel: string) => {
    const points = generateScale(startValue, endValue, startLabel, endLabel);
    setScale({
      type: 'custom',
      points,
      showValue: true,
      showLabel: true,
    });
  };

  const handlePointsChange = (points: ScalePoint[]) => {
    setScale({ ...scale, points, type: 'custom' });
  };

  const handleDeletePoint = (index: number) => {
    const newPoints = scale.points.filter((_, i) => i !== index);
    setScale({ ...scale, points: newPoints, type: 'custom' });
  };

  const handleAddPoint = () => {
    const lastValue = typeof scale.points[scale.points.length - 1].value === 'number'
      ? (scale.points[scale.points.length - 1].value as number)
      : scale.points.length;
    const newPoint: ScalePoint = {
      value: lastValue + 1,
      label: '',
    };
    setScale({
      ...scale,
      points: [...scale.points, newPoint],
      type: 'custom',
    });
  };

  const handleToggleShowLabel = () => {
    setScale({ ...scale, showLabel: !scale.showLabel });
  };

  const handleToggleShowValue = () => {
    setScale({ ...scale, showValue: !scale.showValue });
  };

  const handleClose = () => {
    // Revert to original scale
    updateScale(questionId, originalScale);
    onClose();
  };

  const handleSave = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">编辑量表</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Controls */}
            <div className="space-y-6">
              <PresetSelector onSelect={handlePresetSelect} value={scale.presetName} />

              <QuickGenerator onGenerate={handleGenerate} />

              <PointEditor
                points={scale.points}
                onChange={handlePointsChange}
                onDelete={handleDeletePoint}
                onAdd={handleAddPoint}
              />

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">显示选项</h4>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={scale.showLabel}
                    onChange={handleToggleShowLabel}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  显示标签
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={scale.showValue}
                    onChange={handleToggleShowValue}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  显示分值
                </label>
              </div>
            </div>

            {/* Right: Preview */}
            <div>
              <ScalePreview scale={scale} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>

          {onApplyToAll && (
            <button
              onClick={() => setShowApplyDialog(true)}
              className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              应用到所有矩阵题
            </button>
          )}
        </div>

        {showApplyDialog && onApplyToAll && (
          <ScaleApplyDialog
            isOpen={showApplyDialog}
            sourceScale={scale}
            sourceQuestionId={questionId}
            onClose={() => setShowApplyDialog(false)}
          />
        )}
      </div>
    </div>
  );
}

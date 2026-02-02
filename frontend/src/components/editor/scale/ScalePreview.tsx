import { Circle } from 'lucide-react';
import { ScaleConfig } from '../../../types/question';

interface ScalePreviewProps {
  scale: ScaleConfig;
}

export default function ScalePreview({ scale }: ScalePreviewProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-3">实时预览</h4>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          {scale.points.map((point) => (
            <div key={point.value} className="flex-1 flex flex-col items-center gap-1">
              <Circle size={16} className="text-gray-400" />
              {scale.showLabel && point.label && (
                <span className="text-xs text-gray-600 text-center">{point.label}</span>
              )}
              {scale.showValue && (
                <span className="text-xs font-medium text-gray-700">{point.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={scale.showLabel}
            readOnly
            className="rounded border-gray-300"
          />
          显示标签
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={scale.showValue}
            readOnly
            className="rounded border-gray-300"
          />
          显示分值
        </label>
      </div>
    </div>
  );
}

import React from 'react';
import { ScalePoint } from '../../../types/question';

interface PointEditorProps {
  points: ScalePoint[];
  onChange: (points: ScalePoint[]) => void;
  onDelete?: (index: number) => void;
  onAdd?: () => void;
}

export default function PointEditor({
  points,
  onChange,
  onDelete,
  onAdd,
}: PointEditorProps) {
  const updatePoint = (index: number, field: 'value' | 'label', newValue: string | number) => {
    const newPoints = [...points];
    newPoints[index] = { ...newPoints[index], [field]: newValue };
    onChange(newPoints);
  };

  const deletePoint = (index: number) => {
    if (onDelete && points.length > 2) {
      onDelete(index);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        刻度点编辑
      </label>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                值
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                标签
              </th>
              {points.length > 2 && onDelete && (
                <th className="px-4 py-2 w-10"></th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {points.map((point, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={point.value}
                    onChange={(e) => updatePoint(index, 'value', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={point.label}
                    onChange={(e) => updatePoint(index, 'label', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                {points.length > 2 && onDelete && (
                  <td className="px-4 py-2">
                    <button
                      onClick={() => deletePoint(index)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + 添加刻度点
        </button>
      )}
    </div>
  );
}

import React, { useState } from 'react';

interface QuickGeneratorProps {
  onGenerate: (startValue: number, endValue: number, startLabel: string, endLabel: string) => void;
}

export default function QuickGenerator({ onGenerate }: QuickGeneratorProps) {
  const [startValue, setStartValue] = useState('1');
  const [endValue, setEndValue] = useState('5');
  const [startLabel, setStartLabel] = useState('');
  const [endLabel, setEndLabel] = useState('');

  const handleGenerate = () => {
    const start = parseInt(startValue);
    const end = parseInt(endValue);

    if (!startLabel.trim() || !endLabel.trim() || isNaN(start) || isNaN(end)) {
      alert('请填写完整的起止值和标签');
      return;
    }

    if (start >= end) {
      alert('起始值必须小于结束值');
      return;
    }

    onGenerate(start, end, startLabel, endLabel);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-3">快速生成器</h4>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            起止值
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={startValue}
              onChange={(e) => setStartValue(e.target.value)}
              placeholder="起始值"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">至</span>
            <input
              type="number"
              value={endValue}
              onChange={(e) => setEndValue(e.target.value)}
              placeholder="结束值"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            起止标签
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={startLabel}
              onChange={(e) => setStartLabel(e.target.value)}
              placeholder="起始标签"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">至</span>
            <input
              type="text"
              value={endLabel}
              onChange={(e) => setEndLabel(e.target.value)}
              placeholder="结束标签"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        生成刻度
      </button>
    </div>
  );
}

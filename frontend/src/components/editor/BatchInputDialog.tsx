// frontend/src/components/editor/BatchInputDialog.tsx
import React, { useState, useEffect } from 'react';
import { parseBatchInput } from '../../lib/batchParser';

interface BatchInputDialogProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  onClose: () => void;
  onPreview: (text: string, mode: 'append' | 'replace') => void;
}

export const BatchInputDialog: React.FC<BatchInputDialogProps> = ({
  isOpen,
  title,
  placeholder,
  onClose,
  onPreview,
}) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'append' | 'replace'>('replace');
  const [error, setError] = useState<string>('');

  // Add keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleCtrlEnter = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && text.trim()) {
        onPreview(text, mode);
      }
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleCtrlEnter);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleCtrlEnter);
    };
  }, [isOpen, text, mode, onClose, onPreview]);

  const handlePreview = () => {
    if (!text.trim()) {
      setError('请输入至少一个项目');
      return;
    }

    const items = parseBatchInput(text);
    if (items.length === 0) {
      setError('输入格式无效，请检查分隔符');
      return;
    }

    setError('');
    onPreview(text, mode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        <div className="px-6 py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            请粘贴列表（每行一项）：
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError('');
            }}
            placeholder={placeholder}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="replace"
                checked={mode === 'replace'}
                onChange={(e) => setMode(e.target.value as 'append' | 'replace')}
                className="mr-2"
              />
              <span className="text-sm">覆盖现有项目</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="append"
                checked={mode === 'append'}
                onChange={(e) => setMode(e.target.value as 'append' | 'replace')}
                className="mr-2"
              />
              <span className="text-sm">追加到现有项目后面</span>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handlePreview}
            disabled={!text.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            预览
          </button>
        </div>
      </div>
    </div>
  );
};

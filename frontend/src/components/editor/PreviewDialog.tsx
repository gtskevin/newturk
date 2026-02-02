// frontend/src/components/editor/PreviewDialog.tsx
import React from 'react';

interface PreviewDialogProps {
  isOpen: boolean;
  title: string;
  items: string[];
  mode: 'append' | 'replace';
  onClose: () => void;
  onConfirm: () => void;
  isConfirming?: boolean;
}

export const PreviewDialog: React.FC<PreviewDialogProps> = ({
  isOpen,
  title,
  items,
  mode,
  onClose,
  onConfirm,
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">
            将添加以下 {items.length} 个项目：
          </p>

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4">
            {items.map((item, index) => (
              <div key={index} className="py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500 mr-2">{index + 1}.</span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {mode === 'append' ? '☑ 追加模式（保留现有项目）' : '☑ 覆盖模式（将清除现有项目）'}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            返回修改
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            {isConfirming ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                添加中...
              </>
            ) : (
              '确认添加'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

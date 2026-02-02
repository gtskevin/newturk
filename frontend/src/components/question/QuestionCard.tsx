import React, { useState } from 'react';
import { Copy, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Question } from '../../types/question';

interface QuestionCardProps {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdateTitle: (title: string) => void;
  children: React.ReactNode;
}

export default function QuestionCard({
  question,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  onUpdateTitle,
  children,
}: QuestionCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(question.title);

  const handleTitleEdit = () => {
    if (isEditing) {
      onUpdateTitle(editedTitle);
    }
    setIsEditing(!isEditing);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleEdit();
    } else if (e.key === 'Escape') {
      setEditedTitle(question.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
        isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </button>

          <div className="flex items-center gap-2 flex-1">
            {!question.metadata?.hideNumber && (
              <span className="text-sm font-medium text-gray-500">
                [{question.order}]
              </span>
            )}

            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleEdit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                autoFocus
              />
            ) : (
              <h3
                className="text-lg font-semibold text-gray-900 flex-1"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                {question.title}
              </h3>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="复制"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('确定要删除这个问题吗？')) {
                onDelete();
              }
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="删除"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4" onClick={(e) => e.stopPropagation()}>
          {question.description && (
            <p className="text-sm text-gray-600 mb-4">{question.description}</p>
          )}
          {children}
        </div>
      )}

      {/* Required indicator */}
      {question.required && (
        <div className="px-4 pb-2">
          <span className="text-xs text-red-500 font-medium">* 必填</span>
        </div>
      )}
    </div>
  );
}

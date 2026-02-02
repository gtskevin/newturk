# Questionnaire Editor Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement core questionnaire editor with professional survey creation experience, supporting 4 question types with WYSIWYG editing and batch operations.

**Architecture:** React three-column layout (toolbar, question list, config panel) with centralized state management using React Context. Question cards display final appearance with inline editing. Backend extends existing experiment config JSON structure.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, React Router, Axios (frontend); FastAPI, SQLAlchemy 2.0 (backend)

---

## Task 1: Extend Backend Data Model for Question Types

**Files:**
- Modify: `backend/app/schemas/experiment.py:1-50`
- Test: `backend/tests/test_schemas.py`

**Step 1: Write failing test for new question structure**

Add to `backend/tests/test_schemas.py`:

```python
def test_single_choice_question_schema():
    """Test single choice question structure"""
    from app.schemas.experiment import QuestionType, SingleChoiceQuestion

    question = {
        "id": "Q_001",
        "type": "single",
        "title": "What is your age?",
        "description": "Please select one",
        "required": True,
        "order": 0,
        "options": [
            {"id": "OPT_1", "label": "18-25", "value": "18-25", "order": 0},
            {"id": "OPT_2", "label": "26-35", "value": "26-35", "order": 1},
        ],
        "layout": "vertical",
        "randomize": False
    }

    # Should validate without error
    validated = SingleChoiceQuestion(**question)
    assert validated.title == "What is your age?"
    assert len(validated.options) == 2

def test_matrix_question_schema():
    """Test matrix question with scale configuration"""
    from app.schemas.experiment import MatrixQuestion, ScaleConfig

    question = {
        "id": "Q_002",
        "type": "matrix",
        "title": "Rate these aspects",
        "required": True,
        "order": 1,
        "items": [
            {"id": "ITEM_1", "label": "Quality", "order": 0},
            {"id": "ITEM_2", "label": "Price", "order": 1},
        ],
        "scale": {
            "type": "preset",
            "presetName": "7点Likert量表",
            "points": [
                {"value": 1, "label": "非常不同意"},
                {"value": 2, "label": "不同意"},
                {"value": 3, "label": "有点不同意"},
                {"value": 4, "label": "中立"},
                {"value": 5, "label": "有点同意"},
                {"value": 6, "label": "同意"},
                {"value": 7, "label": "非常同意"},
            ],
            "showValue": True,
            "showLabel": True
        },
        "layout": "horizontal"
    }

    validated = MatrixQuestion(**question)
    assert len(validated.items) == 2
    assert len(validated.scale.points) == 7
```

**Step 2: Run test to verify it fails**

```bash
cd backend && ../.venv/bin/pytest tests/test_schemas.py::test_single_choice_question_schema -v
```

Expected: `ImportError: cannot import name 'SingleChoiceQuestion'`

**Step 3: Implement Pydantic schemas**

Add to `backend/app/schemas/experiment.py`:

```python
from typing import List, Literal, Union, Optional, Dict, Any
from pydantic import BaseModel, Field

# Choice Option
class ChoiceOption(BaseModel):
    id: str
    label: str
    value: str
    order: int

# Scale Point for Matrix Questions
class ScalePoint(BaseModel):
    value: Union[int, str]
    label: str

class ScaleConfig(BaseModel):
    type: Literal['preset', 'custom']
    presetName: Optional[str] = None
    points: List[ScalePoint]
    showValue: bool = True
    showLabel: bool = True

# Base Question
class BaseQuestion(BaseModel):
    id: str
    type: str
    title: str
    description: Optional[str] = None
    required: bool = True
    order: int
    metadata: Optional[Dict[str, Any]] = None

# Single Choice Question
class SingleChoiceQuestion(BaseQuestion):
    type: Literal['single'] = 'single'
    options: List[ChoiceOption] = []
    layout: Literal['vertical', 'horizontal', 'two-column'] = 'vertical'
    randomize: bool = False

# Multiple Choice Question
class MultipleChoiceQuestion(BaseQuestion):
    type: Literal['multiple'] = 'multiple'
    options: List[ChoiceOption] = []
    layout: Literal['vertical', 'horizontal', 'two-column'] = 'vertical'
    randomize: bool = False

# Text Input Question
class TextInputQuestion(BaseQuestion):
    type: Literal['text'] = 'text'
    inputType: Literal['text', 'textarea', 'number'] = 'text'
    maxLength: Optional[int] = None
    placeholder: Optional[str] = None
    validation: Optional[Dict[str, Any]] = None

# Matrix Item
class MatrixItem(BaseModel):
    id: str
    label: str
    order: int

# Matrix Question
class MatrixQuestion(BaseModel):
    id: str
    type: Literal['matrix'] = 'matrix'
    title: str
    description: Optional[str] = None
    required: bool = True
    order: int
    items: List[MatrixItem] = []
    scale: ScaleConfig
    layout: Literal['horizontal', 'vertical'] = 'horizontal'
    metadata: Optional[Dict[str, Any]] = None

# Union type for all questions
Question = Union[SingleChoiceQuestion, MultipleChoiceQuestion, TextInputQuestion, MatrixQuestion]

# Updated Experiment Config
class ExperimentConfig(BaseModel):
    questions: List[Dict[str, Any]] = []  # Flexible to support all types
    settings: Optional[Dict[str, Any]] = None
```

**Step 4: Run test to verify it passes**

```bash
cd backend && ../.venv/bin/pytest tests/test_schemas.py::test_single_choice_question_schema tests/test_schemas.py::test_matrix_question_schema -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/schemas/experiment.py backend/tests/test_schemas.py
git commit -m "feat: add Pydantic schemas for 4 question types

- Single choice, multiple choice, text input, matrix
- Scale configuration with preset support
- Union type for flexible question handling
```

---

## Task 2: Create Frontend Type Definitions

**Files:**
- Create: `frontend/src/types/question.ts`
- Test: TypeScript compiler (build will verify types)

**Step 1: Create type definitions file**

Create `frontend/src/types/question.ts`:

```typescript
// Base question interface
export interface BaseQuestion {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  metadata?: {
    hidden?: boolean;
    hideNumber?: boolean;
    [key: string]: any;
  };
}

// Choice option
export interface ChoiceOption {
  id: string;
  label: string;
  value: string;
  order: number;
}

// Single choice question
export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single';
  options: ChoiceOption[];
  layout?: 'vertical' | 'horizontal' | 'two-column';
  randomize?: boolean;
}

// Multiple choice question
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple';
  options: ChoiceOption[];
  layout?: 'vertical' | 'horizontal' | 'two-column';
  randomize?: boolean;
}

// Text input question
export interface TextInputQuestion extends BaseQuestion {
  type: 'text';
  inputType?: 'text' | 'textarea' | 'number';
  maxLength?: number;
  placeholder?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

// Scale point
export interface ScalePoint {
  value: number | string;
  label: string;
}

// Scale configuration
export interface ScaleConfig {
  type: 'preset' | 'custom';
  presetName?: string;
  points: ScalePoint[];
  showValue?: boolean;
  showLabel?: boolean;
}

// Matrix item
export interface MatrixItem {
  id: string;
  label: string;
  order: number;
}

// Matrix question
export interface MatrixQuestion extends BaseQuestion {
  type: 'matrix';
  items: MatrixItem[];
  scale: ScaleConfig;
  layout?: 'horizontal' | 'vertical';
}

// Union type for all questions
export type Question = SingleChoiceQuestion | MultipleChoiceQuestion | TextInputQuestion | MatrixQuestion;

// Survey configuration
export interface Survey {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Type guards
export function isChoiceQuestion(q: Question): q is SingleChoiceQuestion | MultipleChoiceQuestion {
  return q.type === 'single' || q.type === 'multiple';
}

export function isMatrixQuestion(q: Question): q is MatrixQuestion {
  return q.type === 'matrix';
}

export function isTextQuestion(q: Question): q is TextInputQuestion {
  return q.type === 'text';
}
```

**Step 2: Verify TypeScript compilation**

```bash
cd frontend && npm run build
```

Expected: No type errors

**Step 3: Commit**

```bash
git add frontend/src/types/question.ts
git commit -m "feat: add TypeScript types for question editor

- Base question interface with metadata
- 4 question types: single, multiple, text, matrix
- Type guards for type narrowing
- Survey configuration interface
```

---

## Task 3: Create Survey Editor Context

**Files:**
- Create: `frontend/src/contexts/SurveyEditorContext.tsx`
- Test: Manual (will be tested by components)

**Step 1: Create context provider**

Create `frontend/src/contexts/SurveyEditorContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Question, Survey, ChoiceOption, MatrixItem, ScaleConfig } from '../types/question';

interface SurveyEditorContextType {
  survey: Survey;
  selectedQuestionId: string | null;

  // Question operations
  addQuestion: (type: Question['type'], afterOrder?: number) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  moveQuestion: (id: string, targetOrder: number) => void;
  duplicateQuestion: (id: string) => void;

  // Option operations
  addOption: (questionId: string, option: Omit<ChoiceOption, 'id' | 'order'>) => void;
  updateOption: (questionId: string, optionId: string, updates: Partial<ChoiceOption>) => void;
  deleteOption: (questionId: string, optionId: string) => void;
  batchAddOptions: (questionId: string, optionsText: string, mode: 'append' | 'replace') => void;

  // Matrix operations
  addMatrixItem: (questionId: string, item: Omit<MatrixItem, 'id' | 'order'>) => void;
  batchAddMatrixItems: (questionId: string, itemsText: string, mode: 'append' | 'replace') => void;
  updateScale: (questionId: string, scale: ScaleConfig) => void;

  // Batch operations
  selectedQuestionIds: string[];
  toggleQuestionSelection: (id: string) => void;
  clearSelection: () => void;
  moveSelectedQuestions: (targetOrder: number) => void;

  // Selection
  selectQuestion: (id: string | null) => void;
}

const SurveyEditorContext = createContext<SurveyEditorContextType | undefined>(undefined);

export const useSurveyEditor = () => {
  const context = useContext(SurveyEditorContext);
  if (!context) {
    throw new Error('useSurveyEditor must be used within SurveyEditorProvider');
  }
  return context;
};

interface SurveyEditorProviderProps {
  children: ReactNode;
  initialSurvey: Survey;
}

export const SurveyEditorProvider: React.FC<SurveyEditorProviderProps> = ({ children, initialSurvey }) => {
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Add question
  const addQuestion = useCallback((type: Question['type'], afterOrder?: number) => {
    const newId = `Q_${Date.now()}`;
    const insertOrder = afterOrder !== undefined ? afterOrder + 1 : survey.questions.length;

    let newQuestion: Question;

    if (type === 'single') {
      newQuestion = {
        id: newId,
        type: 'single',
        title: '新问题',
        required: false,
        order: insertOrder,
        options: [],
        layout: 'vertical',
      };
    } else if (type === 'multiple') {
      newQuestion = {
        id: newId,
        type: 'multiple',
        title: '新问题',
        required: false,
        order: insertOrder,
        options: [],
        layout: 'vertical',
      };
    } else if (type === 'text') {
      newQuestion = {
        id: newId,
        type: 'text',
        title: '新问题',
        required: false,
        order: insertOrder,
        inputType: 'text',
      };
    } else if (type === 'matrix') {
      newQuestion = {
        id: newId,
        type: 'matrix',
        title: '新问题',
        required: false,
        order: insertOrder,
        items: [],
        scale: {
          type: 'preset',
          presetName: '5点Likert量表',
          points: [
            { value: 1, label: '非常不同意' },
            { value: 2, label: '不同意' },
            { value: 3, label: '中立' },
            { value: 4, label: '同意' },
            { value: 5, label: '非常同意' },
          ],
          showValue: true,
          showLabel: true,
        },
        layout: 'horizontal',
      };
    } else {
      return;
    }

    setSurvey(prev => {
      const questions = [...prev.questions];
      questions.splice(insertOrder, 0, newQuestion);
      // Reorder all questions
      questions.forEach((q, i) => q.order = i);
      return { ...prev, questions };
    });

    setSelectedQuestionId(newId);
  }, [survey.questions]);

  // Update question
  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === id ? { ...q, ...updates } : q
      ),
    }));
  }, []);

  // Delete question
  const deleteQuestion = useCallback((id: string) => {
    setSurvey(prev => {
      const questions = prev.questions.filter(q => q.id !== id);
      questions.forEach((q, i) => q.order = i);
      return { ...prev, questions };
    });

    if (selectedQuestionId === id) {
      setSelectedQuestionId(null);
    }
    setSelectedQuestionIds(prev => prev.filter(i => i !== id));
  }, [selectedQuestionId]);

  // Move question
  const moveQuestion = useCallback((id: string, targetOrder: number) => {
    setSurvey(prev => {
      const questions = [...prev.questions];
      const questionIndex = questions.findIndex(q => q.id === id);
      if (questionIndex === -1) return prev;

      const [question] = questions.splice(questionIndex, 1);
      questions.splice(targetOrder, 0, question);

      questions.forEach((q, i) => q.order = i);
      return { ...prev, questions };
    });
  }, []);

  // Duplicate question
  const duplicateQuestion = useCallback((id: string) => {
    setSurvey(prev => {
      const questions = [...prev.questions];
      const questionIndex = questions.findIndex(q => q.id === id);
      if (questionIndex === -1) return prev;

      const original = questions[questionIndex];
      const newId = `${id}_copy_${Date.now()}`;
      const duplicate = {
        ...JSON.parse(JSON.stringify(original)),
        id: newId,
        title: `${original.title} (副本)`,
        order: original.order + 1,
      };

      questions.splice(questionIndex + 1, 0, duplicate);
      questions.forEach((q, i) => q.order = i);
      return { ...prev, questions };
    });

    setSelectedQuestionId(`${id}_copy_${Date.now()}`);
  }, []);

  // Add option
  const addOption = useCallback((questionId: string, option: Omit<ChoiceOption, 'id' | 'order'>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && (q.type === 'single' || q.type === 'multiple')) {
          const newOption: ChoiceOption = {
            ...option,
            id: `OPT_${Date.now()}`,
            order: q.options.length,
          };
          return { ...q, options: [...q.options, newOption] };
        }
        return q;
      }),
    }));
  }, []);

  // Update option
  const updateOption = useCallback((questionId: string, optionId: string, updates: Partial<ChoiceOption>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && (q.type === 'single' || q.type === 'multiple')) {
          return {
            ...q,
            options: q.options.map(opt =>
              opt.id === optionId ? { ...opt, ...updates } : opt
            ),
          };
        }
        return q;
      }),
    }));
  }, []);

  // Delete option
  const deleteOption = useCallback((questionId: string, optionId: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && (q.type === 'single' || q.type === 'multiple')) {
          const options = q.options.filter(opt => opt.id !== optionId);
          options.forEach((opt, i) => opt.order = i);
          return { ...q, options };
        }
        return q;
      }),
    }));
  }, []);

  // Batch add options
  const batchAddOptions = useCallback((questionId: string, optionsText: string, mode: 'append' | 'replace') => {
    const lines = optionsText.split('\n').filter(line => line.trim());
    const newOptions: ChoiceOption[] = lines.map((label, i) => ({
      id: `OPT_${Date.now()}_${i}`,
      label: label.trim(),
      value: label.trim(),
      order: i,
    }));

    setSurvey(prev => {
      const questions = prev.questions.map(q => {
        if (q.id === questionId && (q.type === 'single' || q.type === 'multiple')) {
          const existingOptions = mode === 'append' ? q.options : [];
          const allOptions = [...existingOptions, ...newOptions];
          allOptions.forEach((opt, i) => opt.order = i);
          return { ...q, options: allOptions };
        }
        return q;
      });
      return { ...prev, questions };
    });
  }, []);

  // Add matrix item
  const addMatrixItem = useCallback((questionId: string, item: Omit<MatrixItem, 'id' | 'order'>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === 'matrix') {
          const newItem: MatrixItem = {
            ...item,
            id: `ITEM_${Date.now()}`,
            order: q.items.length,
          };
          return { ...q, items: [...q.items, newItem] };
        }
        return q;
      }),
    }));
  }, []);

  // Batch add matrix items
  const batchAddMatrixItems = useCallback((questionId: string, itemsText: string, mode: 'append' | 'replace') => {
    const lines = itemsText.split('\n').filter(line => line.trim());
    const newItems: MatrixItem[] = lines.map((label, i) => ({
      id: `ITEM_${Date.now()}_${i}`,
      label: label.trim(),
      order: i,
    }));

    setSurvey(prev => {
      const questions = prev.questions.map(q => {
        if (q.id === questionId && q.type === 'matrix') {
          const existingItems = mode === 'append' ? q.items : [];
          const allItems = [...existingItems, ...newItems];
          allItems.forEach((item, i) => item.order = i);
          return { ...q, items: allItems };
        }
        return q;
      });
      return { ...prev, questions };
    });
  }, []);

  // Update scale
  const updateScale = useCallback((questionId: string, scale: ScaleConfig) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === 'matrix') {
          return { ...q, scale };
        }
        return q;
      }),
    }));
  }, []);

  // Toggle question selection
  const toggleQuestionSelection = useCallback((id: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedQuestionIds([]);
  }, []);

  // Move selected questions
  const moveSelectedQuestions = useCallback((targetOrder: number) => {
    if (selectedQuestionIds.length === 0) return;

    setSurvey(prev => {
      const questions = [...prev.questions];
      const selectedQuestions = questions.filter(q => selectedQuestionIds.includes(q.id));
      const remainingQuestions = questions.filter(q => !selectedQuestionIds.includes(q.id));

      // Insert selected block at target position
      remainingQuestions.splice(targetOrder, 0, ...selectedQuestions);

      // Reorder all
      remainingQuestions.forEach((q, i) => q.order = i);
      return { ...prev, questions: remainingQuestions };
    });

    clearSelection();
  }, [selectedQuestionIds, clearSelection]);

  // Select question
  const selectQuestion = useCallback((id: string | null) => {
    setSelectedQuestionId(id);
  }, []);

  const value: SurveyEditorContextType = {
    survey,
    selectedQuestionId,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    duplicateQuestion,
    addOption,
    updateOption,
    deleteOption,
    batchAddOptions,
    addMatrixItem,
    batchAddMatrixItems,
    updateScale,
    selectedQuestionIds,
    toggleQuestionSelection,
    clearSelection,
    moveSelectedQuestions,
    selectQuestion,
  };

  return (
    <SurveyEditorContext.Provider value={value}>
      {children}
    </SurveyEditorContext.Provider>
  );
};
```

**Step 2: Verify TypeScript compilation**

```bash
cd frontend && npm run build
```

Expected: No type errors

**Step 3: Commit**

```bash
git add frontend/src/contexts/SurveyEditorContext.tsx
git commit -m "feat: implement survey editor context provider

- Centralized state management for questionnaire editor
- CRUD operations for questions and options
- Batch operations support
- Question selection and movement
"
```

---

## Task 4: Create Question Card Component

**Files:**
- Create: `frontend/src/components/question/QuestionCard.tsx`
- Create: `frontend/src/components/question/SingleChoiceCard.tsx`
- Create: `frontend/src/components/question/MultipleChoiceCard.tsx`
- Create: `frontend/src/components/question/TextInputCard.tsx`
- Create: `frontend/src/components/question/MatrixCard.tsx`

**Step 1: Create base QuestionCard component**

Create `frontend/src/components/question/QuestionCard.tsx`:

```typescript
import React from 'react';
import { Question } from '../../types/question';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';
import SingleChoiceCard from './SingleChoiceCard';
import MultipleChoiceCard from './MultipleChoiceCard';
import TextInputCard from './TextInputCard';
import MatrixCard from './MatrixCard';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const { selectQuestion, selectedQuestionId, deleteQuestion, duplicateQuestion } = useSurveyEditor();
  const isSelected = selectedQuestionId === question.id;
  const [collapsed, setCollapsed] = React.useState(false);

  const handleClick = () => {
    selectQuestion(question.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除第${question.order + 1}题吗？此操作不可撤销。`)) {
      deleteQuestion(question.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateQuestion(question.id);
  };

  const cardClasses = `
    relative border-2 rounded-lg p-4 mb-4 cursor-pointer transition-all
    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
  `;

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            {collapsed ? '▶' : '▼'}
          </button>
          <span className="text-sm font-medium text-gray-500">
            [{question.order + 1}]
          </span>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={handleDuplicate}
            className="text-xs text-gray-500 hover:text-blue-600"
          >
            复制
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-gray-500 hover:text-red-600"
          >
            删除
          </button>
        </div>
      </div>

      {/* Question content */}
      {!collapsed && (
        <>
          <h3 className="text-lg font-medium mb-2">{question.title}</h3>
          {question.description && (
            <p className="text-sm text-gray-600 mb-3">{question.description}</p>
          )}

          {/* Question type specific content */}
          {question.type === 'single' && <SingleChoiceCard question={question} />}
          {question.type === 'multiple' && <MultipleChoiceCard question={question} />}
          {question.type === 'text' && <TextInputCard question={question} />}
          {question.type === 'matrix' && <MatrixCard question={question} />}
        </>
      )}
    </div>
  );
};

export default QuestionCard;
```

**Step 2: Create SingleChoiceCard component**

Create `frontend/src/components/question/SingleChoiceCard.tsx`:

```typescript
import React from 'react';
import { SingleChoiceQuestion } from '../../types/question';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';

interface SingleChoiceCardProps {
  question: SingleChoiceQuestion;
}

const SingleChoiceCard: React.FC<SingleChoiceCardProps> = ({ question }) => {
  const { addOption, updateOption } = useSurveyEditor();

  const handleAddOption = () => {
    addOption(question.id, {
      label: '新选项',
      value: 'new_option',
    });
  };

  const handleOptionLabelChange = (optionId: string, newLabel: string) => {
    updateOption(question.id, optionId, {
      label: newLabel,
      value: newLabel,
    });
  };

  return (
    <div className="space-y-2">
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <input type="radio" disabled className="w-4 h-4" />
          <input
            type="text"
            value={option.label}
            onChange={(e) => handleOptionLabelChange(option.id, e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
      ))}

      <button
        onClick={handleAddOption}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        + 添加选项
      </button>
    </div>
  );
};

export default SingleChoiceCard;
```

**Step 3: Create MultipleChoiceCard component**

Create `frontend/src/components/question/MultipleChoiceCard.tsx`:

```typescript
import React from 'react';
import { MultipleChoiceQuestion } from '../../types/question';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';

interface MultipleChoiceCardProps {
  question: MultipleChoiceQuestion;
}

const MultipleChoiceCard: React.FC<MultipleChoiceCardProps> = ({ question }) => {
  const { addOption, updateOption } = useSurveyEditor();

  const handleAddOption = () => {
    addOption(question.id, {
      label: '新选项',
      value: 'new_option',
    });
  };

  const handleOptionLabelChange = (optionId: string, newLabel: string) => {
    updateOption(question.id, optionId, {
      label: newLabel,
      value: newLabel,
    });
  };

  return (
    <div className="space-y-2">
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <input type="checkbox" disabled className="w-4 h-4" />
          <input
            type="text"
            value={option.label}
            onChange={(e) => handleOptionLabelChange(option.id, e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
      ))}

      <button
        onClick={handleAddOption}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        + 添加选项
      </button>
    </div>
  );
};

export default MultipleChoiceCard;
```

**Step 4: Create TextInputCard component**

Create `frontend/src/components/question/TextInputCard.tsx`:

```typescript
import React from 'react';
import { TextInputQuestion } from '../../types/question';

interface TextInputCardProps {
  question: TextInputQuestion;
}

const TextInputCard: React.FC<TextInputCardProps> = ({ question }) => {
  return (
    <div>
      {question.inputType === 'textarea' ? (
        <textarea
          disabled
          rows={4}
          placeholder={question.placeholder || '请输入...'}
          className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
        />
      ) : (
        <input
          type={question.inputType || 'text'}
          disabled
          placeholder={question.placeholder || '请输入...'}
          className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
        />
      )}

      {question.maxLength && (
        <p className="text-xs text-gray-500 mt-1">
          最多 {question.maxLength} 字
        </p>
      )}
    </div>
  );
};

export default TextInputCard;
```

**Step 5: Create MatrixCard component**

Create `frontend/src/components/question/MatrixCard.tsx`:

```typescript
import React from 'react';
import { MatrixQuestion } from '../../types/question';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';

interface MatrixCardProps {
  question: MatrixQuestion;
}

const MatrixCard: React.FC<MatrixCardProps> = ({ question }) => {
  const { addMatrixItem, updateScale } = useSurveyEditor();

  const handleAddItem = () => {
    addMatrixItem(question.id, {
      label: '新评价项',
    });
  };

  const handleItemLabelChange = (itemId: string, newLabel: string) => {
    // TODO: Implement updateMatrixItem
  };

  return (
    <div className="space-y-3">
      {/* Scale labels */}
      {question.scale.showLabel && (
        <div className="flex justify-between text-sm text-gray-600 px-20">
          {question.scale.points[0] && (
            <span>
              {question.scale.showValue && `${question.scale.points[0].value}=`}
              {question.scale.points[0].label}
            </span>
          )}
          {question.scale.points[question.scale.points.length - 1] && (
            <span>
              {question.scale.showValue && `${question.scale.points[question.scale.points.length - 1].value}=`}
              {question.scale.points[question.scale.points.length - 1].label}
            </span>
          )}
        </div>
      )}

      {/* Matrix items */}
      {question.items.map((item) => (
        <div key={item.id} className="flex items-center space-x-4">
          <span className="flex-1">{item.label}</span>
          <div className="flex space-x-2">
            {question.scale.points.map((point) => (
              <input
                key={`${item.id}-${point.value}`}
                type="radio"
                disabled
                className="w-4 h-4"
              />
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleAddItem}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        + 添加评价项
      </button>
    </div>
  );
};

export default MatrixCard;
```

**Step 6: Verify TypeScript compilation**

```bash
cd frontend && npm run build
```

Expected: No type errors

**Step 7: Commit**

```bash
git add frontend/src/components/question/
git commit -m "feat: implement question card components

- Base QuestionCard with selection and actions
- SingleChoiceCard with inline option editing
- MultipleChoiceCard with checkbox display
- TextInputCard with text/textarea support
- MatrixCard with scale and items display
"
```

---

## Task 5: Create Question Toolbar Component

**Files:**
- Create: `frontend/src/components/editor/QuestionToolbar.tsx`

**Step 1: Create toolbar component**

Create `frontend/src/components/editor/QuestionToolbar.tsx`:

```typescript
import React from 'react';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';
import {
  ListChecks,
  SquareCheck,
  Type,
  Grid3x3
} from 'lucide-react';

const QuestionToolbar: React.FC = () => {
  const { addQuestion } = useSurveyEditor();

  const buttonClass = `
    flex flex-col items-center justify-center
    p-4 rounded-lg border-2 border-gray-200
    hover:border-blue-500 hover:bg-blue-50
    transition-all cursor-pointer
    w-full
  `;

  return (
    <div className="w-64 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        问题类型
      </h3>

      <div className="space-y-3">
        <button
          onClick={() => addQuestion('single')}
          className={buttonClass}
        >
          <ListChecks className="w-8 h-8 text-blue-600 mb-2" />
          <span className="text-sm">单选题</span>
        </button>

        <button
          onClick={() => addQuestion('multiple')}
          className={buttonClass}
        >
          <SquareCheck className="w-8 h-8 text-green-600 mb-2" />
          <span className="text-sm">多选题</span>
        </button>

        <button
          onClick={() => addQuestion('text')}
          className={buttonClass}
        >
          <Type className="w-8 h-8 text-purple-600 mb-2" />
          <span className="text-sm">填空题</span>
        </button>

        <button
          onClick={() => addQuestion('matrix')}
          className={buttonClass}
        >
          <Grid3x3 className="w-8 h-8 text-orange-600 mb-2" />
          <span className="text-sm">矩阵量表</span>
        </button>
      </div>
    </div>
  );
};

export default QuestionToolbar;
```

**Step 2: Verify TypeScript compilation**

```bash
cd frontend && npm run build
```

Expected: No type errors

**Step 3: Commit**

```bash
git add frontend/src/components/editor/QuestionToolbar.tsx
git commit -m "feat: add question type toolbar

- 4 question type buttons with icons
- Click to insert new question
- Hover effects for feedback
"
```

---

## Task 6: Create Configuration Panel Component

**Files:**
- Create: `frontend/src/components/editor/ConfigurationPanel.tsx`

**Step 1: Create configuration panel**

Create `frontend/src/components/editor/ConfigurationPanel.tsx`:

```typescript
import React from 'react';
import { Question, isChoiceQuestion } from '../../types/question';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';

const ConfigurationPanel: React.FC = () => {
  const { survey, selectedQuestionId, updateQuestion } = useSurveyEditor();

  const selectedQuestion = survey.questions.find(q => q.id === selectedQuestionId);

  if (!selectedQuestion) {
    return (
      <div className="w-80 bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500 text-center">
          选择一个问题以查看配置
        </p>
      </div>
    );
  }

  const handleTitleChange = (newTitle: string) => {
    updateQuestion(selectedQuestion.id, { title: newTitle });
  };

  const handleDescriptionChange = (newDescription: string) => {
    updateQuestion(selectedQuestion.id, { description: newDescription });
  };

  const handleRequiredChange = (required: boolean) => {
    updateQuestion(selectedQuestion.id, { required });
  };

  return (
    <div className="w-80 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        问题配置
      </h3>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            题目类型
          </label>
          <input
            type="text"
            value={
              selectedQuestion.type === 'single' ? '单选题' :
              selectedQuestion.type === 'multiple' ? '多选题' :
              selectedQuestion.type === 'text' ? '填空题' :
              '矩阵量表题'
            }
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            问题ID
          </label>
          <input
            type="text"
            value={selectedQuestion.id}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            题干文字
          </label>
          <textarea
            value={selectedQuestion.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            题目说明（可选）
          </label>
          <textarea
            value={selectedQuestion.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            rows={2}
            placeholder="添加题目说明..."
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="required"
            checked={selectedQuestion.required}
            onChange={(e) => handleRequiredChange(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="required" className="text-sm font-medium text-gray-700">
            必答
          </label>
        </div>

        {/* Choice question specific */}
        {isChoiceQuestion(selectedQuestion) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              排列方式
            </label>
            <select
              value={selectedQuestion.layout || 'vertical'}
              onChange={(e) => updateQuestion(selectedQuestion.id, {
                layout: e.target.value as 'vertical' | 'horizontal' | 'two-column'
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="vertical">垂直排列</option>
              <option value="horizontal">水平排列</option>
              <option value="two-column">两列排列</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurationPanel;
```

**Step 2: Verify TypeScript compilation**

```bash
cd frontend && npm run build
```

Expected: No type errors

**Step 3: Commit**

```bash
git add frontend/src/components/editor/ConfigurationPanel.tsx
git commit -m "feat: add configuration panel component

- Display selected question details
- Inline editing for title and description
- Required toggle
- Layout selection for choice questions
"
```

---

## Task 7: Create Main Editor Page

**Files:**
- Create: `frontend/src/pages/QuestionnaireEditor.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/api/experiments.ts`

**Step 1: Create editor page**

Create `frontend/src/pages/QuestionnaireEditor.tsx`:

```typescript
import React from 'react';
import { useParams } from 'react-router-dom';
import { SurveyEditorProvider, useSurveyEditor } from '../contexts/SurveyEditorContext';
import QuestionToolbar from '../components/editor/QuestionToolbar';
import QuestionCard from '../components/question/QuestionCard';
import ConfigurationPanel from '../components/editor/ConfigurationPanel';
import { Survey } from '../types/question';

const QuestionnaireEditorContent: React.FC = () => {
  const { survey } = useSurveyEditor();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{survey.name}</h1>
            {survey.description && (
              <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              预览
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              保存
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-6">
          {/* Left: Question Toolbar */}
          <div className="flex-shrink-0">
            <QuestionToolbar />
          </div>

          {/* Center: Question List */}
          <div className="flex-1">
            {survey.questions.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  开始创建你的第一个问题
                </h3>
                <p className="text-gray-600">
                  点击左侧工具栏的问题类型
                </p>
              </div>
            ) : (
              <div>
                {survey.questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
            )}
          </div>

          {/* Right: Configuration Panel */}
          <div className="flex-shrink-0">
            <ConfigurationPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionnaireEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // TODO: Fetch survey data from API
  // For now, use mock data
  const mockSurvey: Survey = {
    id: id || '1',
    name: '我的问卷',
    description: '这是一个示例问卷',
    questions: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <SurveyEditorProvider initialSurvey={mockSurvey}>
      <QuestionnaireEditorContent />
    </SurveyEditorProvider>
  );
};

export default QuestionnaireEditor;
```

**Step 2: Add route to App.tsx**

Modify `frontend/src/App.tsx`:

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QuestionnaireEditor from './pages/QuestionnaireEditor';
// ... existing imports

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* ... existing header ... */}

        <Routes>
          {/* ... existing routes ... */}
          <Route path="/experiments/:id/edit" element={<QuestionnaireEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

**Step 3: Update experiments API**

Modify `frontend/src/api/experiments.ts` (add functions for fetching/updating questions):

```typescript
// Add to existing exports

export async function getExperimentQuestions(experimentId: string): Promise<any[]> {
  const response = await api.get(`/experiments/${experimentId}/questions`);
  return response.data.questions || [];
}

export async function updateExperimentQuestions(
  experimentId: string,
  questions: any[]
): Promise<void> {
  await api.put(`/experiments/${experimentId}`, {
    experiment_config: { questions }
  });
}
```

**Step 4: Verify TypeScript compilation**

```bash
cd frontend && npm run build
```

Expected: No type errors

**Step 5: Start development server and test**

```bash
cd frontend && npm run dev
```

Expected: Server starts on http://localhost:5173

**Step 6: Commit**

```bash
git add frontend/src/pages/QuestionnaireEditor.tsx frontend/src/App.tsx frontend/src/api/experiments.ts
git commit -m "feat: implement main questionnaire editor page

- Three-column layout with toolbar, questions, config
- Empty state with guidance
- Route integration
- Mock data support
"
```

---

## Task 8: Backend API Endpoints for Questions

**Files:**
- Modify: `backend/app/api/v1/experiments.py`
- Test: `backend/tests/test_experiments_api.py`

**Step 1: Write failing test for questions endpoint**

Add to `backend/tests/test_experiments_api.py`:

```python
def test_get_experiment_questions(client, test_experiment):
    """Test fetching questions for an experiment"""
    response = client.get(f"/api/v1/experiments/{test_experiment.id}/questions")

    assert response.status_code == 200
    data = response.json()
    assert "questions" in data
    assert isinstance(data["questions"], list)

def test_update_experiment_questions(client, test_experiment):
    """Test updating questions in an experiment"""
    new_questions = [
        {
            "id": "Q_001",
            "type": "single",
            "title": "Test Question",
            "required": True,
            "order": 0,
            "options": [
                {"id": "OPT_1", "label": "Option 1", "value": "opt1", "order": 0}
            ]
        }
    ]

    response = client.put(
        f"/api/v1/experiments/{test_experiment.id}",
        json={"experiment_config": {"questions": new_questions}}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["experiment_config"]["questions"] == new_questions
```

**Step 2: Run tests to verify they fail**

```bash
cd backend && ../.venv/bin/pytest tests/test_experiments_api.py::test_get_experiment_questions -v
```

Expected: 404 Not Found

**Step 3: Implement endpoint**

Add to `backend/app/api/v1/experiments.py`:

```python
@router.get("/{experiment_id}/questions")
def get_experiment_questions(
    experiment_id: int,
    db: Session = Depends(get_db)
):
    """Get questions for an experiment"""
    experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    questions = experiment.experiment_config.get("questions", [])
    return {"questions": questions}
```

**Step 4: Run tests to verify they pass**

```bash
cd backend && ../.venv/bin/pytest tests/test_experiments_api.py::test_get_experiment_questions tests/test_experiments_api.py::test_update_experiment_questions -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/api/v1/experiments.py backend/tests/test_experiments_api.py
git commit -m "feat: add questions endpoints to experiments API

- GET /experiments/{id}/questions
- Update PUT endpoint to handle questions in config
- Tests for both endpoints
"
```

---

## Summary

Phase 1 implements the core questionnaire editor with:

✅ Backend data model for 4 question types
✅ Frontend TypeScript types
✅ Centralized state management (Context API)
✅ Question card components for all types
✅ Three-column layout (toolbar, questions, config)
✅ Inline editing support
✅ API endpoints for persistence

**Next phases will add:**
- Phase 2: Batch input dialogs
- Phase 3: Scale templates and quick generator
- Phase 4: Number-based reordering
- Phase 5: Polish (auto-save, shortcuts, mobile)

**Total estimated tasks:** 8 tasks, ~40 sub-steps

**Testing strategy:**
- Backend: pytest for all API endpoints
- Frontend: Manual testing in browser for now, add Playwright E2E tests in Phase 5

**Commit frequency:** Every 1-2 completed steps (small, atomic commits)

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

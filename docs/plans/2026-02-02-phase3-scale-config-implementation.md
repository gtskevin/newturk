# Phase 3: Scale Configuration & Preset Templates - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a comprehensive scale editor for matrix questions with preset templates, smart interpolation, and selective batch application.

**Architecture:** Modal dialog system (ScaleEditDialog, ScaleApplyDialog) following existing Phase 2 patterns, with utility modules for preset definitions and Chinese label interpolation.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest, React Context API

---

## Task 1: Create Scale Presets Utility Module

**Files:**
- Create: `frontend/src/lib/scalePresets.ts`
- Test: `frontend/src/lib/__tests__/scalePresets.test.ts`

**Step 1: Write failing tests for preset definitions**

Create `frontend/src/lib/__tests__/scalePresets.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getPreset, getAllPresets, PRESETS } from '../scalePresets';

describe('scalePresets', () => {
  describe('getAllPresets', () => {
    it('should return all 5 preset names', () => {
      const presets = getAllPresets();
      expect(presets).toHaveLength(5);
      expect(presets).toContain('5点Likert量表');
      expect(presets).toContain('7点Likert量表');
      expect(presets).toContain('1-10评分');
      expect(presets).toContain('满意度5级');
      expect(presets).toContain('频率5级');
    });
  });

  describe('getPreset', () => {
    it('should return 5-point Likert preset', () => {
      const preset = getPreset('5点Likert量表');
      expect(preset).toBeDefined();
      expect(preset?.points).toHaveLength(5);
      expect(preset?.points[0]).toEqual({ value: 1, label: '非常不同意' });
      expect(preset?.points[4]).toEqual({ value: 5, label: '非常同意' });
    });

    it('should return 7-point Likert preset', () => {
      const preset = getPreset('7点Likert量表');
      expect(preset).toBeDefined();
      expect(preset?.points).toHaveLength(7);
      expect(preset?.points[0]).toEqual({ value: 1, label: '非常不同意' });
      expect(preset?.points[6]).toEqual({ value: 7, label: '非常同意' });
    });

    it('should return 1-10 rating preset', () => {
      const preset = getPreset('1-10评分');
      expect(preset).toBeDefined();
      expect(preset?.points).toHaveLength(10);
      expect(preset?.points[0]).toEqual({ value: 1, label: '1' });
      expect(preset?.points[9]).toEqual({ value: 10, label: '10' });
    });

    it('should return satisfaction 5-level preset', () => {
      const preset = getPreset('满意度5级');
      expect(preset).toBeDefined();
      expect(preset?.points).toHaveLength(5);
      expect(preset?.points[0]).toEqual({ value: 1, label: '非常不满意' });
      expect(preset?.points[4]).toEqual({ value: 5, label: '非常满意' });
    });

    it('should return frequency 5-level preset', () => {
      const preset = getPreset('频率5级');
      expect(preset).toBeDefined();
      expect(preset?.points).toHaveLength(5);
      expect(preset?.points[0]).toEqual({ value: 1, label: '从不' });
      expect(preset?.points[4]).toEqual({ value: 5, label: '总是' });
    });

    it('should return undefined for unknown preset', () => {
      const preset = getPreset('Unknown preset');
      expect(preset).toBeUndefined();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- scalePresets.test.ts --run`
Expected: FAIL with "Cannot find module '../scalePresets'"

**Step 3: Implement scalePresets module**

Create `frontend/src/lib/scalePresets.ts`:

```typescript
import { ScaleConfig } from '../types/question';

export interface PresetDefinition {
  name: string;
  scale: ScaleConfig;
}

export const PRESETS: PresetDefinition[] = [
  {
    name: '5点Likert量表',
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
  },
  {
    name: '7点Likert量表',
    scale: {
      type: 'preset',
      presetName: '7点Likert量表',
      points: [
        { value: 1, label: '非常不同意' },
        { value: 2, label: '不同意' },
        { value: 3, label: '有点不同意' },
        { value: 4, label: '中立' },
        { value: 5, label: '有点同意' },
        { value: 6, label: '同意' },
        { value: 7, label: '非常同意' },
      ],
      showValue: true,
      showLabel: true,
    },
  },
  {
    name: '1-10评分',
    scale: {
      type: 'preset',
      presetName: '1-10评分',
      points: Array.from({ length: 10 }, (_, i) => ({
        value: i + 1,
        label: String(i + 1),
      })),
      showValue: true,
      showLabel: true,
    },
  },
  {
    name: '满意度5级',
    scale: {
      type: 'preset',
      presetName: '满意度5级',
      points: [
        { value: 1, label: '非常不满意' },
        { value: 2, label: '不满意' },
        { value: 3, label: '一般' },
        { value: 4, label: '满意' },
        { value: 5, label: '非常满意' },
      ],
      showValue: false,
      showLabel: true,
    },
  },
  {
    name: '频率5级',
    scale: {
      type: 'preset',
      presetName: '频率5级',
      points: [
        { value: 1, label: '从不' },
        { value: 2, label: '很少' },
        { value: 3, label: '有时' },
        { value: 4, label: '经常' },
        { value: 5, label: '总是' },
      ],
      showValue: false,
      showLabel: true,
    },
  },
];

export function getAllPresets(): string[] {
  return PRESETS.map(p => p.name);
}

export function getPreset(name: string): ScaleConfig | undefined {
  const preset = PRESETS.find(p => p.name === name);
  return preset ? { ...preset.scale } : undefined;
}
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- scalePresets.test.ts --run`
Expected: PASS (6 tests)

**Step 5: Commit**

```bash
git add frontend/src/lib/scalePresets.ts frontend/src/lib/__tests__/scalePresets.test.ts
git commit -m "feat: add scale presets utility module

Add 5 preset scale templates:
- 5-point and 7-point Likert scales
- 1-10 numeric rating
- Satisfaction and frequency scales (5-level each)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Scale Interpolation Utility

**Files:**
- Create: `frontend/src/lib/scaleInterpolator.ts`
- Test: `frontend/src/lib/__tests__/scaleInterpolator.test.ts`

**Step 1: Write failing tests for interpolation**

Create `frontend/src/lib/__tests__/scaleInterpolator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateScale, InterpolationPattern } from '../scaleInterpolator';
import { ScalePoint } from '../types/question';

describe('scaleInterpolator', () => {
  describe('generateScale with known patterns', () => {
    it('should generate 5-point Likert scale', () => {
      const result = generateScale(1, 5, '非常不同意', '非常同意');
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ value: 1, label: '非常不同意' });
      expect(result[2]).toEqual({ value: 3, label: '中立' });
      expect(result[4]).toEqual({ value: 5, label: '非常同意' });
    });

    it('should generate 7-point Likert scale', () => {
      const result = generateScale(1, 7, '非常不同意', '非常同意');
      expect(result).toHaveLength(7);
      expect(result[0]).toEqual({ value: 1, label: '非常不同意' });
      expect(result[3]).toEqual({ value: 4, label: '中立' });
      expect(result[6]).toEqual({ value: 7, label: '非常同意' });
    });

    it('should generate satisfaction scale', () => {
      const result = generateScale(1, 5, '非常不满意', '非常满意');
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ value: 1, label: '非常不满意' });
      expect(result[2]).toEqual({ value: 3, label: '一般' });
      expect(result[4]).toEqual({ value: 5, label: '非常满意' });
    });

    it('should generate frequency scale', () => {
      const result = generateScale(1, 5, '从不', '总是');
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ value: 1, label: '从不' });
      expect(result[2]).toEqual({ value: 3, label: '有时' });
      expect(result[4]).toEqual({ value: 5, label: '总是' });
    });
  });

  describe('generateScale with numeric fallback', () => {
    it('should use numeric labels for unknown patterns', () => {
      const result = generateScale(1, 5, 'Custom Start', 'Custom End');
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ value: 1, label: 'Custom Start' });
      expect(result[1]).toEqual({ value: 2, label: '2' });
      expect(result[4]).toEqual({ value: 5, label: 'Custom End' });
    });

    it('should generate 1-10 numeric scale', () => {
      const result = generateScale(1, 10, '1', '10');
      expect(result).toHaveLength(10);
      expect(result[0]).toEqual({ value: 1, label: '1' });
      expect(result[9]).toEqual({ value: 10, label: '10' });
    });
  });

  describe('generateScale edge cases', () => {
    it('should handle 2-point scale', () => {
      const result = generateScale(1, 2, 'Low', 'High');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ value: 1, label: 'Low' });
      expect(result[1]).toEqual({ value: 2, label: 'High' });
    });

    it('should handle non-numeric values', () => {
      const result = generateScale(0, 4, 'A', 'E');
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ value: 0, label: 'A' });
      expect(result[4]).toEqual({ value: 4, label: 'E' });
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- scaleInterpolator.test.ts --run`
Expected: FAIL with "Cannot find module '../scaleInterpolator'"

**Step 3: Implement interpolation module**

Create `frontend/src/lib/scaleInterpolator.ts`:

```typescript
import { ScalePoint } from '../types/question';

export interface InterpolationPattern {
  start: string[];
  end: string[];
  intermediates: string[];
}

const PATTERNS: InterpolationPattern[] = [
  {
    start: ['非常不同意', '很不同意', '不同意'],
    end: ['非常同意', '很同意', '同意'],
    intermediates: ['不同意', '中立', '同意'],
  },
  {
    start: ['非常不满意', '很不满意', '不满意'],
    end: ['非常满意', '很满意', '满意'],
    intermediates: ['不满意', '一般', '满意'],
  },
  {
    start: ['从不', '从来没有'],
    end: ['总是', '一直都是'],
    intermediates: ['很少', '有时', '经常'],
  },
  {
    start: ['非常差', '很差'],
    end: ['非常好', '很好'],
    intermediates: ['差', '一般', '好'],
  },
];

function findPattern(startLabel: string, endLabel: string): InterpolationPattern | null {
  for (const pattern of PATTERNS) {
    const startMatch = pattern.start.some(s => startLabel.includes(s) || s.includes(startLabel));
    const endMatch = pattern.end.some(e => endLabel.includes(e) || e.includes(endLabel));
    if (startMatch && endMatch) {
      return pattern;
    }
  }
  return null;
}

function interpolateLabels(
  startLabel: string,
  endLabel: string,
  numPoints: number
): string[] {
  const pattern = findPattern(startLabel, endLabel);

  if (pattern && numPoints <= 5) {
    // Use pattern intermediates for 5 or fewer points
    return distributePattern(pattern.intermediates, numPoints, startLabel, endLabel);
  } else if (pattern && numPoints <= 7) {
    // Use extended pattern for up to 7 points
    return distributePatternExtended(pattern.intermediates, numPoints, startLabel, endLabel);
  }

  // Fallback: numeric labels
  return Array.from({ length: numPoints }, (_, i) => {
    if (i === 0) return startLabel;
    if (i === numPoints - 1) return endLabel;
    return String(i + 1);
  });
}

function distributePattern(
  intermediates: string[],
  numPoints: number,
  startLabel: string,
  endLabel: string
): string[] {
  const result: string[] = [];

  for (let i = 0; i < numPoints; i++) {
    if (i === 0) {
      result.push(startLabel);
    } else if (i === numPoints - 1) {
      result.push(endLabel);
    } else {
      // Distribute across intermediates
      const index = Math.floor((i / (numPoints - 1)) * intermediates.length);
      const clampedIndex = Math.min(index, intermediates.length - 1);
      result.push(intermediates[clampedIndex]);
    }
  }

  return result;
}

function distributePatternExtended(
  intermediates: string[],
  numPoints: number,
  startLabel: string,
  endLabel: string
): string[] {
  const result: string[] = [];

  for (let i = 0; i < numPoints; i++) {
    if (i === 0) {
      result.push(startLabel);
    } else if (i === numPoints - 1) {
      result.push(endLabel);
    } else if (numPoints === 7) {
      // 7-point pattern: start, weak, medium, neutral, medium, strong, end
      const mid = Math.floor(intermediates.length / 2);
      if (i === 1 || i === numPoints - 2) {
        result.push(intermediates[0]); // weak
      } else if (i === 2 || i === numPoints - 3) {
        result.push(intermediates[1]); // medium
      } else {
        result.push(intermediates[mid]); // neutral
      }
    } else {
      // Fallback to numeric for other sizes
      result.push(String(i + 1));
    }
  }

  return result;
}

export function generateScale(
  startValue: number,
  endValue: number,
  startLabel: string,
  endLabel: string
): ScalePoint[] {
  const numPoints = endValue - startValue + 1;
  const labels = interpolateLabels(startLabel, endLabel, numPoints);

  return Array.from({ length: numPoints }, (_, i) => ({
    value: startValue + i,
    label: labels[i],
  }));
}
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- scaleInterpolator.test.ts --run`
Expected: PASS (9 tests)

**Step 5: Commit**

```bash
git add frontend/src/lib/scaleInterpolator.ts frontend/src/lib/__tests__/scaleInterpolator.test.ts
git commit -m "feat: add smart scale interpolation for Chinese labels

Implement pattern-based interpolation for common Likert scales:
- Agreement scales (不同意 → 同意)
- Satisfaction scales (不满意 → 满意)
- Frequency scales (从不 → 总是)
- Quality scales (差 → 好)

Gracefully falls back to numeric labels for unknown patterns.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Add applyScaleToQuestions to Context

**Files:**
- Modify: `frontend/src/contexts/SurveyEditorContext.tsx:24,310-320`

**Step 1: Update Context interface**

Add `applyScaleToQuestions` to the interface:

```typescript
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
  applyScaleToQuestions: (questionIds: string[], scale: ScaleConfig) => void;  // NEW

  // Batch operations
  selectedQuestionIds: string[];
  toggleQuestionSelection: (id: string) => void;
  clearSelection: () => void;
  moveSelectedQuestions: (targetOrder: number) => void;

  // Selection
  selectQuestion: (id: string | null) => void;
}
```

**Step 2: Implement applyScaleToQuestions**

Add the implementation after the `updateScale` function (around line 320):

```typescript
// Apply scale to multiple questions
const applyScaleToQuestions = useCallback((questionIds: string[], scale: ScaleConfig) => {
  setSurvey(prev => ({
    ...prev,
    questions: prev.questions.map(q => {
      if (questionIds.includes(q.id) && q.type === 'matrix') {
        return { ...q, scale };
      }
      return q;
    }),
  }));
}, []);
```

**Step 3: Add to context value**

Add to the value object (around line 379):

```typescript
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
  applyScaleToQuestions,  // NEW
  selectedQuestionIds,
  toggleQuestionSelection,
  clearSelection,
  moveSelectedQuestions,
  selectQuestion,
};
```

**Step 4: Run existing tests to ensure no regression**

Run: `cd frontend && npm test -- --run`
Expected: All tests pass

**Step 5: Commit**

```bash
git add frontend/src/contexts/SurveyEditorContext.tsx
git commit -m "feat: add applyScaleToQuestions to context

Add batch scale application method for updating multiple
matrix questions simultaneously. Required for Phase 3
selective batch application feature.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create PresetSelector Component

**Files:**
- Create: `frontend/src/components/editor/scale/PresetSelector.tsx`
- Test: `frontend/src/components/editor/scale/__tests__/PresetSelector.test.tsx`

**Step 1: Write failing test**

Create `frontend/src/components/editor/scale/__tests__/PresetSelector.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PresetSelector from '../PresetSelector';

describe('PresetSelector', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('should render dropdown with all presets', () => {
    render(<PresetSelector onSelect={mockOnSelect} />);

    expect(screen.getByText('预设模板')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should call onSelect when preset is selected', () => {
    render(<PresetSelector onSelect={mockOnSelect} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '5点Likert量表' } });

    expect(mockOnSelect).toHaveBeenCalledWith(
      '5点Likert量表',
      expect.objectContaining({
        presetName: '5点Likert量表',
        points: expect.arrayContaining([
          expect.objectContaining({ value: 1, label: '非常不同意' })
        ])
      })
    );
  });

  it('should have correct preset options', () => {
    render(<PresetSelector onSelect={mockOnSelect} />);

    const select = screen.getByRole('combobox');
    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(6); // 5 presets + 1 empty option
    expect(options[1]).toHaveTextContent('5点Likert量表');
    expect(options[2]).toHaveTextContent('7点Likert量表');
    expect(options[3]).toHaveTextContent('1-10评分');
    expect(options[4]).toHaveTextContent('满意度5级');
    expect(options[5]).toHaveTextContent('频率5级');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- PresetSelector.test.tsx --run`
Expected: FAIL with "Cannot find module '../PresetSelector'"

**Step 3: Implement PresetSelector**

Create `frontend/src/components/editor/scale/PresetSelector.tsx`:

```typescript
import React from 'react';
import { getPreset, getAllPresets } from '../../../lib/scalePresets';
import { ScaleConfig } from '../../../types/question';

interface PresetSelectorProps {
  onSelect: (name: string, scale: ScaleConfig) => void;
  value?: string;
}

export default function PresetSelector({ onSelect, value }: PresetSelectorProps) {
  const presets = getAllPresets();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value;
    if (!presetName) return;

    const scale = getPreset(presetName);
    if (scale) {
      onSelect(presetName, scale);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        预设模板
      </label>
      <select
        value={value || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">选择预设模板...</option>
        {presets.map(preset => (
          <option key={preset} value={preset}>
            {preset}
          </option>
        ))}
      </select>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- PresetSelector.test.tsx --run`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add frontend/src/components/editor/scale/PresetSelector.tsx frontend/src/components/editor/scale/__tests__/PresetSelector.test.tsx
git commit -m "feat: add PresetSelector component

Dropdown for selecting from 5 preset scale templates.
Emits onSelect event with preset name and ScaleConfig.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create PointEditor Component

**Files:**
- Create: `frontend/src/components/editor/scale/PointEditor.tsx`
- Test: `frontend/src/components/editor/scale/__tests__/PointEditor.test.tsx`

**Step 1: Write failing test**

Create `frontend/src/components/editor/scale/__tests__/PointEditor.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PointEditor from '../PointEditor';
import { ScalePoint } from '../../../../types/question';

describe('PointEditor', () => {
  const mockPoints: ScalePoint[] = [
    { value: 1, label: '非常不同意' },
    { value: 2, label: '不同意' },
    { value: 3, label: '中立' },
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render all points', () => {
    render(<PointEditor points={mockPoints} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('非常不同意')).toBeInTheDocument();
    expect(screen.getByDisplayValue('不同意')).toBeInTheDocument();
    expect(screen.getByDisplayValue('中立')).toBeInTheDocument();
  });

  it('should call onChange when point label is edited', () => {
    render(<PointEditor points={mockPoints} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('不同意');
    fireEvent.change(input, { target: { value: '有点不同意' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      { value: 1, label: '非常不同意' },
      { value: 2, label: '有点不同意' },
      { value: 3, label: '中立' },
    ]);
  });

  it('should call onChange when point value is edited', () => {
    render(<PointEditor points={mockPoints} onChange={mockOnChange} />);

    const valueInput = screen.getAllByRole('spinbutton')[1];
    fireEvent.change(valueInput, { target: { value: '5' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      { value: 1, label: '非常不同意' },
      { value: 5, label: '不同意' },
      { value: 3, label: '中立' },
    ]);
  });

  it('should call onDelete when delete button is clicked', () => {
    const mockOnDelete = vi.fn();
    render(
      <PointEditor
        points={mockPoints}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('×');
    fireEvent.click(deleteButtons[1]);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('should not show delete buttons when only 2 points remain', () => {
    render(
      <PointEditor
        points={[mockPoints[0], mockPoints[1]]}
        onChange={mockOnChange}
      />
    );

    const deleteButtons = screen.queryAllByText('×');
    expect(deleteButtons).toHaveLength(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- PointEditor.test.tsx --run`
Expected: FAIL with "Cannot find module '../PointEditor'"

**Step 3: Implement PointEditor**

Create `frontend/src/components/editor/scale/PointEditor.tsx`:

```typescript
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
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- PointEditor.test.tsx --run`
Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add frontend/src/components/editor/scale/PointEditor.tsx frontend/src/components/editor/scale/__tests__/PointEditor.test.tsx
git commit -m "feat: add PointEditor component

Editable table for manual scale point editing.
Features:
- Edit value and label for each point
- Delete button (hidden when only 2 points remain)
- Optional add button for extending scale

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create QuickGenerator Component

**Files:**
- Create: `frontend/src/components/editor/scale/QuickGenerator.tsx`
- Test: `frontend/src/components/editor/scale/__tests__/QuickGenerator.test.tsx`

**Step 1: Write failing test**

Create `frontend/src/components/editor/scale/__tests__/QuickGenerator.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickGenerator from '../QuickGenerator';
import { ScalePoint } from '../../../../types/question';

describe('QuickGenerator', () => {
  const mockOnGenerate = vi.fn();

  beforeEach(() => {
    mockOnGenerate.mockClear();
  });

  it('should render all input fields', () => {
    render(<QuickGenerator onGenerate={mockOnGenerate} />);

    expect(screen.getByPlaceholderText('起始值')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('结束值')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('起始标签')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('结束标签')).toBeInTheDocument();
    expect(screen.getByText('生成刻度')).toBeInTheDocument();
  });

  it('should call onGenerate with correct parameters', () => {
    render(<QuickGenerator onGenerate={mockOnGenerate} />);

    fireEvent.change(screen.getByPlaceholderText('起始值'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('结束值'), { target: { value: '5' } });
    fireEvent.change(screen.getByPlaceholderText('起始标签'), { target: { value: '非常不同意' } });
    fireEvent.change(screen.getByPlaceholderText('结束标签'), { target: { value: '非常同意' } });

    fireEvent.click(screen.getByText('生成刻度'));

    expect(mockOnGenerate).toHaveBeenCalledWith(1, 5, '非常不同意', '非常同意');
  });

  it('should validate inputs before generating', () => {
    window.alert = vi.fn();

    render(<QuickGenerator onGenerate={mockOnGenerate} />);

    // Missing end value
    fireEvent.change(screen.getByPlaceholderText('起始值'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('生成刻度'));

    expect(mockOnGenerate).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('请填写完整的起止值和标签');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- QuickGenerator.test.tsx --run`
Expected: FAIL with "Cannot find module '../QuickGenerator'"

**Step 3: Implement QuickGenerator**

Create `frontend/src/components/editor/scale/QuickGenerator.tsx`:

```typescript
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
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- QuickGenerator.test.tsx --run`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add frontend/src/components/editor/scale/QuickGenerator.tsx frontend/src/components/editor/scale/__tests__/QuickGenerator.test.tsx
git commit -m "feat: add QuickGenerator component

Form for generating scales using start/end values and labels.
Validates inputs before calling onGenerate callback.
Integrates with scaleInterpolator for smart label generation.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create ScalePreview Component

**Files:**
- Create: `frontend/src/components/editor/scale/ScalePreview.tsx`
- Test: `frontend/src/components/editor/scale/__tests__/ScalePreview.test.tsx`

**Step 1: Write failing test**

Create `frontend/src/components/editor/scale/__tests__/ScalePreview.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScalePreview from '../ScalePreview';
import { ScaleConfig } from '../../../../types/question';

describe('ScalePreview', () => {
  const mockScale: ScaleConfig = {
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
  };

  it('should render scale points', () => {
    render(<ScalePreview scale={mockScale} />);

    expect(screen.getByText('非常不同意')).toBeInTheDocument();
    expect(screen.getByText('不同意')).toBeInTheDocument();
    expect(screen.getByText('中立')).toBeInTheDocument();
    expect(screen.getByText('同意')).toBeInTheDocument();
    expect(screen.getByText('非常同意')).toBeInTheDocument();
  });

  it('should show values when showValue is true', () => {
    render(<ScalePreview scale={mockScale} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should not show values when showValue is false', () => {
    const scaleNoValue = { ...mockScale, showValue: false };
    render(<ScalePreview scale={scaleNoValue} />);

    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('should not show labels when showLabel is false', () => {
    const scaleNoLabel = { ...mockScale, showLabel: false };
    render(<ScalePreview scale={scaleNoLabel} />);

    expect(screen.queryByText('非常不同意')).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- ScalePreview.test.tsx --run`
Expected: FAIL with "Cannot find module '../ScalePreview'"

**Step 3: Implement ScalePreview**

Create `frontend/src/components/editor/scale/ScalePreview.tsx`:

```typescript
import React from 'react';
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
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- ScalePreview.test.tsx --run`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add frontend/src/components/editor/scale/ScalePreview.tsx frontend/src/components/editor/scale/__tests__/ScalePreview.test.tsx
git commit -m "feat: add ScalePreview component

Live preview of scale configuration with radio buttons.
Shows/hides labels and values based on showLabel and showValue flags.
Read-only checkboxes indicate current display settings.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create ScaleEditDialog Component

**Files:**
- Create: `frontend/src/components/editor/ScaleEditDialog.tsx`
- Modify: `frontend/src/components/editor/index.ts`
- Modify: `frontend/src/components/question/MatrixCard.tsx:180,279-286`
- Modify: `frontend/src/components/editor/ConfigurationPanel.tsx:279-286`

**Step 1: Create ScaleEditDialog component**

Create `frontend/src/components/editor/ScaleEditDialog.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ScaleConfig, ScalePoint } from '../../types/question';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';
import PresetSelector from './scale/PresetSelector';
import QuickGenerator from './scale/QuickGenerator';
import PointEditor from './scale/PointEditor';
import ScalePreview from './scale/ScalePreview';
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
              onClick={onApplyToAll}
              className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              应用到所有矩阵题
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Export from index**

Update `frontend/src/components/editor/index.ts`:

```typescript
export { default as BatchInputDialog } from './BatchInputDialog';
export { default as PreviewDialog } from './PreviewDialog';
export { default as ScaleEditDialog } from './ScaleEditDialog';
```

**Step 3: Update MatrixCard to use dialog**

Modify `frontend/src/components/question/MatrixCard.tsx`:

Add import:
```typescript
import { ScaleEditDialog } from '../editor';
```

Add state (after line 40):
```typescript
const [showScaleDialog, setShowScaleDialog] = useState(false);
```

Update the "修改量表" button (around line 176-181):
```typescript
<button
  onClick={(e) => {
    e.stopPropagation();
    setShowScaleDialog(true);
  }}
  className="text-sm text-gray-500 hover:text-gray-700"
>
  修改量表
</button>
```

Add dialog at end (before closing </QuestionCard>):
```typescript
<ScaleEditDialog
  isOpen={showScaleDialog}
  questionId={question.id}
  initialScale={question.scale}
  onClose={() => setShowScaleDialog(false)}
/>
```

**Step 4: Update ConfigurationPanel to use dialog**

Modify `frontend/src/components/editor/ConfigurationPanel.tsx`:

Add import:
```typescript
import { ScaleEditDialog } from './index';
```

Add state (around line 25):
```typescript
const [showScaleDialog, setShowScaleDialog] = useState(false);
```

Update the "修改量表" button (around line 279-286):
```typescript
{onEditScale && (
  <button
    onClick={() => setShowScaleDialog(true)}
    className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
  >
    修改量表...
  </button>
)}
```

Add dialog before closing </div> (around line 382):
```typescript
{question.type === 'matrix' && (
  <ScaleEditDialog
    isOpen={showScaleDialog}
    questionId={question.id}
    initialScale={(question as MatrixQuestion).scale}
    onClose={() => setShowScaleDialog(false)}
  />
)}
```

**Step 5: Run all tests**

Run: `cd frontend && npm test -- --run`
Expected: All tests pass

**Step 6: Commit**

```bash
git add frontend/src/components/editor/ScaleEditDialog.tsx frontend/src/components/editor/index.ts frontend/src/components/question/MatrixCard.tsx frontend/src/components/editor/ConfigurationPanel.tsx
git commit -m "feat: add ScaleEditDialog component

Main scale editor dialog integrating:
- PresetSelector for quick template selection
- QuickGenerator with smart interpolation
- PointEditor for manual editing
- ScalePreview for live feedback

Live updates reflect changes on MatrixCard in real-time.
Wired up from MatrixCard and ConfigurationPanel.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Create ScaleApplyDialog Component

**Files:**
- Create: `frontend/src/components/editor/ScaleApplyDialog.tsx`
- Modify: `frontend/src/components/editor/index.ts`
- Modify: `frontend/src/components/editor/ScaleEditDialog.tsx`

**Step 1: Create ScaleApplyDialog component**

Create `frontend/src/components/editor/ScaleApplyDialog.tsx`:

```typescript
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ScaleConfig, Question, MatrixQuestion } from '../../types/question';
import { useSurveyEditor } from '../../contexts/SurveyEditorContext';

interface ScaleApplyDialogProps {
  isOpen: boolean;
  sourceScale: ScaleConfig;
  sourceQuestionId: string;
  onClose: () => void;
}

interface MatrixQuestionWithCurrent extends MatrixQuestion {
  current?: string; // Display string for current scale
}

export default function ScaleApplyDialog({
  isOpen,
  sourceScale,
  sourceQuestionId,
  onClose,
}: ScaleApplyDialogProps) {
  const { survey, applyScaleToQuestions } = useSurveyEditor();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get all matrix questions except source
  const matrixQuestions = survey.questions.filter(
    (q): q is MatrixQuestion => q.type === 'matrix' && q.id !== sourceQuestionId
  );

  // Pre-select questions with different scales
  React.useEffect(() => {
    const different = matrixQuestions
      .filter(q => JSON.stringify(q.scale) !== JSON.stringify(sourceScale))
      .map(q => q.id);
    setSelectedIds(different);
  }, [sourceScale, matrixQuestions]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    if (selectedIds.length === 0) {
      alert('请选择至少一个问题');
      return;
    }
    applyScaleToQuestions(selectedIds, sourceScale);
    onClose();
  };

  const formatScaleInfo = (scale: ScaleConfig): string => {
    const name = scale.presetName || '自定义';
    return `${name} (${scale.points.length}点)`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">应用量表到其他矩阵题</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Current scale info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-medium text-blue-900">当前量表</p>
            <p className="text-sm text-blue-700">{formatScaleInfo(sourceScale)}</p>
          </div>

          <p className="text-sm font-medium text-gray-700 mb-3">选择要应用此量表的问题:</p>

          {/* Question list */}
          <div className="space-y-2">
            {matrixQuestions.map((q) => {
              const isSame = JSON.stringify(q.scale) === JSON.stringify(sourceScale);
              const isSelected = selectedIds.includes(q.id);

              return (
                <label
                  key={q.id}
                  className={`flex items-start p-3 border rounded cursor-pointer transition-colors ${
                    isSame
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(q.id)}
                    disabled={isSame}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {q.order + 1}. {q.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      当前: {formatScaleInfo(q.scale)}
                      {isSame && ' (相同)'}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              已选择 <span className="font-semibold">{selectedIds.length}</span> 个问题
              (共 {matrixQuestions.length} 个矩阵题)
            </p>
            {selectedIds.length > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                ℹ️ 将覆盖这些问题原有的量表配置
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            确认应用
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Export from index**

Update `frontend/src/components/editor/index.ts`:

```typescript
export { default as BatchInputDialog } from './BatchInputDialog';
export { default as PreviewDialog } from './PreviewDialog';
export { default as ScaleEditDialog } from './ScaleEditDialog';
export { default as ScaleApplyDialog } from './ScaleApplyDialog';
```

**Step 3: Wire up in ScaleEditDialog**

Update `frontend/src/components/editor/ScaleEditDialog.tsx`:

Add import:
```typescript
import { ScaleApplyDialog } from './index';
```

Add state (around line 32):
```typescript
const [showApplyDialog, setShowApplyDialog] = useState(false);
```

Update onApplyToAll button (around line 240):
```typescript
{onApplyToAll && (
  <button
    onClick={() => setShowApplyDialog(true)}
    className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
  >
    应用到所有矩阵题
  </button>
)}
```

Add dialog before closing </div> (around line 250):
```typescript
{showApplyDialog && onApplyToAll && (
  <ScaleApplyDialog
    isOpen={showApplyDialog}
    sourceScale={scale}
    sourceQuestionId={questionId}
    onClose={() => setShowApplyDialog(false)}
  />
)}
```

**Step 4: Wire up from MatrixCard**

Update `frontend/src/components/question/MatrixCard.tsx`:

Add import:
```typescript
import { ScaleEditDialog, ScaleApplyDialog } from '../editor';
```

Add state (around line 40):
```typescript
const [showScaleDialog, setShowScaleDialog] = useState(false);
const [showApplyDialog, setShowApplyDialog] = useState(false);
```

Update ScaleEditDialog props (around line 210):
```typescript
<ScaleEditDialog
  isOpen={showScaleDialog}
  questionId={question.id}
  initialScale={question.scale}
  onClose={() => setShowScaleDialog(false)}
  onApplyToAll={() => {
    setShowScaleDialog(false);
    setShowApplyDialog(true);
  }}
/>

<ScaleApplyDialog
  isOpen={showApplyDialog}
  sourceScale={question.scale}
  sourceQuestionId={question.id}
  onClose={() => setShowApplyDialog(false)}
/>
```

**Step 5: Run all tests**

Run: `cd frontend && npm test -- --run`
Expected: All tests pass

**Step 6: Commit**

```bash
git add frontend/src/components/editor/ScaleApplyDialog.tsx frontend/src/components/editor/index.ts frontend/src/components/editor/ScaleEditDialog.tsx frontend/src/components/question/MatrixCard.tsx
git commit -m "feat: add ScaleApplyDialog component

Selective batch application dialog for scales:
- Lists all matrix questions with current scales
- Pre-selects questions with different scales
- Shows visual context for each question
- Prevents accidental changes with confirmation

Integrated into ScaleEditDialog flow.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Final Integration and Polish

**Files:**
- Test: Manual testing in browser

**Step 1: Start dev server**

Run: `cd frontend && npm run dev`
Expected: Dev server starts at http://localhost:5173

**Step 2: Manual test checklist**

Open http://localhost:5173 and test:

1. **Preset Selection**
   - [ ] Create a matrix question
   - [ ] Click "修改量表"
   - [ ] Select each of the 5 presets
   - [ ] Verify scale updates live on MatrixCard
   - [ ] Verify labels and values display correctly

2. **Quick Generator**
   - [ ] Click "修改量表"
   - [ ] Enter: 1-5, "非常不同意" to "非常同意"
   - [ ] Click "生成刻度"
   - [ ] Verify 5-point Likert scale is generated
   - [ ] Test with: 1-7, "从不" to "总是"
   - [ ] Verify 5-point frequency scale is generated
   - [ ] Test with unknown pattern (e.g., "A" to "E")
   - [ ] Verify numeric fallback works

3. **Manual Editing**
   - [ ] Click "修改量表"
   - [ ] Edit a point's label
   - [ ] Edit a point's value
   - [ ] Delete a point (when > 2 points)
   - [ ] Add a new point
   - [ ] Verify all changes reflect live

4. **Display Options**
   - [ ] Toggle "显示标签"
   - [ ] Toggle "显示分值"
   - [ ] Verify MatrixCard updates accordingly

5. **Batch Application**
   - [ ] Create 3 matrix questions with different scales
   - [ ] Edit first question's scale
   - [ ] Click "应用到所有矩阵题"
   - [ ] Select questions to apply to
   - [ ] Click "确认应用"
   - [ ] Verify selected questions now have the new scale
   - [ ] Verify unselected questions keep their original scales

6. **Cancel/Save**
   - [ ] Make changes to scale
   - [ ] Click "取消"
   - [ ] Verify scale reverts to original
   - [ ] Make changes to scale
   - [ ] Click "保存"
   - [ ] Verify changes persist

7. **Keyboard Shortcuts**
   - [ ] Press Escape when dialog is open
   - [ ] Verify dialog closes and reverts changes

**Step 3: Add keyboard shortcut support**

Update `frontend/src/components/editor/ScaleEditDialog.tsx`:

Add effect after line 34:
```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen]);
```

**Step 4: Add success notification for batch apply**

Update `frontend/src/components/editor/ScaleApplyDialog.tsx`:

Add state (after line 20):
```typescript
const [showSuccess, setShowSuccess] = useState(false);
```

Update handleApply:
```typescript
const handleApply = () => {
  if (selectedIds.length === 0) {
    alert('请选择至少一个问题');
    return;
  }
  applyScaleToQuestions(selectedIds, sourceScale);
  setShowSuccess(true);
  setTimeout(() => {
    setShowSuccess(false);
    onClose();
  }, 2000);
};
```

Add success notification before closing </div>:
```typescript
{showSuccess && (
  <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
    已应用量表到 {selectedIds.length} 个问题
  </div>
)}
```

**Step 5: Run all tests one final time**

Run: `cd frontend && npm test -- --run`
Expected: All tests pass

**Step 6: Commit**

```bash
git add frontend/src/components/editor/ScaleEditDialog.tsx frontend/src/components/editor/ScaleApplyDialog.tsx
git commit -m "polish: add keyboard shortcuts and success notifications

- Escape key closes ScaleEditDialog and reverts changes
- Success notification shows count of affected questions
- Improved UX for batch scale application

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Documentation and Final Cleanup

**Files:**
- Update: `docs/plans/2026-02-02-questionnaire-editor-phase3-design.md`

**Step 1: Update design document with implementation status**

Open `docs/plans/2026-02-02-questionnaire-editor-phase3-design.md` and add at the end:

```markdown
## Implementation Status

✅ **COMPLETED** - 2026-02-02

### Completed Tasks
- ✅ Task 1: Scale Presets Utility Module
- ✅ Task 2: Scale Interpolation Utility
- ✅ Task 3: Context Enhancement (applyScaleToQuestions)
- ✅ Task 4: PresetSelector Component
- ✅ Task 5: PointEditor Component
- ✅ Task 6: QuickGenerator Component
- ✅ Task 7: ScalePreview Component
- ✅ Task 8: ScaleEditDialog Component
- ✅ Task 9: ScaleApplyDialog Component
- ✅ Task 10: Integration and Polish
- ✅ Task 11: Documentation

### Test Coverage
- 30+ unit tests for utilities and components
- All tests passing
- Manual testing completed

### Feature Verification
- ✅ 5 preset templates working
- ✅ Smart interpolation for Chinese patterns
- ✅ Manual scale editing functional
- ✅ Live preview on MatrixCard
- ✅ Selective batch application working
- ✅ Keyboard shortcuts (Escape to cancel)
- ✅ Success notifications

Phase 3 is complete and ready for merge.
```

**Step 2: Run final test suite**

Run: `cd frontend && npm test -- --run`
Expected: All tests pass

**Step 3: Build production bundle**

Run: `cd frontend && npm run build`
Expected: Build succeeds without errors

**Step 4: Commit final documentation**

```bash
git add docs/plans/2026-02-02-questionnaire-editor-phase3-design.md
git commit -m "docs: mark Phase 3 implementation as complete

All 11 tasks completed:
- Preset templates, quick generator, manual editing
- Smart Chinese interpolation
- Selective batch application
- Live preview, keyboard shortcuts, notifications

Ready for merge to main.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Summary

This plan implements Phase 3: Scale Configuration & Preset Templates in 11 bite-sized tasks:

1. **Foundation** (Tasks 1-3): Utility modules and context enhancement
2. **Components** (Tasks 4-7): Individual UI components with tests
3. **Integration** (Tasks 8-9): Main dialogs and wiring
4. **Polish** (Tasks 10-11): UX improvements and documentation

**Testing Strategy:**
- TDD for all components (30+ tests)
- Manual testing checklist for integration
- Production build verification

**Success Criteria:**
- All tests passing
- 5 preset templates functional
- Smart interpolation working
- Batch application selective and safe
- Live preview responsive
- No regression in Phase 1/2 features

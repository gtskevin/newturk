# Phase 3: Scale Configuration & Preset Templates - Design Document

## Overview

This document describes the design and implementation plan for Phase 3 of the questionnaire editor: **Scale Configuration & Preset Templates**.

**Goal**: Provide efficient scale configuration for matrix questions through preset templates, quick generation, and batch application capabilities.

## Features

### 1. Preset Templates
- 5 built-in presets: 5/7-point Likert, 1-10 rating, Satisfaction (5-level), Frequency (5-level)
- Presets populate editable fields (not locked)
- Users can customize after selecting a preset

### 2. Quick Generator
- Input start/end values and labels
- Smart interpolation generates intermediate scale points
- Supports Chinese semantic patterns (e.g., "非常不同意" → "非常同意")

### 3. Manual Scale Editing
- Editable table of all scale points
- Add/delete/reorder individual points
- Display toggles: show/hide labels and values

### 4. Selective Batch Application
- "Apply to all matrix questions" button
- Dialog shows all matrix questions with their current scales
- User selects which questions to apply the scale to
- Prevents accidental bulk changes

### 5. Live Preview
- Real-time updates on the actual MatrixCard in the background
- No separate preview component needed
- Changes apply instantly as user edits

## Architecture

### Component Hierarchy

```
QuestionnaireEditor (SurveyEditorProvider)
  └── EditorLayout
      ├── QuestionList
      │   └── MatrixCard
      │       └── [修改量表] button → opens ScaleEditDialog
      └── ConfigurationPanel
          └── [矩阵配置 section]
              └── [修改量表] button → opens ScaleEditDialog

ScaleEditDialog (NEW)
  ├── PresetSelector (NEW)
  ├── QuickGenerator (NEW)
  ├── PointEditor (NEW)
  ├── ScalePreview (NEW)
  └── [应用到所有矩阵题] button → opens ScaleApplyDialog

ScaleApplyDialog (NEW)
```

### Data Flow

```
User clicks "修改量表"
  → ScaleEditDialog opens with current question.scale
  → Dialog maintains draftScale state
  → Any change → updateScale(questionId, draftScale)
  → MatrixCard re-renders with new scale (live)
  → [保存] → closes dialog (scale already applied)
  → [取消] → reverts to original scale
  → [应用到所有矩阵题] → opens ScaleApplyDialog
  → User selects questions → applyScaleToQuestions(ids, scale)
```

## UI Design

### ScaleEditDialog Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  编辑量表                                                  [×]  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┬─────────────────────────────────────┐ │
│  │                     │                                     │ │
│  │ 预设模板 [▼]         │    ┌───────────────────────────┐   │ │
│  │                     │    │        实时预览            │   │ │
│  │ 快速生成器           │    │                           │   │ │
│  │ ┌─────────────────┐ │    │   ○  ○  ○  ○  ○         │   │ │
│  │ │起止值: 1 至 7   │ │    │  不同意 中立 同意        │   │ │
│  │ │起止标签: [输入] │ │    │                           │   │ │
│  │ │          [输入] │ │    │    1    2    3    4    5  │   │ │
│  │ └─────────────────┘ │    └───────────────────────────┘   │ │
│  │       [生成刻度]     │                                     │ │
│  │                     │    显示选项:                         │ │
│  │ 刻度点编辑:         │    ☑ 显示标签  ☑ 显示分值          │ │
│  │ ┌─────────────────┐ │                                     │ │
│  │ │值 │标签          │ │                                     │ │
│  │ │1  │非常不同意    │ │                                     │ │
│  │ │2  │不同意        │ │                                     │ │
│  │ │3  │中立          │ │                                     │ │
│  │ │4  │同意          │ │                                     │ │
│  │ │5  │非常同意      │ │                                     │ │
│  │ └─────────────────┘ │                                     │ │
│  │                     │                                     │ │
│  └─────────────────────┴─────────────────────────────────────┘ │
│                                                                 │
│  [取消] [保存] [应用到所有矩阵题]                              │
└─────────────────────────────────────────────────────────────────┘
```

### ScaleApplyDialog Layout

```
┌────────────────────────────────────────────────────┐
│ 应用量表到其他矩阵题                          [×]  │
├────────────────────────────────────────────────────┤
│                                                     │
│  当前量表: 5点Likert量表 (5点)                     │
│  1=非常不同意 → 5=非常同意                          │
│                                                     │
│  选择要应用此量表的问题:                            │
│                                                     │
│  ☑ Q2: 产品满意度评价                              │
│     当前: 7点Likert量表                            │
│                                                     │
│  ☑ Q5: 服务质量评估                                │
│     当前: 1-10评分                                  │
│                                                     │
│  ☐ Q8: 员工反馈调查                                │
│     当前: 5点Likert量表 (相同)                     │
│                                                     │
│  ─────────────────────────────────────────────    │
│                                                     │
│  已选择 2 个问题 (共 3 个矩阵题)                   │
│                                                     │
│  ℹ️ 将覆盖这些问题原有的量表配置                    │
│                                                     │
│                    [取消] [确认应用]               │
└────────────────────────────────────────────────────┘
```

## Smart Interpolation

### Pattern Matching

The system recognizes common Chinese semantic patterns:

```typescript
interface InterpolationPattern {
  start: string[];
  end: string[];
  intermediates: string[];
}

const PATTERNS: InterpolationPattern[] = [
  {
    start: ['非常不同意', '很不同意', '不同意'],
    end: ['非常同意', '很同意', '同意'],
    intermediates: ['不同意', '中立', '同意']
  },
  {
    start: ['非常不满意', '很不满意', '不满意'],
    end: ['非常满意', '很满意', '满意'],
    intermediates: ['不满意', '一般', '满意']
  },
  {
    start: ['从不', '从来没有'],
    end: ['总是', '一直都是'],
    intermediates: ['很少', '有时', '经常']
  },
  {
    start: ['非常差', '很差'],
    end: ['非常好', '很好'],
    intermediates: ['差', '一般', '好']
  }
];
```

### Interpolation Examples

| Points | Start | End | Result |
|--------|-------|-----|--------|
| 5 | 非常不同意 | 非常同意 | 非常不同意, 不同意, 中立, 同意, 非常同意 |
| 7 | 非常不同意 | 非常同意 | 非常不同意, 不同意, 有点不同意, 中立, 有点同意, 同意, 非常同意 |
| 5 | 从不 | 总是 | 从不, 很少, 有时, 经常, 总是 |
| 10 | 1 | 10 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 (numeric fallback) |

## File Structure

### New Files

```
frontend/src/
├── components/
│   └── editor/
│       ├── ScaleEditDialog.tsx          # Main scale editor dialog
│       ├── ScaleApplyDialog.tsx         # Selective application dialog
│       └── scale/
│           ├── PresetSelector.tsx       # Dropdown preset selector
│           ├── QuickGenerator.tsx       # Start/end input form
│           ├── PointEditor.tsx          # Editable points table
│           └── ScalePreview.tsx         # Live preview component
├── lib/
│   ├── scalePresets.ts                  # Preset definitions
│   └── scaleInterpolator.ts             # Smart interpolation logic
└── types/
    └── scale.ts                          # Scale-related type extensions (if needed)
```

### Modified Files

```
frontend/src/
├── components/
│   ├── question/
│   │   └── MatrixCard.tsx               # Wire up onEditScale callback
│   └── editor/
│       └── ConfigurationPanel.tsx       # Wire up onEditScale callback
├── contexts/
│   └── SurveyEditorContext.tsx          # Add applyScaleToQuestions method
└── components/
    └── editor/
        └── index.ts                      # Export new dialogs
```

## Implementation Sequence

### Phase 3.1: Foundation
**Priority: High | Risk: Low**

1. Create `lib/scalePresets.ts` with preset definitions
2. Create `lib/scaleInterpolator.ts` with interpolation logic
3. Add unit tests for interpolation
4. **Deliverable**: Working utility functions with test coverage

### Phase 3.2: Core Dialog
**Priority: High | Risk: Medium**

1. Create `ScaleEditDialog.tsx` with preset selector
2. Create `scale/PresetSelector.tsx` component
3. Create `scale/PointEditor.tsx` for manual editing
4. Wire up live updates to MatrixCard
5. Test with single matrix question
6. **Deliverable**: Functional scale editor with presets and manual editing

### Phase 3.3: Quick Generator
**Priority: Medium | Risk: Medium**

1. Create `scale/QuickGenerator.tsx` component
2. Integrate with interpolation logic
3. Test various start/end combinations
4. **Deliverable**: Working quick generator with smart interpolation

### Phase 3.4: Batch Application
**Priority: Medium | Risk: Low**

1. Add `applyScaleToQuestions` to SurveyEditorContext
2. Create `ScaleApplyDialog.tsx`
3. Test with multiple matrix questions
4. **Deliverable**: Selective batch application dialog

### Phase 3.5: Integration & Polish
**Priority: Low | Risk: Low**

1. Wire up ConfigurationPanel trigger
2. Add keyboard shortcuts (Escape, Cmd+Enter)
3. Add success notifications
4. Edge case testing
5. **Deliverable**: Complete Phase 3 feature with polish

## Context Additions

### SurveyEditorContext

```typescript
interface SurveyEditorContextType {
  // ... existing methods ...

  // New method for Phase 3
  applyScaleToQuestions: (questionIds: string[], scale: ScaleConfig) => void;
}

// Implementation
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

## Testing Strategy

### Unit Tests
- `scaleInterpolator.ts`: Test all patterns and edge cases
- `scalePresets.ts`: Verify preset definitions

### Integration Tests
- ScaleEditDialog: Test preset selection, manual editing, live updates
- QuickGenerator: Test interpolation with various inputs
- ScaleApplyDialog: Test multi-question selection

### Edge Cases
- Empty scale (0 points)
- Single-point scale
- Very large scales (20+ points)
- Applying scale to questions with identical scales
- Cancel operation after making changes

## Success Criteria

- ✅ Users can select from 5 preset templates
- ✅ Users can generate scales using quick generator with smart interpolation
- ✅ Users can manually edit any scale point
- ✅ Changes reflect in real-time on MatrixCard
- ✅ Users can apply scale to multiple matrix questions selectively
- ✅ All existing Phase 1 & 2 functionality remains intact
- ✅ No performance regression with large surveys

## Related Documents

- [Main Design Document](./2026-02-02-questionnaire-editor-design.md) - Lines 208-228
- [Phase 2 Implementation](./2026-02-02-questionnaire-editor-phase2.md)

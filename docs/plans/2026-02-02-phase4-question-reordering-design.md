# Phase 4: Question Reordering Feature - Design Document

**Date**: 2026-02-02
**Status**: Design Complete, Ready for Implementation
**Phase**: 4 - Question Reordering

---

## Overview

Phase 4 implements a number-based question reordering system to solve the precision problem with drag-and-drop in long surveys. Users can click question numbers to open a reorder dialog, select destination (specific position/start/end), and move single or multiple questions.

**Key Goals:**
- Provide precise reordering for surveys with 10+ questions
- Support both single and batch question movement
- Maintain visual clarity between "editing" and "batch selected" states
- Integrate seamlessly with existing SurveyEditorContext methods

---

## Architecture

### Component Structure

```
frontend/src/components/question/
├── QuestionCard.tsx           # MODIFY: Add checkbox + clickable number
├── QuestionReorderDialog.tsx  # NEW: Reorder dialog component
└── index.ts                   # UPDATE: Export new component
```

### State Management

**Existing Context Methods (no changes needed):**
```typescript
// From SurveyEditorContext
moveQuestion(id: string, targetOrder: number): void
moveSelectedQuestions(targetOrder: number): void
selectedQuestionIds: string[]
toggleQuestionSelection(id: string): void
```

**New State in SurveyEditor:**
```typescript
[reorderDialogState, setReorderDialogState] = useState<{
  isOpen: boolean;
  questionId: string | null;
}>
```

### Design Decisions

1. **Dialog-first approach**: Click question number → dialog appears → choose action
2. **Batch-aware UI**: Dialog adapts message based on `selectedQuestionIds.length`
3. **Visual hierarchy**:
   - Blue border (`border-blue-500`): Currently editing
   - Green border (`border-green-500`): Batch-selected for movement
4. **Progressive disclosure**: Input field dims/disables for "move to start/end" options

---

## Component Design

### QuestionReorderDialog

**Props Interface:**
```typescript
interface QuestionReorderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  questionOrder: number;           // Current position (0-indexed)
  totalQuestions: number;
  selectedCount: number;
  onMove: (targetOrder: number) => void;
}
```

**Internal State:**
```typescript
[mode, setMode] = useState<'position' | 'start' | 'end'>('position')
[targetPosition, setTargetPosition] = useState(questionOrder + 1)
[inputError, setInputError] = useState<string>('')
```

**Dialog Layout:**
```
┌─────────────────────────────────────┐
│ 移动问题 / 批量移动问题              │
├─────────────────────────────────────┤
│ 将 "第 3 题" 移动到：                │
│                                     │
│ ○ 移动到第 [   ] 题 (1-10)          │
│ ○ 移动到问卷开头                     │
│ ○ 移动到问卷末尾                     │
│                                     ││ [错误提示文字 或 位置范围提示]      │
│                                     │
│           [取消] [确认移动]          │
└─────────────────────────────────────┘
```

**Key Behaviors:**
1. On mount: Pre-fill input with current position (1-indexed)
2. On radio change: Update mode, disable/enable input
3. On input change: Validate real-time, show error, clamp to [1, totalQuestions]
4. On confirm: Call `onMove(targetOrder - 1)` (convert to 0-indexed), close dialog
5. On cancel/close: Reset state, close dialog

### QuestionCard Modifications

**New Props:**
```typescript
interface QuestionCardProps {
  // ... existing props
  isBatchSelected: boolean;
  onBatchToggle: () => void;
  onReorderClick: () => void;
}
```

**Header Changes:**
```
Before: [collapse] [{order}] [title] [duplicate] [delete]
After:  [collapse] [checkbox] [{order}] [title] [duplicate] [delete]
```

**Visual States:**

| State | Checkbox | Card Border | Question Number |
|-------|----------|-------------|-----------------|
| Normal | Unchecked, gray | border-gray-200 | Text only |
| Batch-selected | Checked, green | border-green-500 | Clickable, hover effect |
| Editing | Reflects selection | border-blue-500 | Clickable |
| Both | Checked | border-blue-500 + "已选" badge | Clickable |

**Question Number Button:**
```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    onReorderClick();
  }}
  className="text-sm font-medium text-gray-500 hover:text-blue-600
             hover:bg-blue-50 px-2 py-1 rounded transition-all cursor-pointer"
  title="点击移动此题"
>
  [{question.order}]
</button>
```

**Checkbox Component:**
```tsx
<input
  type="checkbox"
  checked={isBatchSelected}
  onChange={(e) => {
    e.stopPropagation();
    onBatchToggle();
  }}
  className="w-4 h-4 text-green-600 rounded border-gray-300
             focus:ring-green-500 cursor-pointer"
  onClick={(e) => e.stopPropagation()}
/>
```

---

## Data Flow

### Integration in SurveyEditor

```typescript
// In SurveyEditor component
const { survey, moveQuestion, moveSelectedQuestions,
        selectedQuestionIds, toggleQuestionSelection } = useSurveyEditor();

const [reorderDialog, setReorderDialog] = useState({
  isOpen: false,
  questionId: null as string | null,
});

// In QuestionCard props
<QuestionCard
  // ... existing props
  isBatchSelected={selectedQuestionIds.includes(question.id)}
  onBatchToggle={() => toggleQuestionSelection(question.id)}
  onReorderClick={() => setReorderDialog({
    isOpen: true,
    questionId: question.id
  })}
/>

// In QuestionReorderDialog props
<QuestionReorderDialog
  isOpen={reorderDialog.isOpen}
  onClose={() => setReorderDialog({ isOpen: false, questionId: null })}
  questionId={reorderDialog.questionId}
  questionOrder={clickedQuestion.order}
  totalQuestions={survey.questions.length}
  selectedCount={selectedQuestionIds.length}
  onMove={(targetOrder) => {
    if (selectedQuestionIds.length > 0) {
      moveSelectedQuestions(targetOrder);
    } else {
      moveQuestion(reorderDialog.questionId, targetOrder);
    }
    setReorderDialog({ isOpen: false, questionId: null });
  }}
/>
```

### User Flows

**Single Question Move:**
1. User clicks "[3]" on question card
2. Dialog opens: "移动问题 - 将 '第 3 题' 移动到："
3. User selects "移动到开头"
4. Click "确认移动"
5. `moveQuestion(q3.id, 0)` called
6. Question moves to position 0, dialog closes

**Batch Move:**
1. User clicks checkboxes on Q3, Q5, Q7 (green borders appear)
2. User clicks "[5]" on Q5
3. Dialog opens: "批量移动问题 - 将 3 个问题 (第 3, 5, 7 题) 移动到："
4. User types "1" in position field
5. Click "确认移动"
6. `moveSelectedQuestions(0)` called
7. Q3, Q5, Q7 move to positions 0, 1, 2, selection cleared
8. Dialog closes

---

## Error Handling & Edge Cases

### Input Validation

| Invalid Input | Error Message | Action |
|---------------|---------------|--------|
| Empty | "请输入位置数字" | Disable confirm |
| Out of range | "位置必须在 1-{total} 之间" | Disable confirm |
| Non-numeric | "请输入有效的数字" | Disable confirm |
| Same position | "已经是该位置" (warning) | Enable confirm |

### Edge Cases

1. **Last question → end**: No-op, confirm succeeds
2. **First question → start**: No-op, confirm succeeds
3. **All questions selected**: Treat as bulk move, preserve order
4. **Position 0 input**: Clamp to 1 (user-facing), internally use 0
5. **Position > total**: Clamp to total

### Error Recovery

- Invalid input: Show error, keep dialog open
- Move failure: Log error, show toast "移动失败，请重试"
- Context throws: Catch and display user-friendly error

---

## Testing Strategy

### Unit Tests (Vitest)

**QuestionReorderDialog.test.tsx:**
- Renders with single/multiple selection
- Validates input and shows errors
- Disables confirm for invalid input
- Calls onMove with correct 0-indexed targetOrder
- Resets state on cancel/close

**QuestionCard.test.tsx:**
- Checkbox toggles batch selection
- Number click triggers onReorderClick
- Visual states change correctly
- Event propagation stopped

### Integration Tests

- SurveyEditor opens dialog on number click
- Single move calls context.moveQuestion
- Batch move calls context.moveSelectedQuestions
- Selection persists after move

### Manual Testing Checklist

- [ ] Single question moves to specific position
- [ ] Single question moves to start/end
- [ ] Multiple questions moved together
- [ ] Input validation prevents invalid moves
- [ ] Visual feedback shows selection
- [ ] ESC key closes dialog
- [ ] Click outside closes dialog

---

## Accessibility

- **Dialog**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` for title
- **Radio inputs**: Proper `<label>` associations
- **Keyboard navigation**:
  - Tab through options
  - Enter to confirm
  - Escape to close
  - Focus trap within dialog
- **Screen readers**: Announce "批量移动问题" vs "移动问题"

---

## Tailwind CSS Classes

**Dialog:**
```tsx
className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
// Content:
className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
```

**Visual States:**
```tsx
// Batch-selected
border-green-500

// Editing
border-blue-500

// Checkbox
className="w-4 h-4 text-green-600 rounded focus:ring-green-500"

// Question number button
className="text-sm font-medium text-gray-500 hover:text-blue-600
           hover:bg-blue-50 px-2 py-1 rounded transition-all cursor-pointer"
```

---

## Implementation Notes

1. **Index conversion**: Dialog shows 1-indexed (user-friendly), calls `onMove` with 0-indexed (data layer)
2. **Event propagation**: Use `e.stopPropagation()` on number click and checkbox to avoid card selection
3. **Batch selection check**: `selectedQuestionIds.length > 0` determines which context method to call
4. **Input state sync**: When "start" selected, input shows "1" but disabled; "end" shows total count

---

## Success Criteria

Phase 4 is complete when:
- ✅ Clicking question number opens reorder dialog
- ✅ Can input number to move to specific position
- ✅ Can select "move to start/end"
- ✅ Checkboxes enable batch selection and movement
- ✅ Selected questions show visual feedback (green border)
- ✅ Move operations correctly update question order
- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ Production build succeeds

---

## Next Steps

1. ✅ Design document complete
2. ⏳ Create git worktree for isolated development
3. ⏳ Create detailed implementation plan (writing-plans skill)
4. ⏳ Execute implementation (subagent-driven-development skill)

---

**Document Status**: Ready for implementation planning
**Related Documents**:
- `CONTEXT-FOR-PHASE4.md` - Project context and Phase 3 summary
- `2026-02-02-questionnaire-editor-design.md` - Overall system design

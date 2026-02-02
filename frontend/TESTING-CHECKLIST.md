# Phase 4 Question Reordering - Testing Checklist

## Automated Tests
- [x] All unit tests pass (85 tests)
- [x] TypeScript compilation succeeds
- [x] Production build succeeds

## Manual Testing Steps

### Single Question Move
1. Open browser to http://localhost:5173
2. Click on any question number "[3]"
3. Dialog should open with title "移动问题"
4. Dialog should show "将 '第 3 题' 移动到："
5. Select "移动到开头" radio option
6. Click "确认移动" button
7. Question should move to position 0 (first)
8. Order numbers should update correctly
9. Dialog should close

### Batch Move - Basic
1. Click checkboxes on 3 questions (e.g., Q3, Q5, Q7)
2. Verify green borders appear on selected questions
3. Click number on any selected question (e.g., "[5]")
4. Dialog should open with title "批量移动问题"
5. Dialog should show "将 3 个问题 移动到："
6. Type "1" in position field
7. Click "确认移动"
8. All 3 questions should move to positions 0, 1, 2
9. Green borders should disappear
10. Order numbers should update correctly

### Input Validation
1. Open dialog (click question number)
2. Type "999" in position field
3. Error message should appear: "位置必须在 1-{total} 之间"
4. "确认移动" button should be disabled
5. Type valid number like "5"
6. Error should disappear
7. Button should be enabled

### Move to Specific Position
1. Click question number on Q5
2. Type "2" in position field
3. Click "确认移动"
4. Q5 should move to position 1 (0-indexed)
5. Should appear as "第 2 题"

### Move to End
1. Click question number on Q3
2. Select "移动到问卷末尾"
3. Click "确认移动"
4. Q3 should move to last position

### Edge Cases
- [ ] Move first question to start (no position change)
- [ ] Move last question to end (no position change)
- [ ] Select all questions and move
- [ ] Clear input field (should show error)

### Visual States
- [ ] Normal question: gray border
- [ ] Click to edit: blue border
- [ ] Click checkbox: green border
- [ ] Both editing and selected: blue border + "已选" badge
- [ ] Question number hover effect

### Accessibility
- [ ] Tab through dialog elements
- [ ] Focus visible on interactive elements
- [ ] Checkbox can be activated with keyboard
- [ ] Buttons have proper labels

### Batch Move Index Verification (CRITICAL)
1. Create 10 questions
2. Select questions 3, 5, 7 (1-indexed: Q3, Q5, Q7)
3. Click reorder on Q5
4. Choose "移动到第 2 题" (position 1, 0-indexed)
5. **Expected**: Q3, Q5, Q7 should move to positions 1, 2, 3
6. **Actual**: Verify where they end up
7. **Note**: If positions are wrong, this confirms the index calculation bug

## Known Issues to Verify
- Batch move index calculation (see code review notes)
- Empty input validation
- Dialog state reset

## Test Results Summary
- **Automated Tests**: 85/85 passing
- **TypeScript**: No errors
- **Build**: Successful
- **Manual Testing**: Pending execution in browser

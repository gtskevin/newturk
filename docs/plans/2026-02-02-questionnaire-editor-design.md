# Questionnaire Editor Design

**Project:** Silicon Sample Simulator
**Date:** 2026-02-02
**Status:** Approved

## Overview

This document describes the redesign of the questionnaire editor to provide a professional survey creation experience similar to Wenjuanxing and Qualtrics. The editor will support four question types (single choice, multiple choice, text input, matrix scale), enable batch operations for efficient entry, and offer preset scale templates to accelerate configuration.

**Goals:**
- Enable researchers to create professional surveys efficiently
- Support batch entry of questions and options
- Provide preset templates for common scales (Likert, satisfaction, etc.)
- Deliver immediate visual feedback with WYSIWYG editing
- Maintain clean, intuitive interface for non-technical users

## Architecture

### Layout

The editor uses a three-column layout:

**Left sidebar (15%)** - Question type toolbar
- Four type icons: single choice, multiple choice, text input, matrix scale
- Click to insert new question below current selection

**Center (60%)** - Question list
- Each question displays as a card showing final appearance
- Question number clickable for reordering
- Inline editing for question text

**Right sidebar (25%)** - Configuration panel
- Shows only when question selected
- Groups settings: basic info, options/config, batch operations, advanced
- Provides access to batch input and scale templates

This layout separates global actions (top bar), question structure (center), and detailed configuration (right). Researchers see the survey as participants will while maintaining full control.

### Question Types

**1. Single Choice** - One answer from multiple options
- Radio button interface
- Supports vertical/horizontal/two-column layouts
- Optional randomization of option order

**2. Multiple Choice** - Multiple answers from options
- Checkbox interface
- Same layout options as single choice
- Optional randomization

**3. Text Input** - Open-ended responses
- Text input or textarea
- Configurable max length
- Optional validation (regex, min/max for numbers)

**4. Matrix Scale** - Multiple items rated on same scale
- Multiple statement rows
- Shared scale configuration
- Horizontal or vertical orientation

## Question Cards

Each question appears as a card displaying the final participant view:

```
┌─────────────────────────────────────────┐
│ [3] ▼                    [复制][删除]   │
│ 请问您的年龄范围是？                    │
│                                          │
│ ○ 18岁以下                               │
│ ○ 18-25岁                                │
│ ○ 26-35岁                                │
│ ○ 36-45岁                                │
│ ○ 46岁以上                               │
│                                          │
│ [+ 添加选项] [批量编辑]                  │
└─────────────────────────────────────────┘
```

**Card features:**
- Question number clickable to open reorder dialog
- Collapse button (▼) to hide options, showing only question text
- Hover reveals action buttons (copy, delete)
- Click card to select and show configuration panel
- Inline text editing on question title

**Matrix card example:**

```
┌─────────────────────────────────────────┐
│ [2] ▼                                    │
│ 请对以下产品的各个方面进行评价：        │
│                                          │
│              [1=非常不同意] [7=非常同意] │
│                                          │
│ 产品质量    ○---○---○---○---○---○---○   │
│ 外观设计    ○---○---○---○---○---○---○   │
│ 性价比      ○---○---○---○---○---○---○   │
│ 易用性      ○---○---○---○---○---○---○   │
│                                          │
│ [+ 添加评价项] [批量添加] [修改量表]     │
└─────────────────────────────────────────┘
```

## Batch Entry

Researchers often create surveys from existing materials (Word docs, Excel files). Batch entry enables rapid transfer.

### Question/Option Batch Input

Triggered by "[批量添加评价项]" on matrix questions or "[批量编辑]" on choice questions.

**Dialog:**

```
┌─────────────────────────────────────┐
│ 批量添加评价项                      │
├─────────────────────────────────────┤
│ 请粘贴题目列表（每行一个）：        │
│ ┌───────────────────────────────┐  │
│ │ 产品的质量                     │  │
│ │ 产品的外观设计                 │  │
│ │ 产品的性价比                   │  │
│ │ 产品的易用性                   │  │
│ │                               │  │
│ └───────────────────────────────┘  │
│                                     │
│ ☑ 覆盖现有项目                      │
│ □ 追加到现有项目后面                │
│                                     │
│        [取消] [预览] [确认添加]     │
└─────────────────────────────────────┘
```

**Parsing rules:**
- Each line becomes one item/option
- Trim leading/trailing whitespace
- Skip empty lines
- Support Excel cell copy (newline handling)
- If semicolons or commas present, ask user about delimiter

**Preview step:**
After parsing, show confirmation before applying:

```
┌─────────────────────────────────────┐
│ 预览 - 将添加以下4个评价项：        │
├─────────────────────────────────────┤
│ 1. 产品的质量                       │
│ 2. 产品的外观设计                   │
│ 3. 产品的性价比                     │
│ 4. 产品的易用性                     │
│                                     │
│ ☑ 追加模式（保留现有项目）          │
│                                     │
│     [返回修改] [确认添加]           │
└─────────────────────────────────────┘
```

## Scale Configuration

Matrix questions use shared scales. Preset templates accelerate setup while manual customization supports specialized needs.

### Scale Settings Dialog

Access via "[修改量表]" button or configuration panel.

```
┌─────────────────────────────────────────┐
│ 量表设置                                │
├─────────────────────────────────────────┤
│ 预设模板：                              │
│ ┌─────────────────────────────────┐    │
│ │ 7点Likert量表                  │  ▼│
│ ├─────────────────────────────────┤    │
│ │ 5点Likert量表                   │    │
│ │ 1-10评分                        │    │
│ │ 满意度5级                       │    │
│ │ 频率5级                         │    │
│ │ 同意度5级                       │    │
│ │ 自定义...                       │    │
│ └─────────────────────────────────┘    │
│                                         │
│ ────── 或 ──────                       │
│                                         │
│ 快速生成：                              │
│ 从 [1] 到 [7]                          │
│ 标签：[非常不同意] 到 [非常同意]       │
│                                         │
│ 当前量表预览：                          │
│ ┌─────────────────────────────────┐    │
│ │ 1 = 非常不同意                  │    │
│ │ 2 = 不同意                      │    │
│ │ 3 = 有点不同意                  │    │
│ │ 4 = 中立                       │    │
│ │ 5 = 有点同意                    │    │
│ │ 6 = 同意                        │    │
│ │ 7 = 非常同意                    │    │
│ └─────────────────────────────────┘    │
│                                         │
│ □ 显示分值  ☑ 显示标签  ☑ 必填        │
│                                         │
│      [取消] [保存] [应用到所有矩阵题]  │
└─────────────────────────────────────────┘
```

### Preset Templates

| Template | Options |
|----------|---------|
| 5点Likert量表 | 1=非常不同意, 2=不同意, 3=中立, 4=同意, 5=非常同意 |
| 7点Likert量表 | 1=非常不同意, 2=不同意, 3=有点不同意, 4=中立, 5=有点同意, 6=同意, 7=非常同意 |
| 1-10评分 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 |
| 满意度5级 | 非常不满意, 不满意, 一般, 满意, 非常满意 |
| 频率5级 | 从不, 很少, 有时, 经常, 总是 |

### Quick Generator

For custom scales without manual entry:

1. Enter start value (e.g., 1) and end value (e.g., 7)
2. Enter start label (e.g., "非常不同意") and end label (e.g., "非常同意")
3. System generates intermediate options automatically
4. Real-time preview below shows result

**"Apply to all matrix questions"** button copies scale to all matrix questions in survey, eliminating repetitive setup.

## Question Reordering

Number-based reordering provides precision for long surveys where drag-and-drop becomes cumbersome.

### Reorder Dialog

Click question number to open:

```
┌─────────────────────────────────────┐
│ 移动问题                             │
├─────────────────────────────────────┤
│ 将"第 3 题"移动到：                 │
│ ○ 移动到第 [ 1 ] 题                 │
│ ○ 移动到问卷开头                    │
│ ○ 移动到问卷末尾                    │
│                                     │
│ ☑ 选中此题（可批量操作多题）        │
│                                     │
│           [取消] [确认移动]         │
└─────────────────────────────────────┘
```

### Batch Operations

1. Check "选中此题" on multiple questions
2. Selected questions show highlighted borders
3. Click any selected question's number
4. Choose "move all N questions to position X"
5. Selected questions move as block, preserving internal order

### Keyboard Shortcuts (Optional)

- `Ctrl + Home` - Move to start
- `Ctrl + End` - Move to end
- `Ctrl + ↑/↓` - Move up/down one position
- `Ctrl + Shift + ↑/↓` - Select adjacent questions

## Configuration Panel

Right sidebar shows detailed settings for selected question.

**Structure:**

```
┌─────────────────────────────────┐
│ 问题配置                         │
├─────────────────────────────────┤
│ ┌─ 基本信息 ────────────────┐   │
│ │ 题目类型：单选题           │   │
│ │ 问题ID：Q_20250202_003     │   │
│ │ 题干文字：[可编辑文本框]   │   │
│ │ 题目说明：[可选]           │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─ 选项配置 ────────────────┐   │
│ │ ▼ 展开选项配置            │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─ 批量操作 ────────────────┐   │
│ │ [批量添加选项...]          │   │
│ │ [从现有题目复制选项]       │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─ 高级设置 ────────────────┐   │
│ │ ▼ 展开高级设置            │   │
│ └─────────────────────────────┘   │
│                                     │
│ [保存更改] [取消]                  │
└─────────────────────────────────┘
```

**Key features:**
- Collapsible sections avoid overwhelming users
- Inline edits to question title auto-save
- Configuration changes reflect immediately in question card
- "Copy options from existing question" saves time

## Data Model

### TypeScript Types

```typescript
// Base question interface
interface BaseQuestion {
  id: string;
  type: 'single' | 'multiple' | 'text' | 'matrix';
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

// Choice question (single/multiple)
interface ChoiceQuestion extends BaseQuestion {
  type: 'single' | 'multiple';
  options: ChoiceOption[];
  layout?: 'vertical' | 'horizontal' | 'two-column';
  randomize?: boolean;
}

interface ChoiceOption {
  id: string;
  label: string;
  value: string;
  order: number;
}

// Matrix question
interface MatrixQuestion extends BaseQuestion {
  type: 'matrix';
  items: MatrixItem[];
  scale: ScaleConfig;
  layout?: 'horizontal' | 'vertical';
}

interface MatrixItem {
  id: string;
  label: string;
  order: number;
}

interface ScaleConfig {
  type: 'preset' | 'custom';
  presetName?: string;
  points: ScalePoint[];
  showValue?: boolean;
  showLabel?: boolean;
}

interface ScalePoint {
  value: number | string;
  label: string;
}

// Text question
interface TextQuestion extends BaseQuestion {
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

// Survey structure
interface Survey {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}
```

### State Management

Use React Context + hooks for centralized state:

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
  batchAddOptions: (questionId: string, optionsText: string, mode: 'append' | 'replace') => void;

  // Matrix operations
  batchAddMatrixItems: (questionId: string, itemsText: string, mode: 'append' | 'replace') => void;
  updateScale: (questionId: string, scale: ScaleConfig) => void;

  // Batch operations
  selectedQuestionIds: string[];
  toggleQuestionSelection: (id: string) => void;
  moveSelectedQuestions: (targetOrder: number) => void;

  // Persistence
  saveSurvey: () => Promise<void>;
}
```

## User Experience

### Auto-Save

- Debounced save 2 seconds after last change
- Show "保存中..." during save
- Show "上次保存：HH:MM" after success
- Toast notification on save
- Manual save with Ctrl+S always available

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+S | Save |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+N | New question |
| Delete | Delete selected |
| Ctrl+D | Duplicate |
| Ctrl+↑↓ | Move question |
| Esc | Cancel/close dialog |
| Enter | Confirm inline edit |

### Toast Notifications

Provide clear feedback for all actions:

- Success: "已添加5个新选项"
- Error: "保存失败，请检查网络连接"
- Warning: "此操作将清除未保存的更改"
- Info: "正在加载问卷模板..."

### Loading States

Use skeleton screens during data loading:

```css
.question-card-skeleton {
  animation: pulse 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
}
```

### Empty State

Guide new users when survey contains no questions:

```
┌─────────────────────────────────────────┐
│   📝 开始创建你的第一个问题             │
│   点击左侧工具栏的问题类型               │
│   或选择下方快速模板                     │
│                                         │
│   快速模板：                            │
│   ┌──────────┐ ┌──────────┐            │
│   │人口学问题│ │满意度调查│            │
│   └──────────┘ └──────────┘            │
└─────────────────────────────────────────┘
```

### Error Handling

- Error boundary catches component failures
- Offer "重新加载" and "从备份恢复" options
- Log errors to monitoring service
- Never lose user's work

### Mobile Responsiveness

- Stack columns vertically on small screens
- Move toolbar to bottom fixed position (thumb-friendly)
- Increase touch targets to minimum 44px
- Full-screen config panel on mobile

### Performance

- Virtual scrolling for surveys with 50+ questions
- Memoize option list rendering
- Debounce search/filter operations
- Lazy load configuration panels

## Implementation Phases

### Phase 1: Core Editor (Priority)

1. Three-column layout
2. Question cards for all 4 types
3. Inline text editing
4. Add/delete questions
5. Basic option editing
6. Save/load survey

### Phase 2: Batch Operations (High Value)

1. Batch input dialog for options
2. Batch input for matrix items
3. Preview and confirm flow
4. Smart parsing with delimiter detection

### Phase 3: Scale Configuration (High Value)

1. Scale settings dialog
2. Preset template dropdown
3. Quick generator
4. "Apply to all" button
5. Manual custom mode

### Phase 4: Reordering (Medium Value)

1. Number-based reorder dialog
2. Batch selection
3. Batch move operations
4. Keyboard shortcuts

### Phase 5: Polish (Optional)

1. Configuration panel refinements
2. Auto-save with debouncing
3. Keyboard shortcuts
4. Toast notifications
5. Empty states
6. Loading skeletons
7. Error boundaries
8. Mobile responsive design

## Success Metrics

- **Efficiency:** Researchers create 10-question surveys in under 5 minutes
- **Batch entry:** Copy-paste 20 options from Excel in under 30 seconds
- **Scale setup:** Configure 7-point Likert scale in 2 clicks
- **Reordering:** Move question to position in 3 clicks (vs drag frustration)
- **Learning curve:** New users create first question without help text

## Notes

- This design prioritizes efficiency over extensive features
- Future phases may add conditional logic, question piping, advanced validation
- Template library (demographics, satisfaction scales) can extend quick-start options
- International support (Chinese/English) needs string extraction plan

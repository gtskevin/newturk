# Context for Phase 4 Development - Question Reordering

> **为新Claude Code会话准备的上下文文档**
>
> **日期**: 2026-02-02
>
> **当前状态**: Phase 3已完成并推送到main分支

---

## 项目概况

**项目名称**: newturk - 问卷编辑器 (Questionnaire Editor)
**仓库**: https://github.com/gtskevin/newturk
**本地路径**: `/Users/huangmingpeng/AIProjects/newturk`
**技术栈**: React 18 + TypeScript + Tailwind CSS + Vitest
**当前分支**: `main`

---

## 已完成的阶段

### ✅ Phase 1: 核心编辑器
- 单选题、多选题、文本题、矩阵题
- 三栏布局（问题列表、配置面板、预览）
- 基础CRUD操作

### ✅ Phase 2: 批量操作
- 批量输入对话框
- 智能解析选项/评价项
- 预览确认机制
- 键盘快捷键和成功通知

### ✅ Phase 3: 量表配置与预设模板（刚完成）
**提交**: da840b7
**日期**: 2026-02-02

**新增文件**:
```
frontend/src/lib/
├── scalePresets.ts              # 预设模板定义
├── scaleInterpolator.ts         # 智能插值逻辑
└── __tests__/
    ├── scalePresets.test.ts
    └── scaleInterpolator.test.ts

frontend/src/components/editor/scale/
├── PresetSelector.tsx           # 预设下拉选择
├── QuickGenerator.tsx           # 快速生成器
├── PointEditor.tsx              # 刻度点编辑表格
├── ScalePreview.tsx             # 实时预览
└── __tests__/
    ├── PresetSelector.test.tsx
    ├── QuickGenerator.test.tsx
    ├── PointEditor.test.tsx
    └── ScalePreview.test.tsx

frontend/src/components/editor/
├── ScaleEditDialog.tsx          # 主编辑对话框
└── ScaleApplyDialog.tsx         # 批量应用对话框
```

**核心功能**:
- 5个预设量表模板（5/7点Likert、1-10评分、满意度、频率）
- 智能中文标签插值
- 手动编辑刻度点
- 批量应用到所有矩阵题
- 实时预览
- ESC键关闭对话框

**测试覆盖**: 45个测试全部通过

---

## Phase 4: 问卷重排序（待开发）

### 设计文档位置
`docs/plans/2026-02-02-questionnaire-editor-design.md` 第229-266行

### 核心需求

**目标**: 实现基于数字的问卷重排序功能，解决长问卷中拖拽操作不精确的问题

**功能点**:

1. **数字式重排对话框**
   - 点击题号触发
   - 输入目标位置数字
   - 三个选项：移动到指定题号、移动到开头、移动到末尾
   - 支持选中多题批量移动

2. **批量选择与移动**
   - 复选框"选中此题"
   - 选中的题目显示高亮边框
   - 批量移动N个题目到位置X
   - 保持内部顺序

3. **键盘快捷键（可选）**
   - `Ctrl + Home` - 移动到开头
   - `Ctrl + End` - 移动到末尾
   - `Ctrl + ↑/↓` - 上下移动一位
   - `Ctrl + Shift + ↑/↓` - 选择相邻题目

### UI设计

**重排对话框**:
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

---

## 技术架构

### 类型定义
文件: `frontend/src/types/question.ts`

```typescript
// 已有的类型
- BaseQuestion
- SingleChoiceQuestion, MultipleChoiceQuestion, TextInputQuestion, MatrixQuestion
- Survey (包含 questions 数组)

// 需要使用的方法
- SurveyEditorContext:
  - moveQuestion(id, targetOrder) ✅ 已实现
  - selectedQuestionIds: string[] ✅ 已实现
  - toggleQuestionSelection(id) ✅ 已实现
  - moveSelectedQuestions(targetOrder) ✅ 已实现
```

### 相关组件
- `QuestionCard.tsx` - 题目卡片组件
- `MatrixCard.tsx` - 矩阵题卡片（已有点击题号的UI）
- `SingleChoiceCard.tsx` - 单选题卡片
- `MultipleChoiceCard.tsx` - 多选题卡片
- `TextInputCard.tsx` - 文本题卡片

### Context方法（已实现）
文件: `frontend/src/contexts/SurveyEditorContext.tsx`

```typescript
// ✅ 已有，可以直接使用
moveQuestion: (id: string, targetOrder: number) => void
moveSelectedQuestions: (targetOrder: number) => void
selectedQuestionIds: string[]
toggleQuestionSelection: (id: string) => void
```

---

## 实现建议

### 推荐工作流程

1. **使用brainstorming技能** 先探索设计细节
2. **使用writing-plans技能** 创建详细实现计划
3. **使用git-worktrees** 创建隔离工作区
4. **使用subagent-driven-development** 执行实现

### 文件结构（预期）

```
frontend/src/
├── components/
│   ├── question/
│   │   ├── QuestionCard.tsx           # 需要修改：添加题号点击事件
│   │   ├── QuestionReorderDialog.tsx  # 新建：重排对话框
│   │   └── index.ts
│   └── editor/
│       └── index.ts
├── lib/
│   └── questionReorder.ts             # 新建：重排逻辑（可选）
└── contexts/
    └── SurveyEditorContext.tsx        # 已有需要的方法
```

### 实现步骤（参考）

1. **创建 ReorderDialog 组件**
   - 输入目标位置数字
   - 单选/多选模式切换
   - 批量移动逻辑

2. **修改 QuestionCard 组件**
   - 题号改为可点击按钮
   - 点击事件触发对话框
   - 选中状态视觉反馈

3. **集成到 Context**
   - 使用已有的 `moveQuestion` 方法
   - 使用已有的 `moveSelectedQuestions` 方法

4. **测试与验证**
   - 单题移动测试
   - 批量移动测试
   - 边界情况测试

---

## Git状态

**当前分支**: main
**最新提交**: da840b7 - "docs: mark Phase 3 implementation as complete"
**远程仓库**: 已同步

**Phase 3提交历史**:
- 09099e2 - feat: add scale presets utility module
- 755996f - feat: add smart scale interpolation for Chinese labels
- 3234ffe - feat: add applyScaleToQuestions to context
- 852a485 - feat: add PresetSelector component
- ff3cc64 - feat: add PointEditor component
- 3549240 - feat: add QuickGenerator component
- 9ce0749 - feat: add ScalePreview component
- e4fb689 - feat: add ScaleEditDialog component
- 69c544d - feat: add ScaleApplyDialog component
- f84ffd0 - polish: add keyboard shortcuts and success notifications
- da840b7 - docs: mark Phase 3 implementation as complete

---

## 开发环境

### 安装的依赖
```json
{
  "@testing-library/react": "^0.16.1",
  "@testing-library/jest-dom": "^6.6.3",
  "@testing-library/user-event": "^14.5.2",
  "vitest": "^3.2.4"
}
```

### 启动开发服务器
```bash
cd frontend
npm run dev  # 运行在 http://localhost:5173 或 5174
```

### 运行测试
```bash
cd frontend
npm test -- --run     # 运行所有测试
npm test -- watch      # 监视模式
```

### 构建生产版本
```bash
cd frontend
npm run build         # 构建到 dist/
```

---

## 关键代码参考

### QuestionCard 题号部分
参考 `MatrixCard.tsx` 的实现方式，题号应该是一个可点击的按钮。

### 移动逻辑示例
```typescript
// Context 已有方法
const moveQuestion = (id: string, targetOrder: number) => {
  setSurvey(prev => {
    const questions = [...prev.questions];
    const questionIndex = questions.findIndex(q => q.id === id);
    if (questionIndex === -1) return prev;

    const [question] = questions.splice(questionIndex, 1);
    questions.splice(targetOrder, 0, question);

    questions.forEach((q, i) => q.order = i);
    return { ...prev, questions };
  });
};
```

---

## 设计文档引用

**主设计文档**: `docs/plans/2026-02-02-questionnaire-editor-design.md`

**Phase 3 实现计划**: `docs/plans/2026-02-02-phase3-scale-config-implementation.md`

**Phase 3 设计文档**: `docs/plans/2026-02-02-questionnaire-editor-phase3-design.md`

---

## 快速启动新会话

在新Claude Code会话中，依次使用以下技能：

1. **读取本文档**
   ```
   Read: /Users/huangmingpeng/AIProjects/newturk/docs/plans/CONTEXT-FOR-PHASE4.md
   ```

2. **使用 brainstorming 技能** 探索Phase 4设计细节
   ```
   Skill: superpowers:brainstorming
   ```

3. **使用 writing-plans 技能** 创建实现计划
   ```
   Skill: superpowers:writing-plans
   ```

4. **使用 git-worktrees 技能** 创建隔离工作区
   ```
   Skill: superpowers:using-git-worktrees
   ```

5. **使用 subagent-driven-development 技能** 执行实现
   ```
   Skill: superpowers:subagent-driven-development
   ```

---

## 重要注意事项

1. **Context方法已实现**: 不要重新实现 `moveQuestion` 和 `moveSelectedQuestions`，直接使用
2. **保持UI一致性**: 参考现有组件的样式（Tailwind CSS类名）
3. **TDD原则**: 先写测试，再实现功能
4. **频繁提交**: 每完成一个小功能就提交
5. **测试覆盖**: 确保新功能有对应的测试

---

## 成功标准

Phase 4完成的标准：
- ✅ 点击题号打开重排对话框
- ✅ 可以输入数字移动到指定位置
- ✅ 可以选择移动到开头/末尾
- ✅ 支持选中多题批量移动
- ✅ 选中的题目有视觉反馈
- ✅ 移动后题目顺序正确更新
- ✅ 所有测试通过
- ✅ 无TypeScript编译错误
- ✅ 生产构建成功

---

**准备就绪！可以开始Phase 4开发！**

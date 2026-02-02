import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Save, ArrowLeft, Eye, Play } from 'lucide-react';
import { SurveyEditorProvider, useSurveyEditor } from '../contexts/SurveyEditorContext';
import { QuestionToolbar, ConfigurationPanel } from '../components/editor';
import {
  SingleChoiceCard,
  MultipleChoiceCard,
  TextInputCard,
  MatrixCard,
} from '../components/question';
import QuestionReorderDialog from '../components/question/QuestionReorderDialog';
import { Question } from '../types/question';
import api from '../api/client';

function QuestionnaireEditorContent() {
  const { id } = useParams<{ id: string }>();
  const {
    survey,
    selectedQuestionId,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    selectQuestion,
    addOption,
    updateOption,
    deleteOption,
    addMatrixItem,
    moveQuestion,
    moveSelectedQuestions,
    selectedQuestionIds,
    toggleQuestionSelection,
  } = useSurveyEditor();

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [reorderDialog, setReorderDialog] = useState<{
    isOpen: boolean;
    questionId: string | null;
  }>({
    isOpen: false,
    questionId: null,
  });

  // Load experiment
  useEffect(() => {
    if (id) {
      loadExperiment(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadExperiment = async (experimentId: string) => {
    try {
      const response = await api.get(`/api/v1/experiments/${experimentId}`);
      const experiment = response.data;

      // Convert experiment to survey format
      // Update survey in context (this would need to be added to context)
      console.log('Loaded experiment:', experiment);
    } catch (error) {
      console.error('Failed to load experiment:', error);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);
    try {
      await api.put(`/api/v1/experiments/${id}`, {
        experiment_config: {
          questions: survey.questions,
        },
      });
      setLastSaved(new Date());
      // Show success toast
    } catch (error) {
      console.error('Failed to save:', error);
      // Show error toast
    } finally {
      setSaving(false);
    }
  };

  const handleAddOption = (questionId: string) => {
    addOption(questionId, { label: '新选项', value: 'new_option' });
  };

  const handleUpdateOption = (questionId: string, optionId: string, label: string) => {
    updateOption(questionId, optionId, { label, value: label });
  };

  const handleAddMatrixItem = (questionId: string) => {
    addMatrixItem(questionId, { label: '新评价项' });
  };

  const handleUpdateMatrixItem = (questionId: string, itemId: string, label: string) => {
    // Matrix item updates will be implemented in the context
    console.log('Update matrix item:', questionId, itemId, label);
  };

  const selectedQuestion = survey.questions.find(q => q.id === selectedQuestionId);

  const renderQuestionCard = (question: Question) => {
    const isSelected = question.id === selectedQuestionId;

    switch (question.type) {
      case 'single': {
        const q = question as import('../types/question').SingleChoiceQuestion;
        return (
          <SingleChoiceCard
            question={q}
            isSelected={isSelected}
            onSelect={() => selectQuestion(question.id)}
            onDuplicate={() => duplicateQuestion(question.id)}
            onDelete={() => deleteQuestion(question.id)}
            onUpdateTitle={(title) => updateQuestion(question.id, { title })}
            onAddOption={() => handleAddOption(question.id)}
            onUpdateOption={(optionId, label) => handleUpdateOption(question.id, optionId, label)}
            onDeleteOption={(optionId) => deleteOption(question.id, optionId)}
            isBatchSelected={selectedQuestionIds.includes(question.id)}
            onBatchToggle={() => toggleQuestionSelection(question.id)}
            onReorderClick={() => setReorderDialog({
              isOpen: true,
              questionId: question.id
            })}
          />
        );
      }
      case 'multiple': {
        const q = question as import('../types/question').MultipleChoiceQuestion;
        return (
          <MultipleChoiceCard
            question={q}
            isSelected={isSelected}
            onSelect={() => selectQuestion(question.id)}
            onDuplicate={() => duplicateQuestion(question.id)}
            onDelete={() => deleteQuestion(question.id)}
            onUpdateTitle={(title) => updateQuestion(question.id, { title })}
            onAddOption={() => handleAddOption(question.id)}
            onUpdateOption={(optionId, label) => handleUpdateOption(question.id, optionId, label)}
            onDeleteOption={(optionId) => deleteOption(question.id, optionId)}
            isBatchSelected={selectedQuestionIds.includes(question.id)}
            onBatchToggle={() => toggleQuestionSelection(question.id)}
            onReorderClick={() => setReorderDialog({
              isOpen: true,
              questionId: question.id
            })}
          />
        );
      }
      case 'text': {
        const q = question as import('../types/question').TextInputQuestion;
        return (
          <TextInputCard
            question={q}
            isSelected={isSelected}
            onSelect={() => selectQuestion(question.id)}
            onDuplicate={() => duplicateQuestion(question.id)}
            onDelete={() => deleteQuestion(question.id)}
            onUpdateTitle={(title) => updateQuestion(question.id, { title })}
            isBatchSelected={selectedQuestionIds.includes(question.id)}
            onBatchToggle={() => toggleQuestionSelection(question.id)}
            onReorderClick={() => setReorderDialog({
              isOpen: true,
              questionId: question.id
            })}
          />
        );
      }
      case 'matrix': {
        const q = question as import('../types/question').MatrixQuestion;
        return (
          <MatrixCard
            question={q}
            isSelected={isSelected}
            onSelect={() => selectQuestion(question.id)}
            onDuplicate={() => duplicateQuestion(question.id)}
            onDelete={() => deleteQuestion(question.id)}
            onUpdateTitle={(title) => updateQuestion(question.id, { title })}
            onAddItem={() => handleAddMatrixItem(question.id)}
            onUpdateItem={(itemId, label) => handleUpdateMatrixItem(question.id, itemId, label)}
            onDeleteItem={(itemId) => {
              console.log('Delete item:', itemId);
            }}
            isBatchSelected={selectedQuestionIds.includes(question.id)}
            onBatchToggle={() => toggleQuestionSelection(question.id)}
            onReorderClick={() => setReorderDialog({
              isOpen: true,
              questionId: question.id
            })}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to={`/experiments/${id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{survey.name}</h1>
            <p className="text-xs text-gray-500">
              {survey.questions.length} 个问题
              {lastSaved && ` · 上次保存: ${lastSaved.toLocaleTimeString()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
            预览
          </button>
          <button
            onClick={() => alert('执行功能即将推出')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play size={16} />
            执行
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left toolbar */}
        <QuestionToolbar onAddQuestion={addQuestion} />

        {/* Center - question list */}
        <div className="flex-1 overflow-y-auto p-6">
          {survey.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                开始创建你的问卷
              </h3>
              <p className="text-gray-600 mb-6">
                点击左侧工具栏的问题类型添加问题
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => addQuestion('single')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加第一个问题
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {survey.questions
                .sort((a, b) => a.order - b.order)
                .map((question) => (
                  <div key={question.id}>{renderQuestionCard(question)}</div>
                ))}
            </div>
          )}
        </div>

        {/* Right - configuration panel */}
        <ConfigurationPanel
          question={selectedQuestion || null}
          onUpdateQuestion={(updates) => {
            if (selectedQuestionId) {
              updateQuestion(selectedQuestionId, updates);
            }
          }}
          onBatchAddOptions={() => alert('批量添加选项功能即将推出')}
        />
      </div>

      {/* Reorder dialog */}
      <QuestionReorderDialog
        isOpen={reorderDialog.isOpen}
        onClose={() => setReorderDialog({ isOpen: false, questionId: null })}
        questionId={reorderDialog.questionId || ''}
        questionOrder={
          reorderDialog.questionId
            ? survey.questions.find(q => q.id === reorderDialog.questionId)?.order || 0
            : 0
        }
        totalQuestions={survey.questions.length}
        selectedCount={selectedQuestionIds.length}
        onMove={(targetOrder) => {
          if (selectedQuestionIds.length > 0) {
            moveSelectedQuestions(targetOrder);
          } else if (reorderDialog.questionId) {
            moveQuestion(reorderDialog.questionId, targetOrder);
          }
          setReorderDialog({ isOpen: false, questionId: null });
        }}
      />
    </div>
  );
}

export default function QuestionnaireEditor() {
  const { id } = useParams<{ id: string }>();

  // Default survey
  const initialSurvey = {
    id: id || 'new',
    name: '新问卷',
    description: '',
    questions: [],
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!id) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">无效的实验ID</h2>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700"
          >
            返回实验列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SurveyEditorProvider initialSurvey={initialSurvey}>
      <QuestionnaireEditorContent />
    </SurveyEditorProvider>
  );
}

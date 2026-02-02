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
  applyScaleToQuestions: (questionIds: string[], scale: ScaleConfig) => void;

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
      } as Question;
    } else if (type === 'multiple') {
      newQuestion = {
        id: newId,
        type: 'multiple',
        title: '新问题',
        required: false,
        order: insertOrder,
        options: [],
        layout: 'vertical',
      } as Question;
    } else if (type === 'text') {
      newQuestion = {
        id: newId,
        type: 'text',
        title: '新问题',
        required: false,
        order: insertOrder,
        inputType: 'text',
      } as Question;
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
      } as Question;
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
        q.id === id ? { ...q, ...updates } as Question : q
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
    applyScaleToQuestions,
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

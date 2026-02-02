import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { experimentsApi, ExperimentCreate, Question } from '../api/experiments';

const CreateExperiment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sampleCount, setSampleCount] = useState(10);
  const [qualityWeight, setQualityWeight] = useState(1);
  const [priceWeight, setPriceWeight] = useState(1);
  const [speedWeight, setSpeedWeight] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', question: '', answer_type: 'text', required: true }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    const validQuestions = questions.filter(q => q.question.trim());
    if (validQuestions.length === 0) {
      setError('At least one question is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const experimentData: ExperimentCreate = {
        title: title.trim(),
        description: description.trim(),
        sample_config: {
          sample_count: sampleCount,
          quality_weight: qualityWeight,
          price_weight: priceWeight,
          speed_weight: speedWeight,
        },
        questions: validQuestions.map((q, index) => ({
          ...q,
          id: String(index + 1),
        })),
      };

      const created = await experimentsApi.createExperiment(experimentData);
      navigate(`/experiments/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create experiment');
      console.error('Error creating experiment:', err);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: String(questions.length + 1),
      question: '',
      answer_type: 'text',
      required: true,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      setError('At least one question is required');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addChoice = (questionIndex: number) => {
    const updated = [...questions];
    if (!updated[questionIndex].choices) {
      updated[questionIndex].choices = [];
    }
    updated[questionIndex].choices = [...(updated[questionIndex].choices || []), ''];
    setQuestions(updated);
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const updated = [...questions];
    if (!updated[questionIndex].choices) {
      updated[questionIndex].choices = [];
    }
    updated[questionIndex].choices![choiceIndex] = value;
    setQuestions(updated);
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].choices) {
      updated[questionIndex].choices = updated[questionIndex].choices!.filter((_, i) => i !== choiceIndex);
      setQuestions(updated);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-primary-600 hover:text-primary-700">
          &larr; Back to Experiments
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Create Experiment</h2>
        <p className="text-gray-600 mt-1">Design a new MTurk experiment</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Information */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Enter experiment title"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={4}
              placeholder="Enter experiment description"
              disabled={loading}
            />
          </div>
        </div>

        {/* Sample Configuration */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Sample Configuration</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Count
              </label>
              <input
                type="number"
                value={sampleCount}
                onChange={(e) => setSampleCount(Number(e.target.value))}
                className="input"
                min={1}
                max={100}
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optimization Weights
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Quality</label>
                <input
                  type="number"
                  value={qualityWeight}
                  onChange={(e) => setQualityWeight(Number(e.target.value))}
                  className="input"
                  min={0}
                  max={10}
                  step={0.1}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Price</label>
                <input
                  type="number"
                  value={priceWeight}
                  onChange={(e) => setPriceWeight(Number(e.target.value))}
                  className="input"
                  min={0}
                  max={10}
                  step={0.1}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Speed</label>
                <input
                  type="number"
                  value={speedWeight}
                  onChange={(e) => setSpeedWeight(Number(e.target.value))}
                  className="input"
                  min={0}
                  max={10}
                  step={0.1}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Questions</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="btn btn-secondary text-sm"
              disabled={loading}
            >
              Add Question
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Question {qIndex + 1}</h4>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-700 text-sm"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    className="input"
                    rows={2}
                    placeholder="Enter your question"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Type
                    </label>
                    <select
                      value={question.answer_type}
                      onChange={(e) => updateQuestion(qIndex, 'answer_type', e.target.value)}
                      className="input"
                      disabled={loading}
                    >
                      <option value="text">Text</option>
                      <option value="rating">Rating (1-5)</option>
                      <option value="choice">Multiple Choice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required
                    </label>
                    <select
                      value={question.required ? 'true' : 'false'}
                      onChange={(e) => updateQuestion(qIndex, 'required', e.target.value === 'true')}
                      className="input"
                      disabled={loading}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>

                {question.answer_type === 'choice' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Choices
                      </label>
                      <button
                        type="button"
                        onClick={() => addChoice(qIndex)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                        disabled={loading}
                      >
                        + Add Choice
                      </button>
                    </div>
                    <div className="space-y-2">
                      {question.choices?.map((choice, cIndex) => (
                        <div key={cIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={choice}
                            onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                            className="input"
                            placeholder={`Choice ${cIndex + 1}`}
                            disabled={loading}
                          />
                          {(question.choices?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => removeChoice(qIndex, cIndex)}
                              className="text-red-600 hover:text-red-700 px-2"
                              disabled={loading}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )) || (
                        <div className="text-gray-500 text-sm">No choices added yet</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Experiment'}
          </button>
          <Link
            to="/"
            className="btn btn-secondary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreateExperiment;

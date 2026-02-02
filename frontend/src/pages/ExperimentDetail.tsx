import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { experimentsApi, Experiment, ExecutionRequest, Sample } from '../api/experiments';

const ExperimentDetail = () => {
  const { id } = useParams<{ id: string }>();

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [executing, setExecuting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const [samples, setSamples] = useState<Sample[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadExperiment(id);
      // Check if experiment has results
      loadResults(id);
    }
  }, [id]);

  const loadExperiment = async (expId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await experimentsApi.getExperiment(expId);
      setExperiment(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load experiment');
      console.error('Error loading experiment:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (expId: string) => {
    try {
      setLoadingSamples(true);
      const results = await experimentsApi.getExecutionResults(expId);
      setSamples(results);
      setLoadingSamples(false);
    } catch (err: any) {
      // Ignore error if experiment hasn't been executed yet
      setLoadingSamples(false);
    }
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !apiKey.trim()) {
      setError('API key is required');
      return;
    }

    try {
      setExecuting(true);
      setError(null);

      const requestData: ExecutionRequest = {
        openai_api_key: apiKey.trim(),
      };

      const result = await experimentsApi.executeExperiment(id, requestData);
      setExecutionStatus(result.status);

      // Start polling for results
      pollForResults();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to execute experiment');
      console.error('Error executing experiment:', err);
    } finally {
      setExecuting(false);
    }
  };

  const pollForResults = () => {
    if (!id) return;

    const poll = async () => {
      try {
        const status = await experimentsApi.getExecutionStatus(id);
        setExecutionStatus(status.status);

        if (status.status === 'active' || status.status === 'running') {
          // Continue polling
          setTimeout(poll, 2000);
        } else {
          // Execution complete, load results
          loadResults(id);
        }
      } catch (err: any) {
        console.error('Error polling status:', err);
      }
    };

    poll();
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      created: 'bg-blue-100 text-blue-800',
      running: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading experiment...</div>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Experiment not found</p>
        <Link to="/" className="btn btn-primary">
          Back to Experiments
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-primary-600 hover:text-primary-700">
          &larr; Back to Experiments
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{experiment.title}</h2>
            <p className="text-gray-600 mt-1">{experiment.description}</p>
          </div>
          {getStatusBadge(experiment.status)}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Questions */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Questions</h3>
            <div className="space-y-4">
              {experiment.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-primary-600">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="text-gray-900">{question.question}</p>
                      <div className="flex gap-2 mt-2 text-sm text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {question.answer_type}
                        </span>
                        {question.required && (
                          <span className="bg-red-50 text-red-600 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      {question.answer_type === 'choice' && question.choices && (
                        <div className="mt-2 ml-4 space-y-1">
                          {question.choices.map((choice, cIndex) => (
                            <div key={cIndex} className="text-sm text-gray-600">
                              • {choice}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Samples / Results */}
          {(samples.length > 0 || loadingSamples) && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Sample Responses</h3>
                {loadingSamples && (
                  <span className="text-sm text-gray-600">Loading...</span>
                )}
              </div>

              {samples.length === 0 && loadingSamples ? (
                <div className="text-center py-8 text-gray-600">
                  Waiting for responses...
                </div>
              ) : (
                <div className="space-y-4">
                  {samples.map((sample) => (
                    <div key={sample.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Worker: {sample.worker_id}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Task ID: {sample.task_id}
                          </p>
                        </div>
                        <div className="flex gap-2 text-sm">
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                            Quality: {sample.quality_score.toFixed(2)}
                          </span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            ${sample.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(sample.answers).map(([questionId, answer]) => {
                          const question = experiment.questions.find(q => q.id === questionId);
                          return (
                            <div key={questionId} className="text-sm">
                              <span className="font-medium text-gray-700">
                                {question?.question || questionId}:
                              </span>
                              <span className="ml-2 text-gray-900">{String(answer)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Configuration */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Sample Count:</span>
                <span className="ml-2 text-gray-600">{experiment.sample_config.sample_count}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Quality Weight:</span>
                <span className="ml-2 text-gray-600">{experiment.sample_config.quality_weight}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Price Weight:</span>
                <span className="ml-2 text-gray-600">{experiment.sample_config.price_weight}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Speed Weight:</span>
                <span className="ml-2 text-gray-600">{experiment.sample_config.speed_weight}</span>
              </div>
            </div>
          </div>

          {/* Execute */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Execute Experiment</h3>
            <form onSubmit={handleExecute}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="input pr-20"
                    placeholder="sk-..."
                    disabled={executing || loadingSamples}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your API key is used only for this execution
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={executing || loadingSamples}
              >
                {executing ? 'Executing...' : loadingSamples ? 'Running...' : 'Execute'}
              </button>
            </form>

            {executionStatus && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Status:</strong> {executionStatus}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Check samples below for responses
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <span className="ml-2 text-gray-600">{experiment.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(experiment.created_at).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Updated:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(experiment.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentDetail;

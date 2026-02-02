import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { experimentsApi, Experiment } from '../api/experiments';

const ExperimentsList = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await experimentsApi.getAllExperiments();
      setExperiments(data);
    } catch (err) {
      setError('Failed to load experiments. Please make sure the backend is running.');
      console.error('Error loading experiments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experiment?')) {
      return;
    }

    try {
      await experimentsApi.deleteExperiment(id);
      setExperiments(experiments.filter(exp => exp.id !== id));
    } catch (err) {
      setError('Failed to delete experiment');
      console.error('Error deleting experiment:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      created: 'bg-blue-100 text-blue-800',
      running: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading experiments...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Experiments</h2>
          <p className="text-gray-600 mt-1">Manage and execute your experiments</p>
        </div>
        <Link
          to="/create"
          className="btn btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Experiment
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {experiments.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No experiments yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first experiment</p>
          <Link to="/create" className="btn btn-primary">
            Create Experiment
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {experiments.map((experiment) => (
            <div key={experiment.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {experiment.title}
                    </h3>
                    {getStatusBadge(experiment.status)}
                  </div>
                  <p className="text-gray-600 mb-4">{experiment.description}</p>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Sample Count:</span>
                      <span className="ml-2 text-gray-600">{experiment.sample_config.sample_count}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Questions:</span>
                      <span className="ml-2 text-gray-600">{experiment.questions.length}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(experiment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {experiment.sample_config.quality_weight > 0 && (
                      <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                        Quality: {experiment.sample_config.quality_weight}
                      </span>
                    )}
                    {experiment.sample_config.price_weight > 0 && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                        Price: {experiment.sample_config.price_weight}
                      </span>
                    )}
                    {experiment.sample_config.speed_weight > 0 && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        Speed: {experiment.sample_config.speed_weight}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/experiments/${experiment.id}`}
                    className="btn btn-secondary"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(experiment.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperimentsList;

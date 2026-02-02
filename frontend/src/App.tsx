import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ExperimentsList from './pages/ExperimentsList';
import CreateExperiment from './pages/CreateExperiment';
import ExperimentDetail from './pages/ExperimentDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-primary-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Silicon Sample Simulator</h1>
                <p className="text-primary-100 text-sm">MTurk Experiment Management Platform</p>
              </div>
              <nav className="flex gap-4">
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Experiments
                </Link>
                <Link
                  to="/create"
                  className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                >
                  Create Experiment
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ExperimentsList />} />
            <Route path="/create" element={<CreateExperiment />} />
            <Route path="/experiments/:id" element={<ExperimentDetail />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              Silicon Sample Simulator - MVP for MTurk Experiment Management
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

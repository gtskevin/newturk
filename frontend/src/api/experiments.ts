import api from './client';

// Types
export interface Question {
  id: string;
  question: string;
  answer_type: 'text' | 'rating' | 'choice';
  choices?: string[];
  required: boolean;
}

export interface SampleConfig {
  sample_count: number;
  quality_weight: number;
  price_weight: number;
  speed_weight: number;
}

export interface ExperimentCreate {
  title: string;
  description: string;
  sample_config: SampleConfig;
  questions: Question[];
}

export interface Experiment {
  id: string;
  title: string;
  description: string;
  sample_config: SampleConfig;
  questions: Question[];
  status: 'created' | 'running' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface ExecutionRequest {
  openai_api_key: string;
}

export interface ExecutionResult {
  task_id: string;
  status: string;
  message: string;
}

export interface Sample {
  id: string;
  worker_id: string;
  task_id: string;
  answers: Record<string, string | number>;
  quality_score: number;
  price: number;
  speed: number;
  created_at: string;
}

export interface ExecutionDetail {
  task_id: string;
  experiment_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_samples: number;
  completed_samples: number;
  samples: Sample[];
  created_at: string;
  updated_at: string;
  error?: string;
}

// API Functions
export const experimentsApi = {
  // Get all experiments
  getAllExperiments: async (): Promise<Experiment[]> => {
    const response = await api.get<Experiment[]>('/experiments');
    return response.data;
  },

  // Get experiment by ID
  getExperiment: async (id: string): Promise<Experiment> => {
    const response = await api.get<Experiment>(`/experiments/${id}`);
    return response.data;
  },

  // Create experiment
  createExperiment: async (data: ExperimentCreate): Promise<Experiment> => {
    const response = await api.post<Experiment>('/experiments', data);
    return response.data;
  },

  // Execute experiment
  executeExperiment: async (id: string, requestData: ExecutionRequest): Promise<ExecutionResult> => {
    const response = await api.post<ExecutionResult>(`/execution/execute?experiment_id=${id}`, requestData);
    return response.data;
  },

  // Get execution status
  getExecutionStatus: async (id: string): Promise<any> => {
    const response = await api.get<any>(`/execution/${id}/status`);
    return response.data;
  },

  // Get execution results
  getExecutionResults: async (id: string): Promise<Sample[]> => {
    const response = await api.get<any[]>(`/execution/${id}/results`);
    // Transform backend response to match frontend Sample interface
    return response.data.map((participant: any) => ({
      id: participant.participant_id.toString(),
      worker_id: `Worker_${participant.participant_number}`,
      task_id: participant.participant_id.toString(),
      answers: participant.responses.reduce((acc: Record<string, any>, r: any) => {
        acc[r.question_id] = r.coded_response;
        return acc;
      }, {}),
      quality_score: 0.9, // Default quality score
      price: 0.50, // Default price
      speed: Math.random() * 10 + 1, // Random speed
      created_at: new Date().toISOString(),
    }));
  },

  // Delete experiment
  deleteExperiment: async (id: string): Promise<void> => {
    await api.delete(`/experiments/${id}`);
  },

  // Update experiment questions
  updateQuestions: async (id: string, questions: Question[]): Promise<void> => {
    await api.put(`/experiments/${id}`, { questions });
  },

  // Get experiment questions
  getQuestions: async (id: string): Promise<Question[]> => {
    const response = await api.get<Experiment>(`/experiments/${id}`);
    return response.data.questions;
  },
};

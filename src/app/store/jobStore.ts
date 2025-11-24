import { create } from 'zustand';

export interface Job {
    id: string;
    title: string;
    company: string;
    location?: string;
    description?: string;
    applyLink: string;
    source: 'YC' | 'Wellfound';
    status: 'new' | 'applied' | 'failed';
    postedAt?: string;
}

interface JobState {
    jobs: Job[];
    isLoading: boolean;
    error: string | null;
    setJobs: (jobs: Job[]) => void;
    addJobs: (jobs: Job[]) => void;
    updateJobStatus: (id: string, status: Job['status']) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useJobStore = create<JobState>((set) => ({
    jobs: [],
    isLoading: false,
    error: null,
    setJobs: (jobs) => set({ jobs }),
    addJobs: (newJobs) => set((state) => ({ jobs: [...state.jobs, ...newJobs] })),
    updateJobStatus: (id, status) =>
        set((state) => ({
            jobs: state.jobs.map((job) =>
                job.id === id ? { ...job, status } : job
            ),
        })),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}));

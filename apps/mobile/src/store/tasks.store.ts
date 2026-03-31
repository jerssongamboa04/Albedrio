import { create } from "zustand";
import {
  fetchTasks,
  createTask as createTaskService,
  toggleTaskDone as toggleTaskDoneService,
  deleteTask as deleteTaskService,
  type Task,
  type CreateTaskInput,
} from "../services/tasks.service";

type TasksState = {
  tasks: Task[];
  loading: boolean;
  saving: boolean;
  error: string | null;

  loadTasks: () => Promise<void>;
  addTask: (userId: string, input: CreateTaskInput) => Promise<{ error: string | null }>;
  toggleTaskDone: (id: string, isDone: boolean) => Promise<{ error: string | null }>;
  removeTask: (id: string) => Promise<{ error: string | null }>;

  clearError: () => void;
  reset: () => void;
};

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  loading: false,
  saving: false,
  error: null,

  loadTasks: async () => {
    set({ loading: true, error: null });

    const { data, error } = await fetchTasks();

    if (error) {
      set({
        loading: false,
        error: error.message,
      });
      return;
    }

    set({
      tasks: data ?? [],
      loading: false,
      error: null,
    });
  },

  addTask: async (userId, input) => {
    set({ saving: true, error: null });

    const { data, error } = await createTaskService(userId, input);

    if (error) {
      set({
        saving: false,
        error: error.message,
      });
      return { error: error.message };
    }

    set((state) => ({
      tasks: data ? [data, ...state.tasks] : state.tasks,
      saving: false,
      error: null,
    }));

    return { error: null };
  },

  toggleTaskDone: async (id, isDone) => {
    const { data, error } = await toggleTaskDoneService(id, isDone);

    if (error) {
      set({ error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              is_done: data.is_done,
              done_at: data.done_at,
            }
          : task
      ),
      error: null,
    }));

    return { error: null };
  },

  removeTask: async (id) => {
    const { error } = await deleteTaskService(id);

    if (error) {
      set({ error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      error: null,
    }));

    return { error: null };
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      tasks: [],
      loading: false,
      saving: false,
      error: null,
    }),
}));
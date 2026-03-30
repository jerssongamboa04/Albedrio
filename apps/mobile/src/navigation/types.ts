import type { Task } from "../services/tasks.service";

export type AppStackParamList = {
  Home: undefined;
  TaskStartScreen: {
    taskId: string;
    taskTitle: string;
  };
  TaskManagementScreen: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};
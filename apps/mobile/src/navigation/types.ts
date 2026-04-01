export type AppTabsParamList = {
  Home: undefined;
  TaskManagementScreen: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  TaskStartScreen: {
    taskId: string;
    taskTitle: string;
  };
  TaskDetailScreen: {
    taskId: string;
  };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};
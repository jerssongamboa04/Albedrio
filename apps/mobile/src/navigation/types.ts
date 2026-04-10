export type AppTabsParamList = {
  Home: undefined;
  TaskManagementScreen: undefined;
  Profile: undefined;
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
  AntiBlockScreen: {
    taskId: string;
  };
  BreakdownScreen: {
  taskId: string;
};
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};
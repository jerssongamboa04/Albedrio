export type MascotState = "idle" | "active" | "complete";

type Params = {
  completedTasks: number;
  totalTasks: number;
};

export function getMascotState({
  completedTasks,
  totalTasks,
}: Params): MascotState {
  if (totalTasks <= 0) return "idle";

  const progress = completedTasks / totalTasks;

  if (progress >= 1) return "complete";
  if (progress > 0) return "active";

  return "idle";
}
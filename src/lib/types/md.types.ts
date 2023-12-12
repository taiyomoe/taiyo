export type ImportEventMessage = {
  step: number;
  content: string;
  type: "ongoing" | "success" | "error";
};

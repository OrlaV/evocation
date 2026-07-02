/* Queue stage constants + board item shape, in their own module because BOTH
   sides need them: server code (lib/queue.ts, admin actions) and client
   components (Queue, RequestsBoard). Keeping them here means importing a label
   never drags the server-only supabase client into a browser bundle. */

export const QUEUE_STAGES = [
  "queued",
  "scanning",
  "modelling",
  "printing",
  "revived",
] as const;
export type QueueStage = (typeof QUEUE_STAGES)[number];

export const STAGE_LABELS: Record<QueueStage, string> = {
  queued: "In queue",
  scanning: "3D scanning",
  modelling: "CAD modelling",
  printing: "Test printing",
  revived: "Revived",
};

export type QueueBoardItem = {
  key: string;
  label: string;
  vehicle: string | null;
  count: number;
  stage: QueueStage;
};

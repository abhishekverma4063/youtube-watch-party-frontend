export const Role = {
  Host: 'Host',
  Moderator: 'Moderator',
  Participant: 'Participant',
  Viewer: 'Viewer',
} as const;
export type Role = typeof Role[keyof typeof Role];

export interface UserData {
  userId: string;
  username: string;
  role: Role;
  isAFK?: boolean;
  joinTime?: number;
}

export interface VideoState {
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  lastSyncTime: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  role?: Role;
  text: string;
  timestamp: number;
}

export interface SessionLog {
  userId: string;
  username: string;
  joinTime: number;
  leaveTime?: number;
  totalDuration: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface UserPreferences {
  userId: string;
  defaultMode: string;
  defaultLanguage: string;
  defaultSynonymLevel: number;
  defaultProviderId?: string;
  defaultModelId?: string;
  autoSave: boolean;
  theme: 'light' | 'dark' | 'system';
}

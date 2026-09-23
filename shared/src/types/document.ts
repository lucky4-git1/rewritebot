export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  input: string;
  output: string;
  mode: string;
  providerId: string;
  modelId: string;
  synonymLevel: number;
  frozenTerms: string[];
  language: string;
  statistics: DocumentStatistics;
  createdAt: Date;
}

export interface DocumentStatistics {
  inputWords: number;
  inputCharacters: number;
  inputSentences: number;
  inputParagraphs: number;
  outputWords: number;
  outputCharacters: number;
  outputSentences: number;
  outputParagraphs: number;
  changedWords?: number;
  similarity?: number;
  readingTime?: number;
}

export interface HistoryEvent {
  id: string;
  userId: string;
  documentId?: string;
  operation: string;
  mode: string;
  providerId: string;
  modelId: string;
  input: string;
  output: string;
  statistics: DocumentStatistics;
  latency: number;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

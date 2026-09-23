import { apiClient } from './api';

export interface GrammarCheckRequest {
  text: string;
  language?: string;
  providerId: string;
  modelId: string;
}

export interface GrammarCorrection {
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
  original: string;
  corrected: string;
  position: number;
  explanation: string;
}

export interface GrammarCheckResponse {
  correctedText: string;
  corrections: GrammarCorrection[];
  provider: string;
  model: string;
  latency: number;
}

export interface HumanizeRequest {
  text: string;
  mode: 'natural' | 'casual' | 'professional' | 'academic' | 'conversational';
  language?: string;
  providerId: string;
  modelId: string;
}

export interface SummarizeRequest {
  text: string;
  length: 'short' | 'medium' | 'detailed';
  format: 'paragraph' | 'bullets' | 'key-points' | 'executive';
  language?: string;
  providerId: string;
  modelId: string;
}

export interface TranslateRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  providerId: string;
  modelId: string;
}

export interface CitationSource {
  type: 'book' | 'article' | 'website' | 'journal' | 'other';
  title: string;
  authors: string[];
  year?: number;
  publisher?: string;
  url?: string;
  doi?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  accessed?: string;
}

export interface CitationRequest {
  source: CitationSource;
  style: 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'vancouver';
  providerId: string;
  modelId: string;
}

export interface CitationResponse {
  citation: string;
  inText: string;
  style: string;
  provider: string;
  model: string;
  latency: number;
}

export interface ToolResponse {
  text: string;
  provider: string;
  model: string;
  latency: number;
}

class ToolsService {
  async checkGrammar(request: GrammarCheckRequest): Promise<GrammarCheckResponse> {
    return apiClient.post<GrammarCheckResponse>('/tools/grammar', request);
  }

  async humanize(request: HumanizeRequest): Promise<ToolResponse> {
    return apiClient.post<ToolResponse>('/tools/humanize', request);
  }

  async summarize(request: SummarizeRequest): Promise<ToolResponse> {
    return apiClient.post<ToolResponse>('/tools/summarize', request);
  }

  async translate(request: TranslateRequest): Promise<ToolResponse> {
    return apiClient.post<ToolResponse>('/tools/translate', request);
  }

  async generateCitation(request: CitationRequest): Promise<CitationResponse> {
    return apiClient.post<CitationResponse>('/tools/cite', request);
  }
}

export const toolsService = new ToolsService();

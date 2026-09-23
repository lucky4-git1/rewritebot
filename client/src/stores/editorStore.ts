import { create } from 'zustand';
import { ParaphraseMode } from '@rewritebot/shared';
import { paraphraseService } from '../services/paraphrase.service';
import { exportDocument, ExportFormat } from '../utils/export';

interface EditorState {
  // Input/Output content
  inputText: string;
  outputText: string;
  
  // Mode and settings
  mode: ParaphraseMode;
  synonymLevel: number;
  language: string;
  frozenTerms: string[];
  customInstruction: string;
  
  // Generation state
  isGenerating: boolean;
  isStreaming: boolean;
  error: string | null;
  
  // Statistics
  inputWordCount: number;
  outputWordCount: number;

  // Actions
  setInputText: (text: string) => void;
  setOutputText: (text: string) => void;
  setMode: (mode: ParaphraseMode) => void;
  setSynonymLevel: (level: number) => void;
  setLanguage: (language: string) => void;
  addFrozenTerm: (term: string) => void;
  removeFrozenTerm: (term: string) => void;
  clearFrozenTerms: () => void;
  setCustomInstruction: (instruction: string) => void;
  
  // Generation
  paraphrase: (providerId: string, modelId: string) => Promise<void>;
  paraphraseStream: (providerId: string, modelId: string) => Promise<void>;
  cancelGeneration: () => void;
  
  // Utilities
  clearError: () => void;
  reset: () => void;
  swapInputOutput: () => void;
  exportOutput: (filename: string, format: ExportFormat) => Promise<void>;
}

const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  inputText: '',
  outputText: '',
  mode: 'standard',
  synonymLevel: 2,
  language: 'auto',
  frozenTerms: [],
  customInstruction: '',
  isGenerating: false,
  isStreaming: false,
  error: null,
  inputWordCount: 0,
  outputWordCount: 0,

  // Setters
  setInputText: (text) => set({
    inputText: text,
    inputWordCount: countWords(text),
  }),

  setOutputText: (text) => set({
    outputText: text,
    outputWordCount: countWords(text),
  }),

  setMode: (mode) => set({ mode }),

  setSynonymLevel: (level) => set({ synonymLevel: level }),

  setLanguage: (language) => set({ language }),

  addFrozenTerm: (term) => {
    const { frozenTerms } = get();
    if (!frozenTerms.includes(term)) {
      set({ frozenTerms: [...frozenTerms, term] });
    }
  },

  removeFrozenTerm: (term) => {
    const { frozenTerms } = get();
    set({ frozenTerms: frozenTerms.filter(t => t !== term) });
  },

  clearFrozenTerms: () => set({ frozenTerms: [] }),

  setCustomInstruction: (instruction) => set({ customInstruction: instruction }),

  // Paraphrase (non-streaming)
  paraphrase: async (providerId, modelId) => {
    const { inputText, mode, language, synonymLevel, frozenTerms, customInstruction } = get();
    
    if (!inputText.trim()) {
      set({ error: 'Please enter some text to paraphrase' });
      return;
    }

    set({ isGenerating: true, error: null, outputText: '' });

    try {
      const response = await paraphraseService.paraphrase({
        text: inputText,
        mode,
        language,
        synonymLevel,
        frozenTerms,
        customInstruction: customInstruction || undefined,
        providerId,
        modelId,
      });

      set({
        outputText: response.text,
        outputWordCount: countWords(response.text),
        isGenerating: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Paraphrasing failed',
        isGenerating: false,
      });
    }
  },

  // Paraphrase with streaming
  paraphraseStream: async (providerId, modelId) => {
    const { inputText, mode, language, synonymLevel, frozenTerms, customInstruction } = get();
    
    if (!inputText.trim()) {
      set({ error: 'Please enter some text to paraphrase' });
      return;
    }

    set({ isGenerating: true, isStreaming: true, error: null, outputText: '' });

    try {
      let accumulatedText = '';

      for await (const chunk of paraphraseService.paraphraseStream({
        text: inputText,
        mode,
        language,
        synonymLevel,
        frozenTerms,
        customInstruction: customInstruction || undefined,
        providerId,
        modelId,
      })) {
        if (chunk.type === 'token' && chunk.content) {
          accumulatedText += chunk.content;
          set({
            outputText: accumulatedText,
            outputWordCount: countWords(accumulatedText),
          });
        } else if (chunk.type === 'error') {
          set({
            error: chunk.error || 'Streaming failed',
            isGenerating: false,
            isStreaming: false,
          });
          return;
        } else if (chunk.type === 'complete') {
          set({
            isGenerating: false,
            isStreaming: false,
          });
          return;
        }
      }

      set({ isGenerating: false, isStreaming: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Streaming failed',
        isGenerating: false,
        isStreaming: false,
      });
    }
  },

  cancelGeneration: () => {
    // TODO: Implement proper cancellation
    set({ isGenerating: false, isStreaming: false });
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    inputText: '',
    outputText: '',
    mode: 'standard',
    synonymLevel: 2,
    language: 'auto',
    frozenTerms: [],
    customInstruction: '',
    isGenerating: false,
    isStreaming: false,
    error: null,
    inputWordCount: 0,
    outputWordCount: 0,
  }),

  swapInputOutput: () => {
    const { inputText, outputText } = get();
    set({
      inputText: outputText,
      outputText: inputText,
      inputWordCount: countWords(outputText),
      outputWordCount: countWords(inputText),
    });
  },

  exportOutput: async (filename, format) => {
    const { outputText } = get();
    
    if (!outputText.trim()) {
      set({ error: 'No content to export' });
      return;
    }

    try {
      await exportDocument(outputText, filename, format);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Export failed',
      });
    }
  },
}));

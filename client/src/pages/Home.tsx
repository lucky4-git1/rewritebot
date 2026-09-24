import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEditorStore } from '../stores/editorStore';
import { apiClient } from '../services/api';

export function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  
  const {
    inputText,
    outputText,
    mode,
    language,
    synonymLevel,
    isGenerating,
    inputWordCount,
    outputWordCount,
    setInputText,
    setMode,
    setLanguage,
    setSynonymLevel,
    paraphrase,
  } = useEditorStore();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await apiClient.get<any[]>('/providers');
      setProviders(data);
      // Auto-select default provider, or first provider if no default
      if (data.length > 0) {
        const defaultProvider = data.find(p => p.isDefault);
        setSelectedProviderId(defaultProvider ? defaultProvider.id : data[0].id);
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
    }
  };

  const handleParaphrase = async () => {
    console.log('=== PARAPHRASE CLICKED ===');
    console.log('Selected Provider ID:', selectedProviderId);
    console.log('Input text length:', inputText.length);
    
    if (!selectedProviderId) {
      console.log('No provider selected!');
      alert('Please add a provider in Settings first!');
      navigate('/providers');
      return;
    }
    
    const provider = providers.find(p => p.id === selectedProviderId);
    console.log('Found provider:', provider?.name, provider?.type);
    
    if (!provider) {
      console.log('Provider not found in list!');
      alert('Provider not found! Please select a valid provider.');
      await loadProviders(); // Reload providers
      return;
    }
    
    if (!inputText.trim()) {
      console.log('No input text!');
      alert('Please enter some text to paraphrase!');
      return;
    }
    
    try {
      console.log('Starting paraphrase with:', { 
        providerId: provider.id, 
        modelId: provider.modelId,
        textLength: inputText.length,
      });
      
      const result = await paraphrase(provider.id, provider.modelId);
      
      // Only log success if we got actual output
      if (result && result.text && result.text.trim().length > 0) {
        console.log('✓ Paraphrase SUCCESS:', {
          outputLength: result.text.length,
          provider: result.provider,
          model: result.model,
          latency: result.latency,
        });
      } else {
        console.error('✗ Paraphrase returned empty result');
        alert('Paraphrase failed: Provider returned empty response');
      }
    } catch (err: any) {
      console.error('✗ Paraphrase FAILED:', err);
      const errorMessage = apiClient.handleError(err);
      alert('Paraphrase failed: ' + errorMessage);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const modes = [
    { value: 'standard', label: 'Standard' },
    { value: 'fluency', label: 'Fluency' },
    { value: 'humanize', label: 'Humanize' },
    { value: 'formal', label: 'Formal' },
    { value: 'academic', label: 'Academic' },
    { value: 'simple', label: 'Simple' },
    { value: 'creative', label: 'Creative' },
    { value: 'expand', label: 'Expand' },
    { value: 'shorten', label: 'Shorten' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8f9fa' }}>
      {/* Top Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dee2e6', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
          RewriteBot
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#6c757d', fontSize: '14px' }}>{user?.name}</span>
          <button 
            onClick={logout}
            style={{ padding: '6px 16px', border: '1px solid #dee2e6', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mode Selection Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dee2e6', padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Mode Buttons */}
          {modes.slice(0, 3).map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value as any)}
              style={{
                padding: '6px 20px',
                border: mode === m.value ? '2px solid #28a745' : '1px solid #dee2e6',
                borderRadius: '20px',
                background: mode === m.value ? '#28a745' : '#fff',
                color: mode === m.value ? '#fff' : '#6c757d',
                cursor: 'pointer',
                fontWeight: mode === m.value ? '500' : '400',
                minWidth: '90px',
              }}
            >
              {m.label}
            </button>
          ))}

          {/* More Dropdown */}
          <select
            value={modes.slice(3).includes(modes.find(m => m.value === mode)!) ? mode : ''}
            onChange={(e) => e.target.value && setMode(e.target.value as any)}
            style={{
              padding: '6px 20px',
              border: '1px solid #dee2e6',
              borderRadius: '20px',
              background: '#fff',
              cursor: 'pointer',
              minWidth: '90px',
            }}
          >
            <option value="">More</option>
            {modes.slice(3).map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {/* Synonyms Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <span style={{ color: '#6c757d', fontSize: '14px' }}>Synonyms:</span>
            <input
              type="range"
              min="1"
              max="4"
              value={synonymLevel}
              onChange={(e) => setSynonymLevel(Number(e.target.value))}
              style={{ width: '120px' }}
            />
            <span style={{
              background: '#28a745',
              color: '#fff',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
            }}>
              {synonymLevel}
            </span>
          </div>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: '4px 8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <option value="auto">🌐 Detect language</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>

          {/* Provider Selector */}
          {providers.length > 0 ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type})
                  </option>
                ))}
              </select>
              <button
                onClick={loadProviders}
                title="Reload providers"
                style={{
                  padding: '4px 8px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                🔄
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/providers')}
              style={{
                padding: '6px 12px',
                border: '1px solid #dc3545',
                borderRadius: '6px',
                background: '#fff',
                color: '#dc3545',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              ⚠️ Add Provider
            </button>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Input Side */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #dee2e6', background: '#fff' }}>
          {/* Paste Button */}
          <div style={{ padding: '16px' }}>
            <button
              onClick={handlePaste}
              style={{
                padding: '6px 16px',
                border: '1px solid #28a745',
                borderRadius: '20px',
                background: '#fff',
                color: '#28a745',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              📋 Paste
            </button>
          </div>

          {/* Text Input */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter or paste your text here..."
            style={{
              flex: 1,
              border: 'none',
              padding: '16px',
              fontSize: '15px',
              lineHeight: '1.6',
              resize: 'none',
              outline: 'none',
            }}
          />

          {/* Bottom Bar */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
          }}>
            <span style={{ color: '#6c757d', fontSize: '14px' }}>{inputWordCount} words</span>
            <button
              onClick={handleParaphrase}
              disabled={isGenerating || !inputText.trim()}
              style={{
                padding: '10px 32px',
                border: 'none',
                borderRadius: '25px',
                background: isGenerating || !inputText.trim() ? '#ccc' : '#28a745',
                color: '#fff',
                cursor: isGenerating || !inputText.trim() ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '15px',
              }}
            >
              {isGenerating ? 'Processing...' : 'Paraphrase'}
            </button>
          </div>
        </div>

        {/* Output Side */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
          {outputText ? (
            <>
              {/* Output Text */}
              <div style={{
                flex: 1,
                padding: '16px',
                fontSize: '15px',
                lineHeight: '1.6',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
              }}>
                {outputText}
              </div>

              {/* Bottom Bar */}
              <div style={{
                padding: '16px',
                borderTop: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fff',
              }}>
                <span style={{ color: '#6c757d', fontSize: '14px' }}>{outputWordCount} words</span>
                <button
                  onClick={() => handleCopy(outputText)}
                  style={{
                    padding: '10px 32px',
                    border: '1px solid #28a745',
                    borderRadius: '25px',
                    background: '#fff',
                    color: '#28a745',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '15px',
                  }}
                >
                  Copy
                </button>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#adb5bd',
              fontSize: '15px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <p>Your paraphrased text will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Floating Action Buttons */}
      <div style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1000,
      }}>
        {/* Paraphrase Again */}
        <button
          onClick={handleParaphrase}
          disabled={!inputText.trim()}
          title="Paraphrase Again"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '1px solid #dee2e6',
            background: '#fff',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          🔄
        </button>

        {/* Copy */}
        <button
          onClick={() => outputText && handleCopy(outputText)}
          disabled={!outputText}
          title="Copy Output"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '1px solid #dee2e6',
            background: '#fff',
            cursor: outputText ? 'pointer' : 'not-allowed',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          📋
        </button>

        {/* History */}
        <button
          title="History"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '1px solid #dee2e6',
            background: '#fff',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          📚
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/providers')}
          title="Settings"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '1px solid #dee2e6',
            background: '#fff',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}

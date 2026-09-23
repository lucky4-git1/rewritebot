import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../services/api';

interface Provider {
  id: string;
  name: string;
  type: string;
  modelId: string;
  isDefault: boolean;
  createdAt: string;
  baseUrl?: string;
}

interface ProviderType {
  type: string;
  name: string;
}

export function Providers() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerTypes, setProviderTypes] = useState<ProviderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    apiKey: '',
    baseUrl: '',
    modelId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [providersData, typesData] = await Promise.all([
        apiClient.get<Provider[]>('/providers'),
        apiClient.get<ProviderType[]>('/providers/types')
      ]);
      setProviders(providersData);
      setProviderTypes(typesData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const protocolMap: Record<string, string> = {
        'openai': 'openai', 'anthropic': 'anthropic', 'gemini': 'gemini',
        'ollama': 'openai', 'lmstudio': 'openai', 'groq': 'openai',
        'together': 'openai', 'deepseek': 'openai', 'mistral': 'openai',
        'cerebras': 'openai', 'nvidia': 'openai', 'xai': 'openai',
        'openrouter': 'openai', 'huggingface': 'custom', 'generic-openai': 'openai',
      };

      const needsApiKey = !['ollama', 'lmstudio'].includes(formData.type);
      
      const newProvider = await apiClient.post<Provider>('/providers', {
        name: formData.name,
        type: formData.type,
        protocol: protocolMap[formData.type] || 'openai',
        authenticationType: needsApiKey ? 'bearer' : 'none',
        apiKey: formData.apiKey || undefined,
        baseUrl: formData.baseUrl || undefined,
        modelId: formData.modelId,
        options: { streamingEnabled: true },
      });
      
      setProviders([...providers, newProvider]);
      setShowAddForm(false);
      setFormData({ name: '', type: '', apiKey: '', baseUrl: '', modelId: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to add provider');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this provider?')) return;
    
    try {
      await apiClient.delete(`/providers/${id}`);
      setProviders(providers.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete provider');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8f9fa' }}>
      {/* Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dee2e6', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ padding: '6px 12px', border: '1px solid #dee2e6', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>
            ← Back
          </button>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>AI Providers</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#6c757d', fontSize: '14px' }}>{user?.name}</span>
          <button onClick={logout} style={{ padding: '6px 16px', border: '1px solid #dee2e6', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0' }}>AI Providers</h2>
              <p style={{ margin: 0, color: '#6c757d' }}>Manage your AI provider configurations</p>
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)} style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', background: '#28a745', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>
              {showAddForm ? 'Cancel' : '+ Add Provider'}
            </button>
          </div>

          {error && <div style={{ padding: '12px', background: '#f8d7da', color: '#721c24', borderRadius: '6px', marginBottom: '16px' }}>{error}</div>}

          {/* Add Form */}
          {showAddForm && (
            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>Add Provider</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="My Provider" required style={{ width: '100%', padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Type</label>
                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                      <option value="">Select Type</option>
                      {providerTypes.map(t => <option key={t.type} value={t.type}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>API Key {!['ollama','lmstudio'].includes(formData.type) && <span style={{color:'red'}}>*</span>}</label>
                    <input type="password" value={formData.apiKey} onChange={(e) => setFormData({...formData, apiKey: e.target.value})} placeholder="sk-..." required={!['ollama','lmstudio'].includes(formData.type)} style={{ width: '100%', padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Base URL (optional)</label>
                    <input type="text" value={formData.baseUrl} onChange={(e) => setFormData({...formData, baseUrl: e.target.value})} placeholder="http://localhost:11434" style={{ width: '100%', padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Model ID <span style={{color:'red'}}>*</span></label>
                  <input type="text" value={formData.modelId} onChange={(e) => setFormData({...formData, modelId: e.target.value})} placeholder="gpt-3.5-turbo, llama2, llama-3.3-70b-versatile, etc." required style={{ width: '100%', padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }} />
                </div>
                <button type="submit" style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', background: '#28a745', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>Save</button>
              </form>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6c757d' }}>Loading...</div>
          ) : providers.length === 0 ? (
            <div style={{ background: '#fff', padding: '48px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <h3>No Providers</h3>
              <p style={{ color: '#6c757d' }}>Add your first provider to start!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {providers.map(p => (
                <div key={p.id} style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0 }}>{p.name}</h3>
                      {p.isDefault && <span style={{ padding: '4px 12px', background: '#28a745', color: '#fff', borderRadius: '12px', fontSize: '12px' }}>DEFAULT</span>}
                      <span style={{ padding: '4px 12px', background: '#e9ecef', borderRadius: '12px', fontSize: '12px' }}>{p.type.toUpperCase()}</span>
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                      Model: <strong>{p.modelId}</strong>
                      {p.baseUrl && <div>URL: {p.baseUrl}</div>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(p.id)} style={{ padding: '8px 16px', border: '1px solid #dc3545', borderRadius: '6px', background: '#fff', color: '#dc3545', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          )}

          {/* Guide */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', marginTop: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Quick Setup</h3>
            <p><strong>Groq (Free):</strong> <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">Get API key</a> • Model: llama-3.3-70b-versatile</p>
            <p><strong>Ollama (Local):</strong> <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer">Download</a> • URL: http://localhost:11434 • Model: llama2</p>
            <p><strong>OpenAI:</strong> <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Get API key</a> • Model: gpt-3.5-turbo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

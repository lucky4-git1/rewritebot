import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../services/api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCw,
  Star,
  Cpu,
  Edit2,
  X,
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  type: string;
  modelId: string;
  isDefault: boolean;
  createdAt: string;
  baseUrl?: string;
  connectionStatus?: string;
  lastTested?: string;
}

interface ProviderType {
  type: string;
  name: string;
  defaultModel?: string;
  recommendedModels?: string[];
  docsUrl?: string;
}

export function Providers() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerTypes, setProviderTypes] = useState<ProviderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; message: string; latency?: number }>>({});

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

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [providersData, typesData] = await Promise.all([
        apiClient.get<Provider[]>('/providers'),
        apiClient.get<ProviderType[]>('/providers/types'),
      ]);
      setProviders(providersData);
      setProviderTypes(typesData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load providers');
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: string) => {
    const selected = providerTypes.find((t) => t.type === type);
    const defaultModels: Record<string, string> = {
      groq: 'qwen/qwen3.8-27b',
      openai: 'gpt-3.5-turbo',
      nvidia: 'meta/llama-3.1-8b-instruct',
      ollama: 'llama3',
      anthropic: 'claude-3-haiku-20240307',
    };

    setFormData({
      ...formData,
      type,
      name: formData.name || (selected ? `${selected.name} Provider` : type),
      modelId: formData.modelId || defaultModels[type] || 'gpt-3.5-turbo',
      baseUrl:
        type === 'ollama'
          ? 'http://localhost:11434/v1'
          : type === 'nvidia'
          ? 'https://integrate.api.nvidia.com/v1'
          : formData.baseUrl,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProviderId) {
        // Update existing provider
        const updatePayload: any = {
          name: formData.name,
          modelId: formData.modelId,
          baseUrl: formData.baseUrl || undefined,
        };
        if (formData.apiKey) {
          updatePayload.apiKey = formData.apiKey;
        }

        const updated = await apiClient.patch<Provider>(`/providers/${editingProviderId}`, updatePayload);
        setProviders(providers.map((p) => (p.id === editingProviderId ? updated : p)));
        showSuccess('Provider updated successfully!');
        setEditingProviderId(null);
      } else {
        // Create new provider
        const protocolMap: Record<string, string> = {
          openai: 'openai',
          anthropic: 'anthropic',
          gemini: 'gemini',
          ollama: 'openai',
          lmstudio: 'openai',
          groq: 'openai',
          together: 'openai',
          deepseek: 'openai',
          mistral: 'openai',
          cerebras: 'openai',
          nvidia: 'openai',
          xai: 'openai',
          openrouter: 'openai',
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
        showSuccess('Provider added successfully!');
      }

      setShowAddForm(false);
      setFormData({ name: '', type: '', apiKey: '', baseUrl: '', modelId: '' });
    } catch (err: any) {
      setError(apiClient.handleError(err));
    }
  };

  const handleTestConnection = async (id: string) => {
    try {
      setTestingId(id);
      const res = await apiClient.post<{ success: boolean; status: string; message: string; latency?: number }>(
        `/providers/${id}/test`,
        {}
      );
      setTestResult((prev) => ({
        ...prev,
        [id]: { success: true, message: res.message || 'Connected successfully', latency: res.latency },
      }));
      showSuccess(`Connection verified! Latency: ${res.latency || 0}ms`);
    } catch (err: any) {
      const errMsg = apiClient.handleError(err);
      setTestResult((prev) => ({
        ...prev,
        [id]: { success: false, message: errMsg },
      }));
      setError(`Test failed: ${errMsg}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleTestGeneration = async (id: string) => {
    try {
      setTestingId(id);
      const res = await apiClient.post<{ success: boolean; generatedText: string; latency: number }>(
        `/providers/${id}/test-generation`,
        {}
      );
      showSuccess(`Generation verified! Output: "${res.generatedText}" (${res.latency}ms)`);
    } catch (err: any) {
      setError(`Generation failed: ${apiClient.handleError(err)}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiClient.patch(`/providers/${id}`, { isDefault: true });
      setProviders(providers.map((p) => ({ ...p, isDefault: p.id === id })));
      showSuccess('Default provider updated');
    } catch (err: any) {
      setError(apiClient.handleError(err));
    }
  };

  const handleEdit = (p: Provider) => {
    setEditingProviderId(p.id);
    setFormData({
      name: p.name,
      type: p.type,
      apiKey: '',
      baseUrl: p.baseUrl || '',
      modelId: p.modelId,
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider configuration?')) return;
    try {
      await apiClient.delete(`/providers/${id}`);
      setProviders(providers.filter((p) => p.id !== id));
      showSuccess('Provider deleted');
    } catch (err: any) {
      setError(apiClient.handleError(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Navbar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: '#fff',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Back to Editor
          </button>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            AI Provider Orchestration
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>{user?.email}</span>
          <button
            onClick={logout}
            style={{
              padding: '6px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>
                Configured AI Models & Providers
              </h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                Bring your own API keys. All keys are encrypted at rest with AES-256-GCM.
              </p>
            </div>

            <button
              onClick={() => {
                if (showAddForm) {
                  setShowAddForm(false);
                  setEditingProviderId(null);
                } else {
                  setEditingProviderId(null);
                  setFormData({ name: '', type: '', apiKey: '', baseUrl: '', modelId: '' });
                  setShowAddForm(true);
                }
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: showAddForm ? '#64748b' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              {showAddForm ? <X size={16} /> : <Plus size={16} />}
              {showAddForm ? 'Cancel' : 'Add New Provider'}
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div
              style={{
                padding: '12px 18px',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                padding: '12px 18px',
                background: '#ecfdf5',
                color: '#065f46',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle size={18} /> {successMessage}
            </div>
          )}

          {/* Add / Edit Form Modal Card */}
          {showAddForm && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '28px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                  {editingProviderId ? 'Edit Provider Configuration' : 'Connect New AI Provider'}
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      Provider Type {!editingProviderId && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleTypeSelect(e.target.value)}
                      disabled={!!editingProviderId}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: editingProviderId ? '#f1f5f9' : '#fff',
                      }}
                    >
                      <option value="">-- Choose Provider Type --</option>
                      {providerTypes.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      Display Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Production Groq Fast"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      API Key {editingProviderId ? '(Leave empty to keep existing key)' : !['ollama', 'lmstudio'].includes(formData.type) && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder={editingProviderId ? '•••••••••••• (Unchanged)' : 'Enter API Key (e.g. gsk_...)'}
                      required={!editingProviderId && !['ollama', 'lmstudio'].includes(formData.type)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      Base URL (Optional override)
                    </label>
                    <input
                      type="text"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                      placeholder="e.g. https://api.groq.com/openai/v1"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Model Identifier <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.modelId}
                    onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                    placeholder="e.g. qwen/qwen3.8-27b or gpt-4o-mini"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Recommended for Groq: <code>qwen/qwen3.8-27b</code> • OpenAI: <code>gpt-3.5-turbo</code> or <code>gpt-4o</code>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 24px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#10b981',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    {editingProviderId ? 'Update Configuration' : 'Save Provider'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: '#475569',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Providers List Cards */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              Loading providers...
            </div>
          ) : providers.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
              }}
            >
              <Cpu size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>No Providers Configured</h3>
              <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>
                Add your first AI provider key to begin paraphrasing.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#10b981',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Groq or OpenAI
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {providers.map((p) => {
                const isTesting = testingId === p.id;
                const result = testResult[p.id];
                return (
                  <div
                    key={p.id}
                    style={{
                      background: '#ffffff',
                      border: p.isDefault ? '2px solid #10b981' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{p.name}</span>
                        {p.isDefault && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: '#ecfdf5',
                              color: '#059669',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1px solid #d1fae5',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Star size={12} /> DEFAULT
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {p.type}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '16px' }}>
                        <span>
                          Model: <strong style={{ color: '#0f172a' }}>{p.modelId}</strong>
                        </span>
                        {p.baseUrl && (
                          <span>
                            URL: <code>{p.baseUrl}</code>
                          </span>
                        )}
                      </div>

                      {result && (
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: result.success ? '#059669' : '#dc2626',
                            marginTop: '2px',
                          }}
                        >
                          {result.success ? '✓' : '✗'} {result.message}
                          {result.latency && ` (${result.latency}ms)`}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleTestConnection(p.id)}
                        disabled={isTesting}
                        title="Ping provider and verify credentials"
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: isTesting ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <RotateCw size={13} className={isTesting ? 'spinner' : ''} /> Test Ping
                      </button>

                      <button
                        onClick={() => handleTestGeneration(p.id)}
                        disabled={isTesting}
                        title="Run an actual test AI generation"
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: isTesting ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Play size={13} /> Test Gen
                      </button>

                      {!p.isDefault && (
                        <button
                          onClick={() => handleSetDefault(p.id)}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            background: '#fff',
                            color: '#059669',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Make Default
                        </button>
                      )}

                      <button
                        onClick={() => handleEdit(p)}
                        title="Edit provider configuration"
                        style={{
                          padding: '6px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        title="Delete provider"
                        style={{
                          padding: '6px',
                          border: '1px solid #fee2e2',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#ef4444',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

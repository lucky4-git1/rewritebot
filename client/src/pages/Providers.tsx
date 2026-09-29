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
  List,
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

  const [viewingModelsProvider, setViewingModelsProvider] = useState<Provider | null>(null);
  const [fetchedModels, setFetchedModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const handleFetchModels = async (provider: Provider) => {
    try {
      setViewingModelsProvider(provider);
      setLoadingModels(true);
      setFetchedModels([]);
      const data = await apiClient.get<any[]>(`/providers/${provider.id}/models`);
      setFetchedModels(data || []);
      setLoadingModels(false);
    } catch (err: any) {
      setLoadingModels(false);
      setError(err.message || 'Failed to fetch models from provider');
    }
  };

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
      nvidia: 'meta/llama-3.2-11b-vision-instruct',
      ollama: 'llama3',
      anthropic: 'claude-3-haiku-20240307',
    };

    setFormData({
      ...formData,
      type,
      name: formData.name || (selected ? `${selected.name} Provider` : type),
      modelId: defaultModels[type] || formData.modelId || 'gpt-3.5-turbo',
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#f8fafc', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Navbar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <ArrowLeft size={16} /> <span className="hide-on-mobile">Back to </span>Editor
          </button>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
            AI Providers
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="hide-on-mobile" style={{ fontSize: '13px', color: '#64748b' }}>{user?.email}</span>
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
      <main style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>
                Configured AI Models & Providers
              </h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
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
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: showAddForm ? '#64748b' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '13px',
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
                <div className="responsive-grid-2" style={{ marginBottom: '16px' }}>
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

                <div className="responsive-grid-2" style={{ marginBottom: '16px' }}>
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
                    placeholder="e.g. meta/llama-3.2-11b-vision-instruct or qwen/qwen3.8-27b"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                  {formData.type === 'nvidia' && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                        Verified working NVIDIA model:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        {[
                          { id: 'meta/llama-3.2-11b-vision-instruct', label: 'Llama 3.2 11B Vision (Working & Verified)' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, modelId: m.id })}
                            style={{
                              border: formData.modelId === m.id ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                              background: formData.modelId === m.id ? '#ecfdf5' : '#f8fafc',
                              color: formData.modelId === m.id ? '#059669' : '#334155',
                              borderRadius: '14px',
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            ✓ {m.label}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.4 }}>
                        * Note: NVIDIA personal developer API keys only have <code>meta/llama-3.2-11b-vision-instruct</code> enabled by default. Other models return <code>404 (no body)</code> unless organization access is granted by NVIDIA.
                      </div>
                    </div>
                  )}
                  {formData.type === 'groq' && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                        Tested & recommended Groq models:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        {[
                          { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Versatile)' },
                          { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Instant)' },
                          { id: 'qwen/qwen3.8-27b', label: 'Qwen 3.8 27B' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, modelId: m.id })}
                            style={{
                              border: formData.modelId === m.id ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                              background: formData.modelId === m.id ? '#ecfdf5' : '#f8fafc',
                              color: formData.modelId === m.id ? '#059669' : '#334155',
                              borderRadius: '14px',
                              padding: '3px 10px',
                              fontSize: '11px',
                              fontWeight: formData.modelId === m.id ? 600 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {formData.type === 'openai' && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                        Tested & recommended OpenAI models:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        {[
                          { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Default)' },
                          { id: 'gpt-4o', label: 'GPT-4o' },
                          { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, modelId: m.id })}
                            style={{
                              border: formData.modelId === m.id ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                              background: formData.modelId === m.id ? '#ecfdf5' : '#f8fafc',
                              color: formData.modelId === m.id ? '#059669' : '#334155',
                              borderRadius: '14px',
                              padding: '3px 10px',
                              fontSize: '11px',
                              fontWeight: formData.modelId === m.id ? 600 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
                    className="provider-card-responsive"
                    style={{
                      background: '#ffffff',
                      border: p.isDefault ? '2px solid #10b981' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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

                      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span>
                          Model: <strong style={{ color: '#0f172a' }}>{p.modelId}</strong>
                        </span>
                        {p.baseUrl && (
                          <span style={{ wordBreak: 'break-all' }}>
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
                    <div className="provider-actions-responsive">
                      <button
                        onClick={() => handleTestConnection(p.id)}
                        disabled={isTesting}
                        title="Ping provider and verify credentials"
                        style={{
                          padding: '7px 12px',
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
                          padding: '7px 12px',
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
                            padding: '7px 12px',
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
                        onClick={() => handleFetchModels(p)}
                        title="Fetch available models from API"
                        style={{
                          padding: '7px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <List size={13} /> Models
                      </button>

                      <button
                        onClick={() => handleEdit(p)}
                        title="Edit provider configuration"
                        style={{
                          padding: '7px 10px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#475569',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        title="Delete provider"
                        style={{
                          padding: '7px 10px',
                          border: '1px solid #fee2e2',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
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

      {/* View Live Models Modal */}
      {viewingModelsProvider && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                  Live Available Models ({viewingModelsProvider.name})
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Current active model: <code>{viewingModelsProvider.modelId}</code>
                </div>
              </div>
              <button
                onClick={() => setViewingModelsProvider(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {loadingModels ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  <RotateCw size={24} className="spinner" style={{ marginBottom: '8px' }} />
                  <div>Querying {viewingModelsProvider.type} API for models...</div>
                </div>
              ) : fetchedModels.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px' }}>
                  No models returned by API or API key does not have model listing permissions.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {fetchedModels.map((m: any) => {
                    const isSelected = viewingModelsProvider.modelId === m.modelId;
                    return (
                      <div
                        key={m.modelId}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                          background: isSelected ? '#ecfdf5' : '#f8fafc',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 500, color: '#0f172a', wordBreak: 'break-all' }}>
                          {m.displayName || m.modelId}
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await apiClient.patch(`/providers/${viewingModelsProvider.id}`, { modelId: m.modelId });
                              setProviders(providers.map((p) => p.id === viewingModelsProvider.id ? { ...p, modelId: m.modelId } : p));
                              setViewingModelsProvider(null);
                              showSuccess(`Active model updated to "${m.modelId}"`);
                            } catch (err: any) {
                              setError(err.message || 'Failed to update model');
                            }
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: isSelected ? 'none' : '1px solid #cbd5e1',
                            background: isSelected ? '#10b981' : '#fff',
                            color: isSelected ? '#fff' : '#334155',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setViewingModelsProvider(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { BrandLogo } from '../components/BrandLogo';
import { ThemeToggle } from '../components/ThemeToggle';
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
  Edit2,
  X,
  List,
  ExternalLink,
  Key,
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--rb-background)', color: 'var(--rb-text)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Navbar */}
      <header
        style={{
          background: 'var(--rb-surface)',
          borderBottom: '1px solid var(--rb-border)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BrandLogo variant="compact" height={32} to="/app" />
          <button
            onClick={() => navigate('/app')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              border: '1px solid var(--rb-border)',
              borderRadius: '6px',
              background: 'var(--rb-surface-cream)',
              color: 'var(--rb-text)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> <span className="hide-on-mobile">Back to </span>Editor
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <span className="hide-on-mobile" style={{ fontSize: '13px', color: 'var(--rb-text-secondary)' }}>{user?.email}</span>
          <button
            onClick={logout}
            style={{
              padding: '6px 14px',
              border: '1px solid var(--rb-border)',
              borderRadius: '6px',
              background: 'var(--rb-surface)',
              color: 'var(--rb-text)',
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
              <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--rb-text)' }}>
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
                background: showAddForm ? '#64748b' : 'linear-gradient(135deg, #670626 0%, #4e041c 100%)',
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
                background: 'var(--rb-surface)',
                border: '1px solid var(--rb-border)',
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
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--rb-text)', marginBottom: '6px' }}>
                      Provider Type {!editingProviderId && <span style={{ color: 'var(--rb-danger)' }}>*</span>}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleTypeSelect(e.target.value)}
                      disabled={!!editingProviderId}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--rb-border)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: editingProviderId ? 'var(--rb-surface-muted)' : 'var(--rb-surface-cream)',
                        color: 'var(--rb-text)',
                      }}
                    >
                      <option value="" style={{ background: 'var(--rb-surface)', color: 'var(--rb-text)' }}>-- Choose Provider Type --</option>
                      {providerTypes.map((t) => (
                        <option key={t.type} value={t.type} style={{ background: 'var(--rb-surface)', color: 'var(--rb-text)' }}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--rb-text)', marginBottom: '6px' }}>
                      Display Name <span style={{ color: 'var(--rb-danger)' }}>*</span>
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
                        border: '1px solid var(--rb-border)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: 'var(--rb-surface-cream)',
                        color: 'var(--rb-text)',
                      }}
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--rb-text)', marginBottom: '6px' }}>
                      API Key {editingProviderId ? '(Leave empty to keep existing key)' : !['ollama', 'lmstudio'].includes(formData.type) && <span style={{ color: 'var(--rb-danger)' }}>*</span>}
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
                        border: '1px solid var(--rb-border)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: 'var(--rb-surface-cream)',
                        color: 'var(--rb-text)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--rb-text)', marginBottom: '6px' }}>
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
                        border: '1px solid var(--rb-border)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: 'var(--rb-surface-cream)',
                        color: 'var(--rb-text)',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--rb-text)', marginBottom: '6px' }}>
                     Model Identifier <span style={{ color: 'var(--rb-danger)' }}>*</span>
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
                      border: '1px solid var(--rb-border)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'var(--rb-surface-cream)',
                      color: 'var(--rb-text)',
                    }}
                  />
                  {formData.type === 'nvidia' && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)', marginBottom: '6px' }}>
                        NVIDIA Model Options:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        {[
                          { id: 'meta/llama-3.2-11b-vision-instruct', label: 'Llama 3.2 11B Vision (Verified)' },
                          { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B' },
                          { id: 'mistralai/mistral-nemotron', label: 'Mistral Nemotron' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, modelId: m.id })}
                            style={{
                              border: formData.modelId === m.id ? '1.5px solid var(--rb-accent)' : '1px solid var(--rb-border)',
                              background: formData.modelId === m.id ? 'var(--rb-primary-light)' : 'var(--rb-surface-cream)',
                              color: formData.modelId === m.id ? 'var(--rb-accent)' : 'var(--rb-text)',
                              borderRadius: '14px',
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: formData.modelId === m.id ? 600 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--rb-text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                        * <code>meta/llama-3.2-11b-vision-instruct</code> is confirmed working on standard developer accounts. For <code>GPT-OSS-20B</code> and <code>Mistral Nemotron</code>, you can test if your key has public endpoint entitlements using the <strong>Test Gen</strong> button.
                      </div>
                    </div>
                  )}
                  {formData.type === 'groq' && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)', marginBottom: '6px' }}>
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
                              border: formData.modelId === m.id ? '1.5px solid var(--rb-accent)' : '1px solid var(--rb-border)',
                              background: formData.modelId === m.id ? 'var(--rb-primary-light)' : 'var(--rb-surface-cream)',
                              color: formData.modelId === m.id ? 'var(--rb-accent)' : 'var(--rb-text)',
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
                      <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)', marginBottom: '6px' }}>
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
                              border: formData.modelId === m.id ? '1.5px solid var(--rb-accent)' : '1px solid var(--rb-border)',
                              background: formData.modelId === m.id ? 'var(--rb-primary-light)' : 'var(--rb-surface-cream)',
                              color: formData.modelId === m.id ? 'var(--rb-accent)' : 'var(--rb-text)',
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
                      background: 'var(--rb-accent)',
                      color: '#251F20',
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
                      border: '1px solid var(--rb-border)',
                      background: 'var(--rb-surface-cream)',
                      color: 'var(--rb-text)',
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
                background: 'var(--rb-surface)',
                border: '1px solid var(--rb-border)',
                borderRadius: '16px',
                padding: '36px 28px',
                boxShadow: 'var(--rb-shadow)',
              }}
            >
              <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--rb-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <Key size={26} color="var(--rb-primary)" />
                </div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 700, color: 'var(--rb-text)' }}>
                  Connect Your AI Provider
                </h3>
                <p style={{ margin: '0 0 20px 0', color: 'var(--rb-text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                  RewriteBot is 100% BYOK (Bring-Your-Own-Key). Plug in your own API key to get blazing fast, unrestricted paraphrasing with zero subscription markups.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  style={{
                    padding: '11px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #670626 0%, #4e041c 100%)',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(103, 6, 38, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Plus size={16} />
                  <span>Add Your First Provider</span>
                </button>
              </div>

              {/* Step-by-Step Provider Guide Cards */}
              <div style={{ borderTop: '1px solid var(--rb-border)', paddingTop: '28px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: 'var(--rb-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Where to get free API keys & how to connect:
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {/* Groq Card */}
                  <div
                    style={{
                      background: 'var(--rb-surface-cream)',
                      border: '1px solid var(--rb-border)',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rb-text)' }}>⚡ Groq (Recommended)</span>
                        <span className="provider-tag-green">100% Free & Fastest</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--rb-text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
                        Sub-second paraphrasing on LPUs. Generous free tier with no credit card required.
                      </p>
                      <ol style={{ fontSize: '12px', color: 'var(--rb-text-muted)', paddingLeft: '18px', margin: '0 0 14px', lineHeight: 1.6 }}>
                        <li>Create a free account at <strong>console.groq.com</strong></li>
                        <li>Go to <strong>API Keys</strong> → Create API Key</li>
                        <li>Recommended Model: <code>llama-3.3-70b-versatile</code></li>
                      </ol>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--rb-primary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        Get Key <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => {
                          handleTypeSelect('groq');
                          setShowAddForm(true);
                        }}
                        style={{
                          marginLeft: 'auto',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--rb-border)',
                          background: 'var(--rb-surface)',
                          color: 'var(--rb-text)',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Connect Groq
                      </button>
                    </div>
                  </div>

                  {/* NVIDIA NIM Card */}
                  <div
                    style={{
                      background: 'var(--rb-surface-cream)',
                      border: '1px solid var(--rb-border)',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rb-text)' }}>🟢 NVIDIA NIM</span>
                        <span className="provider-tag-emerald">1,000 Free Credits</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--rb-text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
                        High-quality Llama-3.2 NIM microservices hosted on NVIDIA DGX cloud.
                      </p>
                      <ol style={{ fontSize: '12px', color: 'var(--rb-text-muted)', paddingLeft: '18px', margin: '0 0 14px', lineHeight: 1.6 }}>
                        <li>Sign up at <strong>build.nvidia.com</strong></li>
                        <li>Click <strong>Get API Key</strong> in any model page</li>
                        <li>Model: <code>meta/llama-3.2-11b-vision-instruct</code></li>
                      </ol>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <a
                        href="https://build.nvidia.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--rb-primary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        Get Key <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => {
                          handleTypeSelect('nvidia');
                          setShowAddForm(true);
                        }}
                        style={{
                          marginLeft: 'auto',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--rb-border)',
                          background: 'var(--rb-surface)',
                          color: 'var(--rb-text)',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Connect NVIDIA
                      </button>
                    </div>
                  </div>

                  {/* OpenAI / OpenRouter Card */}
                  <div
                    style={{
                      background: 'var(--rb-surface-cream)',
                      border: '1px solid var(--rb-border)',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rb-text)' }}>🌐 OpenRouter / OpenAI</span>
                        <span className="provider-tag-blue">Multi-Model</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--rb-text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
                        Access OpenAI, Claude, DeepSeek, or 200+ models with one unified API key.
                      </p>
                      <ol style={{ fontSize: '12px', color: 'var(--rb-text-muted)', paddingLeft: '18px', margin: '0 0 14px', lineHeight: 1.6 }}>
                        <li>Sign up at <strong>openrouter.ai</strong> or <strong>platform.openai.com</strong></li>
                        <li>Create an API key in Account Settings</li>
                        <li>Paste your key into RewriteBot</li>
                      </ol>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--rb-primary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        OpenRouter <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => {
                          handleTypeSelect('openrouter');
                          setShowAddForm(true);
                        }}
                        style={{
                          marginLeft: 'auto',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--rb-border)',
                          background: 'var(--rb-surface)',
                          color: 'var(--rb-text)',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Connect OpenRouter
                      </button>
                    </div>
                  </div>

                  {/* Local Ollama Card */}
                  <div
                    style={{
                      background: 'var(--rb-surface-cream)',
                      border: '1px solid var(--rb-border)',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rb-text)' }}>💻 Ollama (Local AI)</span>
                        <span className="provider-tag-purple">100% Private Offline</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--rb-text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
                        Run Llama 3 or Mistral directly on your local machine with zero external API calls.
                      </p>
                      <ol style={{ fontSize: '12px', color: 'var(--rb-text-muted)', paddingLeft: '18px', margin: '0 0 14px', lineHeight: 1.6 }}>
                        <li>Download Ollama from <strong>ollama.ai</strong></li>
                        <li>Run in terminal: <code>ollama run llama3</code></li>
                        <li>Base URL: <code>http://localhost:11434/v1</code> (No API key needed)</li>
                      </ol>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <a
                        href="https://ollama.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--rb-primary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        Download Ollama <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => {
                          handleTypeSelect('ollama');
                          setShowAddForm(true);
                        }}
                        style={{
                          marginLeft: 'auto',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--rb-border)',
                          background: 'var(--rb-surface)',
                          color: 'var(--rb-text)',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Connect Ollama
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
                      background: 'var(--rb-surface)',
                      border: p.isDefault ? '2px solid var(--rb-accent)' : '1px solid var(--rb-border)',
                      borderRadius: '12px',
                      padding: '18px',
                      boxShadow: 'var(--rb-shadow)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--rb-text)' }}>{p.name}</span>
                        {p.isDefault && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: 'var(--rb-accent-light)',
                              color: 'var(--rb-accent-dark)',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1px solid var(--rb-accent)',
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
                            background: 'var(--rb-surface-muted)',
                            color: 'var(--rb-text)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--rb-border)',
                          }}
                        >
                          {p.type}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: 'var(--rb-text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span>
                          Model: <strong style={{ color: 'var(--rb-text)' }}>{p.modelId}</strong>
                        </span>
                        {p.baseUrl && (
                          <span style={{ wordBreak: 'break-all' }}>
                            URL: <code style={{ background: 'var(--rb-surface-cream)', color: 'var(--rb-accent)', padding: '2px 6px', borderRadius: '4px' }}>{p.baseUrl}</code>
                          </span>
                        )}
                      </div>

                      {result && (
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: result.success ? 'var(--rb-success)' : 'var(--rb-danger)',
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
                          border: '1px solid var(--rb-border)',
                          borderRadius: '6px',
                          background: 'var(--rb-surface-cream)',
                          color: 'var(--rb-text)',
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
                          border: '1px solid var(--rb-border)',
                          borderRadius: '6px',
                          background: 'var(--rb-surface-cream)',
                          color: 'var(--rb-text)',
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
                            border: '1px solid var(--rb-border)',
                            borderRadius: '6px',
                            background: 'var(--rb-surface-cream)',
                            color: 'var(--rb-accent)',
                            fontSize: '12px',
                            fontWeight: 600,
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
                          border: '1px solid var(--rb-border)',
                          borderRadius: '6px',
                          background: 'var(--rb-surface-cream)',
                          color: 'var(--rb-text)',
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
                          border: '1px solid var(--rb-border)',
                          borderRadius: '6px',
                          background: 'var(--rb-surface-cream)',
                          color: 'var(--rb-text)',
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
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          background: 'var(--rb-surface-cream)',
                          color: 'var(--rb-danger)',
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
              background: 'var(--rb-surface)',
              borderRadius: '12px',
              border: '1px solid var(--rb-border)',
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
                borderBottom: '1px solid var(--rb-border)',
                background: 'var(--rb-surface-cream)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--rb-text)' }}>
                  Live Available Models ({viewingModelsProvider.name})
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)', marginTop: '2px' }}>
                  Current active model: <code style={{ color: 'var(--rb-accent)' }}>{viewingModelsProvider.modelId}</code>
                </div>
              </div>
              <button
                onClick={() => setViewingModelsProvider(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rb-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {loadingModels ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--rb-text-muted)' }}>
                  <RotateCw size={24} className="spinner" style={{ marginBottom: '8px' }} />
                  <div>Querying {viewingModelsProvider.type} API for models...</div>
                </div>
              ) : fetchedModels.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--rb-text-muted)', fontSize: '14px' }}>
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
                          border: isSelected ? '1.5px solid var(--rb-accent)' : '1px solid var(--rb-border)',
                          background: isSelected ? 'var(--rb-primary-light)' : 'var(--rb-surface-cream)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 500, color: 'var(--rb-text)', wordBreak: 'break-all' }}>
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
                            border: isSelected ? 'none' : '1px solid var(--rb-border)',
                            background: isSelected ? 'var(--rb-accent)' : 'var(--rb-surface)',
                            color: isSelected ? '#251F20' : 'var(--rb-text)',
                            fontSize: '12px',
                            fontWeight: 600,
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

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--rb-border)', background: 'var(--rb-surface-cream)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setViewingModelsProvider(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--rb-border)',
                  background: 'var(--rb-surface)',
                  color: 'var(--rb-text)',
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

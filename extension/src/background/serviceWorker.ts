/**
 * RewriteBot Background Service Worker (Manifest V3)
 * Manages right-click context menu, shortcut commands, user auth, and API routing.
 */

const DEFAULT_SERVER_URL = 'http://localhost:3000/api/v1';

// Initialize context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'rewritebot-selection',
    title: 'Rewrite with RewriteBot (Alt+R)',
    contexts: ['selection'],
  });
  console.log('[RewriteBot] Extension initialized & context menu registered');
});

// Helper to safely send message to a tab, injecting content script if not already present
async function sendSafeTabMessage(tabId: number, message: any) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch (_err) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
      });
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tabId, message);
        } catch (retryErr) {
          console.warn('[RewriteBot] Content script communication ignored on restricted page:', retryErr);
        }
      }, 100);
    } catch (injectErr) {
      console.warn('[RewriteBot] Cannot inject into protected browser page:', injectErr);
    }
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (info.menuItemId === 'rewritebot-selection' && tab?.id) {
    sendSafeTabMessage(tab.id, {
      type: 'REWRITE_TRIGGER',
      text: info.selectionText,
    });
  }
});

// Handle global keyboard shortcuts (Alt+R)
chrome.commands.onCommand.addListener((command: string) => {
  if (command === 'rewrite-selection') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      if (tabs[0]?.id) {
        sendSafeTabMessage(tabs[0].id, {
          type: 'REWRITE_SHORTCUT_TRIGGER',
        });
      }
    });
  }
});

// Helper to get normalized server URL
async function getServerUrl(): Promise<string> {
  const syncStorage = await chrome.storage.local.get(['serverUrl']);
  const rawUrl = syncStorage.serverUrl || DEFAULT_SERVER_URL;
  return rawUrl.replace(/\/+$/, '');
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener(
  (request: any, _sender: chrome.runtime.MessageSender, sendResponse: (res: any) => void) => {
    switch (request.type) {
      case 'EXECUTE_PARAPHRASE':
        handleParaphraseRequest(request.payload)
          .then((data) => sendResponse({ success: true, data }))
          .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;

      case 'AUTH_LOGIN':
        handleLogin(request.payload)
          .then((data) => sendResponse({ success: true, data }))
          .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;

      case 'AUTH_LOGOUT':
        handleLogout()
          .then(() => sendResponse({ success: true }))
          .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;

      case 'AUTH_GET_SESSION':
        getSession()
          .then((data) => sendResponse({ success: true, data }))
          .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;

      case 'FETCH_PROVIDERS':
        fetchProviders()
          .then((providers) => sendResponse({ success: true, providers }))
          .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;

      case 'SYNC_ACTIVE_TAB_AUTH':
        syncActiveTabAuth()
          .then((data) => sendResponse({ success: true, data }))
          .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;

      default:
        break;
    }
  }
);

/**
 * Handles user login with RewriteBot account
 */
async function handleLogin(payload: { email: string; password: string }) {
  const serverUrl = await getServerUrl();

  let response: Response;
  try {
    response = await fetch(`${serverUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email.trim(),
        password: payload.password,
      }),
    });
  } catch (err: any) {
    throw new Error(`Cannot reach RewriteBot server at ${serverUrl}. Make sure the server is running.`);
  }

  const resData = await response.json().catch(() => ({}));
  if (!response.ok || !resData.success) {
    throw new Error(resData.error?.message || resData.message || 'Login failed. Please check your credentials.');
  }

  const { user, accessToken, refreshToken } = resData.data;

  // Save auth info in extension storage
  await chrome.storage.local.set({
    authToken: accessToken,
    refreshToken: refreshToken || '',
    currentUser: user,
    isLoggedIn: true,
  });

  // Automatically fetch user's configured AI providers
  let providers: any[] = [];
  try {
    providers = await fetchProviders(accessToken);
  } catch (err) {
    console.warn('[RewriteBot] Failed to auto-fetch providers after login:', err);
  }

  return { user, providers, accessToken };
}

/**
 * Clears user session
 */
async function handleLogout() {
  await chrome.storage.local.remove([
    'authToken',
    'refreshToken',
    'currentUser',
    'isLoggedIn',
    'providers',
    'selectedProviderId',
    'selectedModelId',
  ]);
}

/**
 * Gets current session and stored preferences
 */
async function getSession() {
  const syncStorage = await chrome.storage.local.get([
    'serverUrl',
    'authToken',
    'currentUser',
    'isLoggedIn',
    'providers',
    'selectedProviderId',
    'selectedModelId',
  ]);

  return {
    serverUrl: syncStorage.serverUrl || DEFAULT_SERVER_URL,
    isLoggedIn: Boolean(syncStorage.isLoggedIn && syncStorage.authToken),
    user: syncStorage.currentUser || null,
    authToken: syncStorage.authToken || '',
    providers: syncStorage.providers || [],
    selectedProviderId: syncStorage.selectedProviderId || '',
    selectedModelId: syncStorage.selectedModelId || '',
  };
}

/**
 * Fetches user's configured AI providers from backend
 */
async function fetchProviders(tokenOverride?: string) {
  const serverUrl = await getServerUrl();
  const syncStorage = await chrome.storage.local.get(['authToken']);
  const token = tokenOverride || syncStorage.authToken;

  if (!token) {
    return [];
  }

  const response = await fetch(`${serverUrl}/providers`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  const providers = result.data || [];

  await chrome.storage.local.set({ providers });
  return providers;
}

/**
 * Checks active tab's localStorage for accessToken (e.g. if user is logged into web app)
 */
async function syncActiveTabAuth() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (!activeTab?.id) {
    throw new Error('No active tab found');
  }

  // Inject small script to extract accessToken from localStorage
  const results = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () => {
      try {
        return localStorage.getItem('accessToken');
      } catch (_e) {
        return null;
      }
    },
  });

  const extractedToken = results?.[0]?.result;
  if (!extractedToken) {
    throw new Error('No active login session found on the current web tab. Please log in directly.');
  }

  const serverUrl = await getServerUrl();
  // Fetch user info with this token
  const meResponse = await fetch(`${serverUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${extractedToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!meResponse.ok) {
    throw new Error('Extracted token has expired or is invalid.');
  }

  const meData = await meResponse.json();
  const user = meData.data;

  // Save auth
  await chrome.storage.local.set({
    authToken: extractedToken,
    currentUser: user,
    isLoggedIn: true,
  });

  const providers = await fetchProviders(extractedToken);
  return { user, providers, accessToken: extractedToken };
}

/**
 * Executes rewrite against RewriteBot API endpoint
 */
async function handleParaphraseRequest(payload: {
  text: string;
  mode?: string;
  synonymLevel?: number;
}) {
  const syncStorage = await chrome.storage.local.get([
    'serverUrl',
    'authToken',
    'selectedProviderId',
    'selectedModelId',
  ]);
  const serverUrl = await getServerUrl();
  const token = syncStorage.authToken || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const reqBody: Record<string, any> = {
    text: payload.text,
    mode: payload.mode || 'standard',
    synonymLevel: payload.synonymLevel ?? 2,
    frozenTerms: [],
    plagiarismGuard: true,
  };

  if (syncStorage.selectedProviderId && typeof syncStorage.selectedProviderId === 'string' && syncStorage.selectedProviderId.trim()) {
    reqBody.providerId = syncStorage.selectedProviderId.trim();
  }
  if (syncStorage.selectedModelId && typeof syncStorage.selectedModelId === 'string' && syncStorage.selectedModelId.trim()) {
    reqBody.modelId = syncStorage.selectedModelId.trim();
  }

  let response: Response;
  try {
    response = await fetch(`${serverUrl}/paraphrase`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reqBody),
    });
  } catch (netErr: any) {
    throw new Error(`Cannot connect to RewriteBot backend at ${serverUrl}. Please ensure server is running.`);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || `RewriteBot server returned status ${response.status}`);
  }

  const result = await response.json();
  return result.data || result;
}

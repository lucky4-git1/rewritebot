/**
 * RewriteBot Background Service Worker (Manifest V3)
 * Manages right-click context menu, shortcut commands, and API routing.
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

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (info.menuItemId === 'rewritebot-selection' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
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
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'REWRITE_SHORTCUT_TRIGGER',
        });
      }
    });
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (res: any) => void) => {
  if (request.type === 'EXECUTE_PARAPHRASE') {
    handleParaphraseRequest(request.payload)
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for asynchronous response
  }
});

/**
 * Executes rewrite against RewriteBot API endpoint
 */
async function handleParaphraseRequest(payload: {
  text: string;
  mode?: string;
  synonymLevel?: number;
}) {
  const syncStorage = await chrome.storage.local.get(['serverUrl', 'authToken', 'selectedProviderId', 'selectedModelId']);
  const serverUrl = syncStorage.serverUrl || DEFAULT_SERVER_URL;
  const token = syncStorage.authToken || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${serverUrl}/paraphrase`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      text: payload.text,
      mode: payload.mode || 'standard',
      synonymLevel: payload.synonymLevel ?? 3,
      frozenTerms: [],
      plagiarismGuard: true,
      providerId: syncStorage.selectedProviderId,
      modelId: syncStorage.selectedModelId,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `RewriteBot server returned status ${response.status}`);
  }

  const result = await response.json();
  return result.data || result;
}

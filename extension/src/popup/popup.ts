/**
 * RewriteBot Popup Studio Script
 * Manages in-popup paraphrasing, user account display, and AI provider selection.
 */

let selectedMode = 'standard';

document.addEventListener('DOMContentLoaded', async () => {
  // Elements: Studio
  const inputEl = document.getElementById('input-text') as HTMLTextAreaElement;
  const outputEl = document.getElementById('output-text') as HTMLDivElement;
  const btnRewrite = document.getElementById('btn-rewrite') as HTMLButtonElement;
  const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
  const modeButtons = document.querySelectorAll<HTMLButtonElement>('.mode-btn');

  // Elements: Account
  const loggedInCard = document.getElementById('logged-in-card') as HTMLDivElement;
  const loggedOutCard = document.getElementById('logged-out-card') as HTMLDivElement;
  const userAvatar = document.getElementById('user-avatar') as HTMLDivElement;
  const userName = document.getElementById('user-name') as HTMLSpanElement;
  const userEmail = document.getElementById('user-email') as HTMLSpanElement;
  const providerSelect = document.getElementById('provider-select') as HTMLSelectElement;
  const btnLogout = document.getElementById('btn-logout') as HTMLButtonElement;

  // Elements: Login Form
  const authEmailInput = document.getElementById('auth-email') as HTMLInputElement;
  const authPasswordInput = document.getElementById('auth-password') as HTMLInputElement;
  const btnSubmitLogin = document.getElementById('btn-submit-login') as HTMLButtonElement;
  const btnSyncTab = document.getElementById('btn-sync-tab') as HTMLButtonElement;
  const authMsg = document.getElementById('auth-msg') as HTMLDivElement;

  // Elements: Server
  const serverStatusEl = document.getElementById('server-status');
  const changeServerEl = document.getElementById('change-server');

  // Load session directly on popup open
  await checkSessionState();

  // Mode button switcher
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMode = btn.dataset.mode || 'standard';
      if (inputEl.value.trim()) {
        triggerRewrite();
      }
    });
  });

  // Paraphrase button
  btnRewrite.addEventListener('click', triggerRewrite);

  // Copy button
  btnCopy.addEventListener('click', () => {
    const text = outputEl.innerText;
    if (text && text !== 'Rewritten output will appear here…') {
      navigator.clipboard.writeText(text);
      btnCopy.innerText = '✓ Copied!';
      setTimeout(() => (btnCopy.innerText = '📋 Copy'), 1500);
    }
  });

  // Provider selector change
  providerSelect?.addEventListener('change', async () => {
    const selectedId = providerSelect.value;
    const syncStorage = await chrome.storage.local.get(['providers']);
    const providers = syncStorage.providers || [];
    const matched = providers.find((p: any) => p.id === selectedId);

    await chrome.storage.local.set({
      selectedProviderId: selectedId,
      selectedModelId: matched?.modelId || '',
    });
  });

  // Handle Login submission
  btnSubmitLogin?.addEventListener('click', async () => {
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;

    if (!email || !password) {
      setAuthMsg('Please enter your email and password.', 'error');
      return;
    }

    btnSubmitLogin.disabled = true;
    btnSubmitLogin.innerText = 'Signing in…';
    setAuthMsg('Connecting to RewriteBot account…', 'info');

    chrome.runtime.sendMessage(
      {
        type: 'AUTH_LOGIN',
        payload: { email, password },
      },
      (res: any) => {
        btnSubmitLogin.disabled = false;
        btnSubmitLogin.innerText = 'Log In';

        if (res?.success && res.data?.user) {
          setAuthMsg('✓ Logged in successfully!', 'success');
          renderLoggedInUI(res.data.user, res.data.providers || []);
        } else {
          setAuthMsg(res?.error || 'Invalid email or password.', 'error');
        }
      }
    );
  });

  // Handle 1-Click Sync from web tab
  btnSyncTab?.addEventListener('click', async () => {
    btnSyncTab.disabled = true;
    btnSyncTab.innerText = 'Syncing…';
    setAuthMsg('Inspecting browser tabs for RewriteBot login session…', 'info');

    chrome.runtime.sendMessage({ type: 'SYNC_ACTIVE_TAB_AUTH' }, (res: any) => {
      btnSyncTab.disabled = false;
      btnSyncTab.innerText = '⚡ 1-Click Sync';

      if (res?.success && res.data?.user) {
        setAuthMsg('✓ Synced from RewriteBot web tab!', 'success');
        renderLoggedInUI(res.data.user, res.data.providers || []);
      } else {
        setAuthMsg(res?.error || 'No active RewriteBot login session found in open tabs.', 'error');
      }
    });
  });

  // Handle Logout
  btnLogout?.addEventListener('click', async () => {
    chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' }, () => {
      renderLoggedOutUI();
    });
  });

  // Server URL display & change
  chrome.storage.local.get(['serverUrl'], (res) => {
    const currentUrl = res.serverUrl || 'http://localhost:3000/api/v1';
    if (serverStatusEl) {
      serverStatusEl.innerText = currentUrl.replace('http://', '').replace('https://', '');
    }
  });

  changeServerEl?.addEventListener('click', () => {
    chrome.storage.local.get(['serverUrl'], (res) => {
      const current = res.serverUrl || 'http://localhost:3000/api/v1';
      const newUrl = prompt('Enter RewriteBot API Server URL:', current);
      if (newUrl && newUrl.trim()) {
        chrome.storage.local.set({ serverUrl: newUrl.trim() }, () => {
          if (serverStatusEl) {
            serverStatusEl.innerText = newUrl.trim().replace('http://', '').replace('https://', '');
          }
        });
      }
    });
  });

  function setAuthMsg(msg: string, type: 'error' | 'success' | 'info') {
    if (!authMsg) return;
    authMsg.innerText = msg;
    authMsg.className = `auth-msg ${type}`;
  }

  async function checkSessionState() {
    const stored = await chrome.storage.local.get([
      'isLoggedIn',
      'currentUser',
      'providers',
      'selectedProviderId',
    ]);

    if (stored.isLoggedIn && stored.currentUser) {
      renderLoggedInUI(stored.currentUser, stored.providers || [], stored.selectedProviderId);
    } else {
      renderLoggedOutUI();
    }
  }

  function renderLoggedInUI(user: any, providers: any[], selectedProviderId?: string) {
    if (!loggedInCard || !loggedOutCard) return;

    loggedInCard.style.display = 'block';
    loggedOutCard.style.display = 'none';

    const displayName = user.name || user.email?.split('@')[0] || 'User';
    userAvatar.innerText = displayName.charAt(0).toUpperCase();
    userName.innerText = displayName;
    userEmail.innerText = user.email || '';

    // Populate providers
    providerSelect.innerHTML = '<option value="">Default AI Provider</option>';
    if (Array.isArray(providers)) {
      providers.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.modelId || p.type})`;
        if (selectedProviderId === p.id) {
          opt.selected = true;
        }
        providerSelect.appendChild(opt);
      });
    }
  }

  function renderLoggedOutUI() {
    if (!loggedInCard || !loggedOutCard) return;

    loggedInCard.style.display = 'none';
    loggedOutCard.style.display = 'block';
    authPasswordInput.value = '';
    setAuthMsg('', 'info');
  }

  async function triggerRewrite() {
    const text = inputEl.value.trim();
    if (!text) return;

    btnRewrite.disabled = true;
    btnRewrite.innerText = 'Rewriting…';
    outputEl.innerText = 'Restructuring text with RewriteBot…';

    try {
      chrome.runtime.sendMessage(
        {
          type: 'EXECUTE_PARAPHRASE',
          payload: {
            text,
            mode: selectedMode,
          },
        },
        (response: any) => {
          btnRewrite.disabled = false;
          btnRewrite.innerText = '⚡ Paraphrase';

          if (response?.success && response.data?.text) {
            outputEl.innerText = response.data.text;
          } else {
            outputEl.innerText = response?.error || 'Rewrite failed. Check RewriteBot connection.';
          }
        }
      );
    } catch (err: any) {
      btnRewrite.disabled = false;
      btnRewrite.innerText = '⚡ Paraphrase';
      outputEl.innerText = err.message || 'Error executing rewrite';
    }
  }
});

/**
 * RewriteBot Popup Studio Script
 * Manages in-popup paraphrasing, user account auth/registration, and AI key configuration.
 */

const DEFAULT_SERVER_URL = 'https://p01--rewrite--25nzx6wzv2gh.code.run/api/v1';
let selectedMode = 'standard';

document.addEventListener('DOMContentLoaded', async () => {
  // Elements: Studio
  const inputEl = document.getElementById('input-text') as HTMLTextAreaElement;
  const outputEl = document.getElementById('output-text') as HTMLDivElement;
  const btnRewrite = document.getElementById('btn-rewrite') as HTMLButtonElement;
  const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
  const modeButtons = document.querySelectorAll<HTMLButtonElement>('.mode-btn');

  // Elements: Account Views
  const loggedInCard = document.getElementById('logged-in-card') as HTMLDivElement;
  const loggedOutCard = document.getElementById('logged-out-card') as HTMLDivElement;
  const userAvatar = document.getElementById('user-avatar') as HTMLDivElement;
  const userName = document.getElementById('user-name') as HTMLSpanElement;
  const userEmail = document.getElementById('user-email') as HTMLSpanElement;
  const providerSelect = document.getElementById('provider-select') as HTMLSelectElement;
  const btnLogout = document.getElementById('btn-logout') as HTMLButtonElement;

  // Elements: Add Key Drawer
  const btnToggleKeyform = document.getElementById('btn-toggle-keyform') as HTMLButtonElement;
  const addKeyDrawer = document.getElementById('add-key-drawer') as HTMLDivElement;
  const newProviderType = document.getElementById('new-provider-type') as HTMLSelectElement;
  const newProviderKey = document.getElementById('new-provider-key') as HTMLInputElement;
  const btnSaveKey = document.getElementById('btn-save-key') as HTMLButtonElement;
  const btnCancelKey = document.getElementById('btn-cancel-key') as HTMLButtonElement;
  const keyMsg = document.getElementById('key-msg') as HTMLDivElement;

  // Elements: Auth Tabs & Forms
  const tabLogin = document.getElementById('tab-login') as HTMLDivElement;
  const tabRegister = document.getElementById('tab-register') as HTMLDivElement;
  const formLogin = document.getElementById('form-login') as HTMLDivElement;
  const formRegister = document.getElementById('form-register') as HTMLDivElement;
  const authEmailInput = document.getElementById('auth-email') as HTMLInputElement;
  const authPasswordInput = document.getElementById('auth-password') as HTMLInputElement;
  const btnSubmitLogin = document.getElementById('btn-submit-login') as HTMLButtonElement;
  const btnSyncTab = document.getElementById('btn-sync-tab') as HTMLButtonElement;
  const regNameInput = document.getElementById('reg-name') as HTMLInputElement;
  const regEmailInput = document.getElementById('reg-email') as HTMLInputElement;
  const regPasswordInput = document.getElementById('reg-password') as HTMLInputElement;
  const btnSubmitRegister = document.getElementById('btn-submit-register') as HTMLButtonElement;
  const authMsg = document.getElementById('auth-msg') as HTMLDivElement;

  // Elements: Server
  const serverStatusEl = document.getElementById('server-status');
  const changeServerEl = document.getElementById('change-server');

  // Check session immediately on mount
  await checkSessionState();

  // Tab switching: Login vs Register
  tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
    setAuthMsg('', 'info');
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formRegister.style.display = 'block';
    formLogin.style.display = 'none';
    setAuthMsg('', 'info');
  });

  // Toggle Add Key Drawer
  btnToggleKeyform?.addEventListener('click', () => {
    addKeyDrawer?.classList.toggle('open');
    setKeyMsg('', 'info');
  });

  btnCancelKey?.addEventListener('click', () => {
    addKeyDrawer?.classList.remove('open');
    newProviderKey.value = '';
    setKeyMsg('', 'info');
  });

  // Save new AI Provider Key
  btnSaveKey?.addEventListener('click', async () => {
    const key = newProviderKey.value.trim();
    const type = newProviderType.value;

    if (!key) {
      setKeyMsg('Please paste your API key.', 'error');
      return;
    }

    btnSaveKey.disabled = true;
    btnSaveKey.innerText = 'Saving…';
    setKeyMsg('Validating & encrypting credentials…', 'info');

    chrome.runtime.sendMessage(
      {
        type: 'ADD_PROVIDER',
        payload: {
          type,
          apiKey: key,
        },
      },
      (res: any) => {
        btnSaveKey.disabled = false;
        btnSaveKey.innerText = 'Save & Activate';

        if (res?.success) {
          setKeyMsg('✓ AI Key activated successfully!', 'success');
          setTimeout(() => {
            addKeyDrawer?.classList.remove('open');
            newProviderKey.value = '';
            checkSessionState();
          }, 800);
        } else {
          setKeyMsg(res?.error || 'Failed to add provider.', 'error');
        }
      }
    );
  });

  // Handle Login submission
  btnSubmitLogin?.addEventListener('click', async () => {
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;

    if (!email || !password) {
      setAuthMsg('Please enter email and password.', 'error');
      return;
    }

    btnSubmitLogin.disabled = true;
    btnSubmitLogin.innerText = 'Signing in…';
    setAuthMsg('Connecting to RewriteBot cloud…', 'info');

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

  // Handle Register submission
  btnSubmitRegister?.addEventListener('click', async () => {
    const name = regNameInput.value.trim();
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value;

    if (!name || !email || !password) {
      setAuthMsg('Please fill in all registration fields.', 'error');
      return;
    }
    if (password.length < 8) {
      setAuthMsg('Password must be at least 8 characters.', 'error');
      return;
    }

    btnSubmitRegister.disabled = true;
    btnSubmitRegister.innerText = 'Creating account…';
    setAuthMsg('Registering your RewriteBot account…', 'info');

    chrome.runtime.sendMessage(
      {
        type: 'AUTH_REGISTER',
        payload: { name, email, password },
      },
      (res: any) => {
        btnSubmitRegister.disabled = false;
        btnSubmitRegister.innerText = 'Create Free Account';

        if (res?.success && res.data?.user) {
          setAuthMsg('✓ Account created successfully!', 'success');
          renderLoggedInUI(res.data.user, []);
          // Automatically open key drawer so they can plug in their key
          addKeyDrawer?.classList.add('open');
        } else {
          setAuthMsg(res?.error || 'Registration failed. Try a different email.', 'error');
        }
      }
    );
  });

  // Handle 1-Click Sync from web tab
  btnSyncTab?.addEventListener('click', async () => {
    btnSyncTab.disabled = true;
    btnSyncTab.innerText = 'Syncing…';
    setAuthMsg('Inspecting open browser tabs for RewriteBot login…', 'info');

    chrome.runtime.sendMessage({ type: 'SYNC_ACTIVE_TAB_AUTH' }, (res: any) => {
      btnSyncTab.disabled = false;
      btnSyncTab.innerText = '⚡ 1-Click Sync';

      if (res?.success && res.data?.user) {
        setAuthMsg('✓ Synced from web tab!', 'success');
        renderLoggedInUI(res.data.user, res.data.providers || []);
      } else {
        setAuthMsg(res?.error || 'No active RewriteBot login found in open tabs.', 'error');
      }
    });
  });

  // Handle Logout
  btnLogout?.addEventListener('click', async () => {
    chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' }, () => {
      renderLoggedOutUI();
    });
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
  btnRewrite?.addEventListener('click', triggerRewrite);

  // Copy button
  btnCopy?.addEventListener('click', () => {
    const text = outputEl.innerText;
    if (text && text !== 'Rewritten output will appear here…') {
      navigator.clipboard.writeText(text);
      btnCopy.innerText = '✓ Copied!';
      setTimeout(() => (btnCopy.innerText = '📋 Copy'), 1500);
    }
  });

  // Server URL display & change
  chrome.storage.local.get(['serverUrl'], (res) => {
    const currentUrl = res.serverUrl || DEFAULT_SERVER_URL;
    if (serverStatusEl) {
      serverStatusEl.innerText = currentUrl.includes('code.run') ? 'Northflank (Cloud)' : 'Localhost';
    }
  });

  changeServerEl?.addEventListener('click', () => {
    chrome.storage.local.get(['serverUrl'], (res) => {
      const current = res.serverUrl || DEFAULT_SERVER_URL;
      const newUrl = prompt('Enter RewriteBot API Server URL:', current);
      if (newUrl && newUrl.trim()) {
        chrome.storage.local.set({ serverUrl: newUrl.trim() }, () => {
          if (serverStatusEl) {
            serverStatusEl.innerText = newUrl.includes('code.run') ? 'Northflank (Cloud)' : 'Custom';
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

  function setKeyMsg(msg: string, type: 'error' | 'success' | 'info') {
    if (!keyMsg) return;
    keyMsg.innerText = msg;
    keyMsg.className = `auth-msg ${type}`;
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

    // Populate providers dropdown
    populateProviders(providers, selectedProviderId);
  }

  function populateProviders(providers: any[], selectedProviderId?: string) {
    if (!providerSelect) return;
    providerSelect.innerHTML = '';

    if (!Array.isArray(providers) || providers.length === 0) {
      providerSelect.innerHTML = '<option value="">No custom key (Click "+ Connect AI Key")</option>';
      return;
    }

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

  function renderLoggedOutUI() {
    if (!loggedInCard || !loggedOutCard) return;

    loggedInCard.style.display = 'none';
    loggedOutCard.style.display = 'block';
    authPasswordInput.value = '';
    regPasswordInput.value = '';
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
            outputEl.innerText = response?.error || 'Rewrite failed. Check connection.';
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

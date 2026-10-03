/**
 * RewriteBot Popup Studio Script
 * Handles studio rewrites, user authentication, and provider configuration.
 */

let selectedMode = 'standard';

document.addEventListener('DOMContentLoaded', async () => {
  const inputEl = document.getElementById('input-text') as HTMLTextAreaElement;
  const outputEl = document.getElementById('output-text') as HTMLDivElement;
  const btnRewrite = document.getElementById('btn-rewrite') as HTMLButtonElement;
  const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
  const modeButtons = document.querySelectorAll<HTMLButtonElement>('.mode-btn');

  // Account UI elements
  const btnToggleAccount = document.getElementById('btn-toggle-account') as HTMLButtonElement;
  const accountBtnLabel = document.getElementById('account-btn-label') as HTMLSpanElement;
  const accountBtnIcon = document.getElementById('account-btn-icon') as HTMLSpanElement;
  const accountPanel = document.getElementById('account-panel') as HTMLDivElement;
  const loggedInView = document.getElementById('logged-in-view') as HTMLDivElement;
  const loggedOutView = document.getElementById('logged-out-view') as HTMLDivElement;
  const userDisplayName = document.getElementById('user-display-name') as HTMLElement;
  const userDisplayEmail = document.getElementById('user-display-email') as HTMLElement;
  const providerSelect = document.getElementById('provider-select') as HTMLSelectElement;
  const btnLogout = document.getElementById('btn-logout') as HTMLButtonElement;
  const authEmailInput = document.getElementById('auth-email') as HTMLInputElement;
  const authPasswordInput = document.getElementById('auth-password') as HTMLInputElement;
  const btnSubmitLogin = document.getElementById('btn-submit-login') as HTMLButtonElement;
  const btnSyncTab = document.getElementById('btn-sync-tab') as HTMLButtonElement;
  const authStatusMsg = document.getElementById('auth-status-msg') as HTMLDivElement;

  // Server elements
  const serverStatusEl = document.getElementById('server-status');
  const changeServerEl = document.getElementById('change-server');

  // Toggle account panel
  btnToggleAccount?.addEventListener('click', () => {
    accountPanel?.classList.toggle('open');
  });

  // Load session status on mount
  await refreshSessionUI();

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

  // Handle Login form submit
  btnSubmitLogin?.addEventListener('click', async () => {
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;

    if (!email || !password) {
      showAuthMsg('Please enter email and password', 'error');
      return;
    }

    btnSubmitLogin.disabled = true;
    btnSubmitLogin.innerText = 'Logging in…';
    showAuthMsg('Authenticating with RewriteBot…');

    chrome.runtime.sendMessage(
      {
        type: 'AUTH_LOGIN',
        payload: { email, password },
      },
      (res: any) => {
        btnSubmitLogin.disabled = false;
        btnSubmitLogin.innerText = 'Log In';

        if (res?.success) {
          showAuthMsg('✓ Logged in successfully!', 'success');
          setTimeout(() => {
            refreshSessionUI();
            accountPanel?.classList.remove('open');
          }, 800);
        } else {
          showAuthMsg(res?.error || 'Login failed', 'error');
        }
      }
    );
  });

  // Handle Web Tab Sync
  btnSyncTab?.addEventListener('click', async () => {
    btnSyncTab.disabled = true;
    btnSyncTab.innerText = 'Syncing…';
    showAuthMsg('Inspecting active web tab for RewriteBot credentials…');

    chrome.runtime.sendMessage({ type: 'SYNC_ACTIVE_TAB_AUTH' }, (res: any) => {
      btnSyncTab.disabled = false;
      btnSyncTab.innerText = '⚡ Sync Web Tab';

      if (res?.success) {
        showAuthMsg('✓ Synced account from web app!', 'success');
        setTimeout(() => {
          refreshSessionUI();
          accountPanel?.classList.remove('open');
        }, 800);
      } else {
        showAuthMsg(res?.error || 'Could not sync from active tab', 'error');
      }
    });
  });

  // Handle Logout
  btnLogout?.addEventListener('click', async () => {
    chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' }, () => {
      refreshSessionUI();
    });
  });

  // Server URL change handler
  chrome.storage.local.get(['serverUrl'], (res) => {
    const currentUrl = res.serverUrl || 'http://localhost:3000/api/v1';
    if (serverStatusEl) serverStatusEl.innerText = currentUrl.replace('http://', '').replace('https://', '');
  });

  changeServerEl?.addEventListener('click', () => {
    chrome.storage.local.get(['serverUrl'], (res) => {
      const current = res.serverUrl || 'http://localhost:3000/api/v1';
      const newUrl = prompt('Enter RewriteBot API Server URL:', current);
      if (newUrl && newUrl.trim()) {
        chrome.storage.local.set({ serverUrl: newUrl.trim() }, () => {
          if (serverStatusEl) serverStatusEl.innerText = newUrl.trim().replace('http://', '').replace('https://', '');
        });
      }
    });
  });

  function showAuthMsg(msg: string, type: 'error' | 'success' | 'info' = 'info') {
    if (!authStatusMsg) return;
    authStatusMsg.innerText = msg;
    authStatusMsg.className = `auth-status-msg ${type}`;
  }

  async function refreshSessionUI() {
    chrome.runtime.sendMessage({ type: 'AUTH_GET_SESSION' }, (session: any) => {
      if (!session) return;

      if (session.isLoggedIn && session.user) {
        // Update header button
        accountBtnIcon.innerText = '👤';
        accountBtnLabel.innerText = session.user.name || session.user.email.split('@')[0];

        // Show logged-in view
        loggedInView.style.display = 'block';
        loggedOutView.style.display = 'none';

        userDisplayName.innerText = session.user.name || 'User';
        userDisplayEmail.innerText = session.user.email || '';

        // Populate providers
        populateProvidersDropdown(session.providers || [], session.selectedProviderId);
      } else {
        // Show logged-out view
        accountBtnIcon.innerText = '🔑';
        accountBtnLabel.innerText = 'Log In';

        loggedInView.style.display = 'none';
        loggedOutView.style.display = 'block';
      }
    });
  }

  function populateProvidersDropdown(providers: any[], selectedId?: string) {
    if (!providerSelect) return;
    providerSelect.innerHTML = '<option value="">Default AI Provider</option>';

    providers.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.modelId || p.type})`;
      if (selectedId === p.id) {
        opt.selected = true;
      }
      providerSelect.appendChild(opt);
    });
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

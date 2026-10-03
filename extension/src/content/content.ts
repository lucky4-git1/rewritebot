/**
 * RewriteBot Content Script
 * Injects isolated Shadow DOM floating pill & rewrite card upon text selection.
 */

let activeShadowHost: HTMLElement | null = null;
let activeShadowRoot: ShadowRoot | null = null;
let currentSelectedText: string = '';
let currentTargetElement: HTMLElement | null = null;

// Clean up existing floating card
function removeActiveWidget() {
  if (activeShadowHost) {
    activeShadowHost.remove();
    activeShadowHost = null;
    activeShadowRoot = null;
  }
}

// Listen to selection changes across the webpage
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', (e) => {
  if (e.key === 'Escape') removeActiveWidget();
});

// Listen for background triggers (context menu or Alt+R)
chrome.runtime.onMessage.addListener((msg: any) => {
  if (msg.type === 'REWRITE_TRIGGER' || msg.type === 'REWRITE_SHORTCUT_TRIGGER') {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';
    if (text) {
      currentSelectedText = text;
      showFloatingRewriteCard(getSelectionCoordinates());
    }
  }
});

function getSelectionCoordinates(): { x: number; y: number } {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    return {
      x: Math.max(16, rect.left + window.scrollX),
      y: rect.bottom + window.scrollY + 8,
    };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

function handleTextSelection(e: MouseEvent) {
  // If clicked inside our own Shadow DOM widget, don't dismiss
  if (activeShadowHost && e.composedPath().includes(activeShadowHost)) {
    return;
  }

  const selection = window.getSelection();
  const text = selection ? selection.toString().trim() : '';

  if (!text || text.length < 3) {
    // Only remove if we haven't opened the card
    if (activeShadowHost && !activeShadowRoot?.querySelector('.rb-card-open')) {
      removeActiveWidget();
    }
    return;
  }

  currentSelectedText = text;
  currentTargetElement = document.activeElement as HTMLElement;

  // Show small trigger badge near cursor
  showFloatingTriggerBadge(e.pageX, e.pageY);
}

function showFloatingTriggerBadge(x: number, y: number) {
  removeActiveWidget();

  activeShadowHost = document.createElement('div');
  activeShadowHost.id = 'rewritebot-extension-root';
  activeShadowHost.style.position = 'absolute';
  activeShadowHost.style.zIndex = '2147483647';
  activeShadowHost.style.left = `${x + 10}px`;
  activeShadowHost.style.top = `${y + 10}px`;
  document.body.appendChild(activeShadowHost);

  activeShadowRoot = activeShadowHost.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    .rb-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, #670626 0%, #4a031a 100%);
      color: #ffffff;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(103, 6, 38, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      user-select: none;
    }
    .rb-pill:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(103, 6, 38, 0.45);
    }
    .rb-icon {
      font-size: 14px;
    }
  `;

  const pill = document.createElement('div');
  pill.className = 'rb-pill';
  pill.innerHTML = `<span class="rb-icon">✍️</span> <span>Rewrite</span>`;
  pill.addEventListener('click', (e) => {
    e.stopPropagation();
    showFloatingRewriteCard({ x, y });
  });

  activeShadowRoot.appendChild(style);
  activeShadowRoot.appendChild(pill);
}

function showFloatingRewriteCard(coords: { x: number; y: number }) {
  if (!activeShadowRoot || !activeShadowHost) {
    activeShadowHost = document.createElement('div');
    activeShadowHost.id = 'rewritebot-extension-root';
    activeShadowHost.style.position = 'absolute';
    activeShadowHost.style.zIndex = '2147483647';
    document.body.appendChild(activeShadowHost);
    activeShadowRoot = activeShadowHost.attachShadow({ mode: 'open' });
  }

  activeShadowHost.style.left = `${Math.min(window.innerWidth - 380, Math.max(16, coords.x))}px`;
  activeShadowHost.style.top = `${coords.y}px`;

  activeShadowRoot.innerHTML = '';

  const style = document.createElement('style');
  style.textContent = `
    .rb-card {
      width: 360px;
      background: #ffffff;
      color: #171314;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: rbFadeIn 0.15s ease-out;
    }
    @keyframes rbFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .rb-header {
      padding: 10px 14px;
      background: #fdfaf6;
      border-bottom: 1px solid #f1f3f5;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .rb-title {
      font-size: 13px;
      font-weight: 700;
      color: #670626;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .rb-close {
      cursor: pointer;
      color: #9ca3af;
      font-size: 16px;
      background: none;
      border: none;
      padding: 0;
    }
    .rb-body {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .rb-modes {
      display: flex;
      gap: 4px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .rb-mode-btn {
      padding: 4px 10px;
      border-radius: 14px;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
      color: #4b5563;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .rb-mode-btn.active {
      background: #670626;
      color: #ffffff;
      border-color: #670626;
    }
    .rb-output-box {
      min-height: 80px;
      max-height: 180px;
      overflow-y: auto;
      padding: 10px;
      background: #fcfcfc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
      color: #1f2937;
    }
    .rb-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 6px;
    }
    .rb-btn-primary {
      padding: 6px 14px;
      background: #670626;
      color: #ffffff;
      border-radius: 6px;
      border: none;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .rb-btn-secondary {
      padding: 6px 12px;
      background: #f3f4f6;
      color: #374151;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .rb-spinner {
      color: #670626;
      font-style: italic;
      font-size: 12px;
    }
  `;

  const card = document.createElement('div');
  card.className = 'rb-card rb-card-open';

  let selectedMode = 'standard';
  let rewrittenResultText = '';

  card.innerHTML = `
    <div class="rb-header">
      <div class="rb-title">✍️ RewriteBot</div>
      <button class="rb-close" id="rb-btn-close">✕</button>
    </div>
    <div class="rb-body">
      <div class="rb-modes">
        <button class="rb-mode-btn active" data-mode="standard">Standard</button>
        <button class="rb-mode-btn" data-mode="academic">Academic</button>
        <button class="rb-mode-btn" data-mode="fluency">Fluency</button>
        <button class="rb-mode-btn" data-mode="humanize">Humanize</button>
        <button class="rb-mode-btn" data-mode="shorten">Shorten</button>
      </div>
      <div class="rb-output-box" id="rb-output">
        <span class="rb-spinner">Restructuring with RewriteBot…</span>
      </div>
      <div class="rb-footer">
        <button class="rb-btn-secondary" id="rb-btn-copy">📋 Copy</button>
        <button class="rb-btn-primary" id="rb-btn-replace">⚡ Replace in Page</button>
      </div>
    </div>
  `;

  activeShadowRoot.appendChild(style);
  activeShadowRoot.appendChild(card);

  // Close handler
  card.querySelector('#rb-btn-close')?.addEventListener('click', removeActiveWidget);

  // Mode switcher handler
  const modeButtons = card.querySelectorAll<HTMLButtonElement>('.rb-mode-btn');
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMode = btn.dataset.mode || 'standard';
      executeParaphrase();
    });
  });

  // Copy handler
  card.querySelector('#rb-btn-copy')?.addEventListener('click', () => {
    if (rewrittenResultText) {
      navigator.clipboard.writeText(rewrittenResultText);
      const copyBtn = card.querySelector<HTMLButtonElement>('#rb-btn-copy');
      if (copyBtn) {
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => (copyBtn.textContent = '📋 Copy'), 1500);
      }
    }
  });

  // Replace in page handler
  card.querySelector('#rb-btn-replace')?.addEventListener('click', () => {
    if (rewrittenResultText) {
      replaceTextInPage(currentSelectedText, rewrittenResultText);
      removeActiveWidget();
    }
  });

  async function executeParaphrase() {
    const outputEl = card.querySelector('#rb-output');
    if (outputEl) {
      outputEl.innerHTML = '<span class="rb-spinner">Restructuring with RewriteBot…</span>';
    }

    try {
      chrome.runtime.sendMessage(
        {
          type: 'EXECUTE_PARAPHRASE',
          payload: {
            text: currentSelectedText,
            mode: selectedMode,
          },
        },
        (response: any) => {
          if (response?.success && response.data?.text) {
            rewrittenResultText = response.data.text;
            if (outputEl) outputEl.textContent = rewrittenResultText;
          } else {
            if (outputEl) {
              outputEl.textContent = response?.error || 'Rewrite failed. Check RewriteBot connection.';
            }
          }
        }
      );
    } catch (err: any) {
      if (outputEl) outputEl.textContent = err.message || 'Error communicating with extension';
    }
  }

  // Trigger initial paraphrase
  executeParaphrase();
}

/**
 * Replaces selected text inside active editable fields or contenteditable elements
 */
function replaceTextInPage(_original: string, replacement: string) {
  const activeEl = currentTargetElement || (document.activeElement as HTMLElement);

  if (activeEl instanceof HTMLTextAreaElement || activeEl instanceof HTMLInputElement) {
    const start = activeEl.selectionStart || 0;
    const end = activeEl.selectionEnd || 0;
    const val = activeEl.value;
    activeEl.value = val.slice(0, start) + replacement + val.slice(end);
    activeEl.setSelectionRange(start, start + replacement.length);
    activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  // ContentEditable / Google Docs / Rich Editors
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(replacement));
  }
}

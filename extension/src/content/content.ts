/**
 * RewriteBot Content Script
 * Injects isolated Shadow DOM floating pill & rewrite card upon text selection.
 */

let activeShadowHost: HTMLElement | null = null;
let activeShadowRoot: ShadowRoot | null = null;
let currentSelectedText: string = '';
let currentTargetElement: HTMLElement | null = null;

// Clean up existing floating widget
function removeActiveWidget() {
  if (activeShadowHost) {
    activeShadowHost.remove();
    activeShadowHost = null;
    activeShadowRoot = null;
  }
}

function getHostParent(): HTMLElement {
  return (document.fullscreenElement as HTMLElement) || document.body || document.documentElement;
}

interface SelectionInfo {
  text: string;
  coords: { x: number; y: number };
  targetEl?: HTMLElement | null;
}

/**
 * Extracts selected text and viewport coordinates across normal DOM elements,
 * textareas, inputs, and rich text editors.
 */
function getSelectionInfo(mouseEvent?: MouseEvent): SelectionInfo | null {
  // 1. Check input or textarea active elements
  const activeEl = document.activeElement;
  if (
    activeEl instanceof HTMLTextAreaElement ||
    (activeEl instanceof HTMLInputElement && /^(text|search|url|tel)$/i.test(activeEl.type || 'text'))
  ) {
    const start = activeEl.selectionStart ?? 0;
    const end = activeEl.selectionEnd ?? 0;
    if (end > start) {
      const selectedText = activeEl.value.substring(start, end).trim();
      if (selectedText.length >= 2) {
        const rect = activeEl.getBoundingClientRect();
        return {
          text: selectedText,
          coords: {
            x: Math.min(window.innerWidth - 130, Math.max(16, rect.right - 110)),
            y: Math.min(window.innerHeight - 50, Math.max(16, rect.bottom + 8)),
          },
          targetEl: activeEl,
        };
      }
    }
  }

  // 2. Check standard DOM window selection
  const sel = window.getSelection();
  const text = sel ? sel.toString().trim() : '';
  if (text && text.length >= 2 && sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) {
      let pillY = rect.bottom + 8;
      // If near bottom of viewport, place pill above selection
      if (pillY + 45 > window.innerHeight) {
        pillY = Math.max(12, rect.top - 40);
      }
      return {
        text,
        coords: {
          x: Math.min(window.innerWidth - 130, Math.max(16, rect.right + 6)),
          y: Math.min(window.innerHeight - 45, Math.max(12, pillY)),
        },
        targetEl: (sel.anchorNode?.parentElement as HTMLElement) || null,
      };
    }
  }

  // 3. Fallback to mouse event if provided
  if (text && text.length >= 2 && mouseEvent) {
    return {
      text,
      coords: {
        x: Math.min(window.innerWidth - 130, Math.max(16, mouseEvent.clientX + 8)),
        y: Math.min(window.innerHeight - 50, Math.max(16, mouseEvent.clientY + 8)),
      },
      targetEl: (mouseEvent.target as HTMLElement) || null,
    };
  }

  return null;
}

// Listen to selection changes across the webpage
let selectionDebounceTimer: any = null;
['mouseup', 'pointerup', 'keyup'].forEach((evt) => {
  window.addEventListener(evt, (e: any) => {
    // If interaction occurs inside our widget, don't dismiss or reposition
    if (activeShadowHost && e.composedPath && e.composedPath().includes(activeShadowHost)) {
      return;
    }

    clearTimeout(selectionDebounceTimer);
    selectionDebounceTimer = setTimeout(() => {
      // Don't disturb if full rewrite card is already open
      if (activeShadowRoot?.querySelector('.rb-card-open')) {
        return;
      }

      const info = getSelectionInfo(e instanceof MouseEvent ? e : undefined);
      if (info) {
        currentSelectedText = info.text;
        currentTargetElement = info.targetEl || null;
        showFloatingTriggerBadge(info.coords.x, info.coords.y);
      } else {
        removeActiveWidget();
      }
    }, 60);
  });
});

// Direct in-page keyboard shortcut listener for Alt+R (or Option+R on Mac)
window.addEventListener(
  'keydown',
  (e: KeyboardEvent) => {
    const isAltR = e.altKey && (e.key === 'r' || e.key === 'R' || e.code === 'KeyR');
    if (isAltR) {
      e.preventDefault();
      e.stopPropagation();

      const info = getSelectionInfo();
      if (info && info.text) {
        currentSelectedText = info.text;
        currentTargetElement = info.targetEl || null;
        showFloatingRewriteCard(info.coords);
      } else {
        // If no text is selected, check active element or open centered studio prompt
        const activeEl = document.activeElement;
        let existingText = '';
        if (activeEl instanceof HTMLTextAreaElement || activeEl instanceof HTMLInputElement) {
          existingText = activeEl.value.trim();
          currentTargetElement = activeEl;
        }
        currentSelectedText = existingText;
        showFloatingRewriteCard({
          x: Math.max(20, Math.round((window.innerWidth - 380) / 2)),
          y: Math.max(60, Math.round(window.innerHeight * 0.15)),
        });
      }
    }

    if (e.key === 'Escape') {
      removeActiveWidget();
    }
  },
  true // Use capture phase so host web apps cannot intercept or suppress Alt+R
);

// Listen for background triggers (context menu or extension shortcut)
chrome.runtime.onMessage.addListener((msg: any) => {
  if (msg.type === 'REWRITE_TRIGGER' || msg.type === 'REWRITE_SHORTCUT_TRIGGER') {
    const info = getSelectionInfo();
    if (info && info.text) {
      currentSelectedText = info.text;
      currentTargetElement = info.targetEl || null;
      showFloatingRewriteCard(info.coords);
    } else {
      if (msg.text) {
        currentSelectedText = msg.text.trim();
      }
      showFloatingRewriteCard({
        x: Math.max(20, Math.round((window.innerWidth - 380) / 2)),
        y: Math.max(60, Math.round(window.innerHeight * 0.15)),
      });
    }
  }
});

function showFloatingTriggerBadge(x: number, y: number) {
  removeActiveWidget();

  activeShadowHost = document.createElement('div');
  activeShadowHost.id = 'rewritebot-extension-root';
  activeShadowHost.style.position = 'fixed';
  activeShadowHost.style.zIndex = '2147483647';
  activeShadowHost.style.left = `${Math.max(12, Math.min(window.innerWidth - 120, x))}px`;
  activeShadowHost.style.top = `${y}px`;

  const hostParent = getHostParent();
  hostParent.appendChild(activeShadowHost);

  activeShadowRoot = activeShadowHost.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    .rb-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: linear-gradient(135deg, #670626 0%, #4a031a 100%);
      color: #ffffff;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(103, 6, 38, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.25);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      user-select: none;
      animation: rbPillPop 0.15s ease-out;
    }
    @keyframes rbPillPop {
      0% { opacity: 0; transform: scale(0.85); }
      100% { opacity: 1; transform: scale(1); }
    }
    .rb-pill:hover {
      transform: translateY(-1px) scale(1.03);
      box-shadow: 0 6px 20px rgba(103, 6, 38, 0.5);
    }
    .rb-icon {
      font-size: 13px;
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
    activeShadowHost.style.position = 'fixed';
    activeShadowHost.style.zIndex = '2147483647';
    const hostParent = getHostParent();
    hostParent.appendChild(activeShadowHost);
    activeShadowRoot = activeShadowHost.attachShadow({ mode: 'open' });
  } else {
    activeShadowHost.style.position = 'fixed';
  }

  const cardWidth = 380;
  const leftPos = Math.min(window.innerWidth - cardWidth - 16, Math.max(16, coords.x));
  const topPos = Math.min(window.innerHeight - 360, Math.max(16, coords.y));

  activeShadowHost.style.left = `${leftPos}px`;
  activeShadowHost.style.top = `${topPos}px`;

  activeShadowRoot.innerHTML = '';

  const style = document.createElement('style');
  style.textContent = `
    .rb-card {
      width: 380px;
      background: #ffffff;
      color: #171314;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.08);
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
      line-height: 1;
    }
    .rb-close:hover {
      color: #374151;
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
      padding-bottom: 2px;
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
      transition: all 0.15s ease;
    }
    .rb-mode-btn:hover {
      background: #f3f4f6;
    }
    .rb-mode-btn.active {
      background: #670626;
      color: #ffffff;
      border-color: #670626;
    }
    .rb-input-area {
      width: 100%;
      box-sizing: border-box;
      min-height: 55px;
      max-height: 90px;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      font-family: inherit;
      font-size: 12px;
      resize: vertical;
    }
    .rb-output-box {
      min-height: 75px;
      max-height: 160px;
      overflow-y: auto;
      padding: 10px;
      background: #fcfcfc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
      color: #1f2937;
      word-break: break-word;
    }
    .rb-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 4px;
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
      transition: background 0.15s ease;
    }
    .rb-btn-primary:hover {
      background: #4a031a;
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
    .rb-btn-secondary:hover {
      background: #e5e7eb;
    }
    .rb-spinner {
      color: #670626;
      font-style: italic;
      font-size: 12px;
    }
    .rb-error {
      color: #dc2626;
      font-size: 12px;
    }
  `;

  const card = document.createElement('div');
  card.className = 'rb-card rb-card-open';

  let selectedMode = 'standard';
  let rewrittenResultText = '';

  const hasInitialText = Boolean(currentSelectedText && currentSelectedText.trim().length > 0);

  card.innerHTML = `
    <div class="rb-header">
      <div class="rb-title">✍️ RewriteBot</div>
      <button class="rb-close" id="rb-btn-close">✕</button>
    </div>
    <div class="rb-body">
      ${
        !hasInitialText
          ? `<textarea class="rb-input-area" id="rb-manual-input" placeholder="Type or paste text to rewrite..."></textarea>`
          : ''
      }
      <div class="rb-modes">
        <button class="rb-mode-btn active" data-mode="standard">Standard</button>
        <button class="rb-mode-btn" data-mode="fluency">Fluency</button>
        <button class="rb-mode-btn" data-mode="academic">Academic</button>
        <button class="rb-mode-btn" data-mode="humanize">Humanize</button>
        <button class="rb-mode-btn" data-mode="shorten">Shorten</button>
      </div>
      <div class="rb-output-box" id="rb-output">
        <span class="rb-spinner">${hasInitialText ? 'Restructuring with RewriteBot…' : 'Enter text above to rewrite'}</span>
      </div>
      <div class="rb-footer">
        <button class="rb-btn-secondary" id="rb-btn-copy">📋 Copy</button>
        <div style="display: flex; gap: 6px;">
          <button class="rb-btn-secondary" id="rb-btn-rerun">🔄 Re-run</button>
          <button class="rb-btn-primary" id="rb-btn-replace">⚡ Replace in Page</button>
        </div>
      </div>
    </div>
  `;

  activeShadowRoot.appendChild(style);
  activeShadowRoot.appendChild(card);

  // Close handler
  card.querySelector('#rb-btn-close')?.addEventListener('click', removeActiveWidget);

  // Manual input handler if displayed
  const manualInput = card.querySelector<HTMLTextAreaElement>('#rb-manual-input');
  manualInput?.addEventListener('input', () => {
    currentSelectedText = manualInput.value;
  });

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

  // Re-run handler
  card.querySelector('#rb-btn-rerun')?.addEventListener('click', () => {
    executeParaphrase();
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
    const textToRewrite = manualInput ? manualInput.value.trim() : currentSelectedText.trim();
    const outputEl = card.querySelector('#rb-output');

    if (!textToRewrite) {
      if (outputEl) outputEl.innerHTML = '<span class="rb-spinner">Please select or enter text to rewrite</span>';
      return;
    }

    if (outputEl) {
      outputEl.innerHTML = '<span class="rb-spinner">Restructuring with RewriteBot…</span>';
    }

    try {
      chrome.runtime.sendMessage(
        {
          type: 'EXECUTE_PARAPHRASE',
          payload: {
            text: textToRewrite,
            mode: selectedMode,
          },
        },
        (response: any) => {
          if (response?.success && response.data?.text) {
            rewrittenResultText = response.data.text;
            if (outputEl) outputEl.textContent = rewrittenResultText;
          } else {
            if (outputEl) {
              const errMsg = response?.error || 'Rewrite failed. Check RewriteBot server connection.';
              outputEl.innerHTML = `<span class="rb-error">${errMsg}</span>`;
            }
          }
        }
      );
    } catch (err: any) {
      if (outputEl) outputEl.innerHTML = `<span class="rb-error">${err.message || 'Extension error'}</span>`;
    }
  }

  // Trigger initial paraphrase if text was already selected
  if (hasInitialText) {
    executeParaphrase();
  }
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

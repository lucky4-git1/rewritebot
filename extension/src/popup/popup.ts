/**
 * RewriteBot Popup Studio Script
 */

let selectedMode = 'standard';

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('input-text') as HTMLTextAreaElement;
  const outputEl = document.getElementById('output-text') as HTMLDivElement;
  const btnRewrite = document.getElementById('btn-rewrite') as HTMLButtonElement;
  const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
  const modeButtons = document.querySelectorAll<HTMLButtonElement>('.mode-btn');

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

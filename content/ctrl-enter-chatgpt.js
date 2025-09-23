function handleCtrlEnter(event) {
  const isOnlyEnter = (event.code === "Enter") && !(event.ctrlKey || event.metaKey);
  const isCtrlEnter = (event.code === "Enter") && event.ctrlKey;
  const isPromptTextarea = event.target.id === "prompt-textarea";

  // Ignore untrusted events
  if (!event.isTrusted) return;

  // Specific handling for ChatGPT's prompt textarea
  if (isPromptTextarea && isOnlyEnter) {
    event.preventDefault();
    const newEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      bubbles: true,
      cancelable: true,
      ctrlKey: false,
      metaKey: false,
      shiftKey: true,  // Simulate Shift+Enter to insert a line break
    });
    event.target.dispatchEvent(newEvent);
  }
  else if (isPromptTextarea && isCtrlEnter) {
    event.preventDefault();
    const newEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      bubbles: true,
      cancelable: true,
      ctrlKey: false,
      metaKey: true,  // ChatGPT UI ignores Ctrl+Enter in narrow (mobile/sidebar) view; simulate Meta+Enter instead to ensure submission
      shiftKey: false,
    });
    event.target.dispatchEvent(newEvent);
  }

  // On macOS, users can submit edits using the Meta key (Command key)
  // To allow submitting edits on Windows, convert Ctrl to Meta
  else if (event.target.tagName === "TEXTAREA" && isCtrlEnter) {
    event.preventDefault();
    const newEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      bubbles: true,
      cancelable: true,
      ctrlKey: false,
      metaKey: true,  // Simulate Meta+Enter to trigger submit on Windows as well
      shiftKey: false,
    });
    event.target.dispatchEvent(newEvent);
  }
}


function getStopButton() {
  // 生成中のみ表示される停止ボタンを広めのセレクタで探す
  return (
    document.querySelector('button[data-testid="stop-button"]') ||
    document.querySelector('button[aria-label*="停止"]') ||
    document.querySelector('button[aria-label*="Stop"]') ||
    document.querySelector('#composer-submit-button[data-testid="stop-button"]')
  );
}

function handleCtrlS(event) {
  // ユーザー操作のみ対象（無限ループ防止）
  if (!event.isTrusted) return;

  // Ctrl(or ⌘)+S の検出（OS問わず）
  const isCtrlOrMeta = event.ctrlKey || event.metaKey;
  const isKeyS = event.code === 'KeyS' || (event.key && event.key.toLowerCase() === 's');
  if (!isCtrlOrMeta || !isKeyS) return;

  // ChatGPT側の停止ボタンが表示されている（=ストリーミング中）ときだけ動作
  const stopBtn = getStopButton();
  if (stopBtn && !stopBtn.disabled) {
    event.preventDefault();   // ブラウザの「ページ保存」を抑止
    stopBtn.click();          // 停止！
  }
}

function enableCtrlSStopper() {
  try {
    // capture: true で早めに奪う（ページ保存を確実に防ぐ）
    window.addEventListener('keydown', handleCtrlS, true);
  } catch (_) {}
}


// Apply the setting based on the current site on initial load
applySiteSetting();

// Listen for changes to the site settings and apply them dynamically
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.siteSettings) {
    applySiteSetting();
  }
});

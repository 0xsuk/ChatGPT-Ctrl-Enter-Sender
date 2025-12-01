class ChatGPTHandler extends Dispatcher {
  handleCtrlEnter = (event ) => {
    //impl
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

  handleAltJK = (event) => {
    if (!event.isTrusted) return;

    if (!event.altKey) return;

    if (event.code === "KeyJ") {
      event.preventDefault();
      jumpMessage(false); // 次へ
    } else if (event.code === "KeyK") {
      event.preventDefault();
      jumpMessage(true);  // 前へ
    }
  }
  
  handleAltE = (event) => {
    if (!event.isTrusted) return;

    if (!event.altKey) return;

    if (event.code === "KeyE") {
      event.preventDefault();
      editCurrentNode();
    }
  }
  
  handleAltS = (event) => {
    // ユーザー操作のみ対象（無限ループ防止）
    if (!event.isTrusted) return;

    // Alt+S の検出
    const isAlt = event.altKey; // AltGraph 対策が必要なら event.getModifierState?.('AltGraph') を併用
    const isKeyS = event.code === 'KeyS' || (event.key && event.key.toLowerCase() === 's');
    if (!isAlt || !isKeyS) return;

    // ChatGPT 停止ボタンが表示されている（=ストリーミング中）のときだけ動作
    const stopBtn = getStopButton();
    if (stopBtn && !stopBtn.disabled) {
      event.preventDefault();   // 既定動作を抑止（念のため）
      stopBtn.click();          // 停止！
    }
  }
}

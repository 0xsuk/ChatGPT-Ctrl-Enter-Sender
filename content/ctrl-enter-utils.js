const hosts = {
  chatgpt: "chatgpt.com",
  perplexity: "www.perplexity.ai",
  gemini: "gemini.google.com"
}

class Dispatcher {
  static getInstance(hostname) {
    switch (hostname) {
    case hosts.chatgpt:
      return new ChatGPTHandler()
    case hosts.perplexity:
      return new PerplexityHandler()
    case hosts.gemini:
      return new GeminiHandler()
    }
  }
  
  enableHandleCtrlEnter = () => {
    document.addEventListener("keydown", this.handleCtrlEnter, { capture: true });
  }
  handleCtrlEnter = (event ) => {}
  disableHandleCtrlEnter = () => {
    document.removeEventListener("keydown", this.handleCtrlEnter, { capture: true });
  }
  
  enableHandleAltS = () => {
    try {
      // capture: true で早めに奪う（ページ保存や他ハンドラより先に処理）
      window.addEventListener('keydown', this.handleAltS, true);
    } catch (_) {}
  }
  handleAltS = (event) => {}
  
  enableHandleAltJK = () => {
    window.addEventListener("keydown", this.handleAltJK);
  }
  handleAltJK = (event) => {}
  
  enableHandleAltE = () => {
    window.addEventListener("keydown", this.handleAltE)
  }
  handleAltE = (event) => {}
}


function getHostname() {
  return window.location.hostname;
}

function applySiteSetting() {
  const hostname = getHostname();

  chrome.storage.sync.get("siteSettings", (data) => {
    const settings = data.siteSettings || {};
    const isEnabled = settings[hostname] ?? true;

    const dispatcher = Dispatcher.getInstance(hostname)
    if (isEnabled) {
      dispatcher.enableHandleCtrlEnter();

      if (hostname == hosts.chatgpt) {
        dispatcher.enableHandleAltS();
        dispatcher.enableHandleAltJK();
        dispatcher.enableHandleAltE();
      }
    } else {
      dispatcher.disableHandleCtrlEnter(hostname);
    }
  });
}
applySiteSetting()


function hasAlt(event) {
  // ユーザー操作のみ対象（無限ループ防止）
  if (!event.isTrusted) return false;

  // Alt+S の検出
  return event.altKey; // AltGraph 対策が必要なら event.getModifierState?.('AltGraph') を併用
}

function isAltS(event) {

  if (!hasAlt(event)) {
    return
  }
  
  const isKeyS = event.code === 'KeyS' || (event.key && event.key.toLowerCase() === 's');
  if (!isKeyS) return false;
  return true;
}

function isAltE(event) {
  if (!hasAlt(event)) {
    return
  }

  return event.code === "KeyE"
}

function isAltJ(event) {
  if (!hasAlt(event)) {
    return
  }

  return event.code === "KeyJ"
}

function isAltK(event) {
    if (!hasAlt(event)) {
    return
  }

  return event.code === "KeyK"
}

function min(a,b) {
  return a<b?a:b;
}
function max(a,b) {
  return a<b?b:a;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.siteSettings) {
    applySiteSetting();
  }
});

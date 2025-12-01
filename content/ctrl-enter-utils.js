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
  
  enableSendingWithCtrlEnter = () => {
    document.addEventListener("keydown", this.handleCtrlEnter, { capture: true });
  }
  handleCtrlEnter = (event ) => {}
  disableSendingWithCtrlEnter = () => {
    document.removeEventListener("keydown", this.handleCtrlEnter, { capture: true });
  }
  
  enableAltSStopper = () => {
    try {
      // capture: true で早めに奪う（ページ保存や他ハンドラより先に処理）
      window.addEventListener('keydown', this.handleAltS, true);
    } catch (_) {}
  }
  handleAltS = (event) => {}
  
  enableAltJK = () => {
    window.addEventListener("keydown", this.handleAltJK);
  }
  handleAltJK = (event) => {}
  
  enableAltE = () => {
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
      dispatcher.enableSendingWithCtrlEnter();

      if (hostname == hosts.chatgpt) {
        dispatcher.enableAltSStopper();
        dispatcher.enableAltJK();
        dispatcher.enableAltE();
      }
    } else {
      dispatcher.disableSendingWithCtrlEnter(hostname);
    }
  });
}
applySiteSetting()


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

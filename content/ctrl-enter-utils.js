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

class PerplexityHandler extends Dispatcher {
  hanldeCtrlEnter = (event) => {
    if (event.target.tagName !== "TEXTAREA" || !event.isTrusted) {
      return;
    }

    const isOnlyEnter = (event.code === "Enter") && !(event.ctrlKey || event.metaKey);

    if (isOnlyEnter) {
      // stopPropagation for both Windows and Mac
      event.stopPropagation();
    }
  }
}

class GeminiHandler extends Dispatcher {
  handleCtrlEnter = (event) => {
    function findSendButton() {
      const submitButton = document.querySelector('query-box form button[type="submit"]');
      if (submitButton) return submitButton;
      return null;
    }
    function shouldHandleCtrlEnter(url, event) {
      if (url.startsWith("https://claude.ai")) {
        return event.target.tagName === "DIV" && event.target.contentEditable === "true";
      }
      else if (url.startsWith("https://notebooklm.google.com")) {
        return event.target.tagName === "TEXTAREA" && event.target.classList.contains("query-box-input");
      }
      else if (url.startsWith("https://gemini.google.com")) {
        return event.target.tagName === "DIV" &&
          event.target.classList.contains("ql-editor") &&
          event.target.contentEditable === "true";
      }
      else if (url.startsWith("https://www.phind.com")) {
        return event.target.tagName === "DIV" &&
          event.target.classList.contains("public-DraftEditor-content") &&
          event.target.contentEditable === "true";
      }
      else if (url.startsWith("https://chat.deepseek.com")) {
        return event.target.id === "chat-input";
      }
      else if (url.startsWith("https://grok.com")) {
        return event.target.tagName === "TEXTAREA";
      }
      else if (url.startsWith("https://github.com")) {
        return event.target.getAttribute("placeholder") === "Ask Copilot";
      }
      else if (url.startsWith("https://m365.cloud.microsoft/chat")) {
        return event.target.id === "m365-chat-editor-target-element";
      }
      return false;
    }

    const url = window.location.href;

    if (!shouldHandleCtrlEnter(url, event) || !event.isTrusted) {
      return;
    }

    const isOnlyEnter = (event.code === "Enter") && !(event.ctrlKey || event.metaKey);
    const isCtrlEnter = (event.code === "Enter") && (event.ctrlKey || event.metaKey);

    if (isOnlyEnter || isCtrlEnter) {
      // Prevent default behavior only for certain sites
      const preventDefaultSites = ["https://claude.ai", "https://www.phind.com"];
      if (preventDefaultSites.some((site) => url.startsWith(site))) {
        event.preventDefault();
      }
      event.stopImmediatePropagation();

      let eventConfig = {
        key: "Enter",
        code: "Enter",
        bubbles: true,
        cancelable: true,
        shiftKey: isOnlyEnter
      };

      // Phind requires keyCode to be set explicitly
      if (url.startsWith("https://www.phind.com")) {
        eventConfig.keyCode = 13;
      }

      // M365 Chat requires keyCode=13 for Ctrl+Enter to send message
      if (url.startsWith("https://m365.cloud.microsoft/chat") && isCtrlEnter) {
        eventConfig.keyCode = 13;
      }

      const newEvent = new KeyboardEvent("keydown", eventConfig);
      event.target.dispatchEvent(newEvent);
    }

    // NotebookLM requires clicking the send button instead of dispatching Enter
    if (isCtrlEnter && url.startsWith("https://notebooklm.google.com")) {
      const sendButton = findSendButton();
      if (sendButton) {
        sendButton.click();
      }
    }
  }
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



let jumped_node = null;

function jumpToMessageId(id, flag) {
  // Build the full data-testid string
  const selector = `article[data-testid="conversation-turn-${id}"]`;

  // Find the node
  const node = document.querySelector(selector);

  if (node) {
    node.scrollIntoView({
      behavior: "instant", // smooth scroll
      block:flag?flag: "center"     // center it vertically
    });
    node.classList.add("rainbow-highlight");
    setTimeout(() => {
      node.classList.remove("rainbow-highlight");
    }, 1000); // 1秒で消す
    jumped_node = node;
  } else {
    console.warn(`No conversation with id ${id} found`);
  }
}

function getMessageNodes() {
  const messages = Array.from(document.querySelectorAll('article'));
  return messages;
}

function getMessageNodesFromUser() {
  const messages = getMessageNodes()
  messages.filter(msg => msg.getAttribute("data-turn") === "user");
}
(function injectRainbowStyle() {
  if (document.getElementById("rainbow-style")) return;
  const style = document.createElement("style");
  style.id = "rainbow-style";
  style.textContent = `
    @keyframes rainbow-border {
      0% { border-color: red; }
      20% { border-color: orange; }
      40% { border-color: yellow; }
      60% { border-color: green; }
      80% { border-color: blue; }
      100% { border-color: purple; }
    }
    .rainbow-highlight {
      border: 3px solid red;
      border-radius: 8px;
      animation: rainbow-border 1s linear infinite;
    }
  `;
  document.head.appendChild(style);
})();

function isAssistant(node){
  return node.getAttribute("data-turn") == "assistant"  
}
function isUser(node) {
  return node.getAttribute("data-turn") == "user"  
}
function getMessageId(node) {
  const id_string = node.getAttribute("data-testid").split("-").pop()
  return Number(id_string)
}

function min(a,b) {
  return a<b?a:b;
}
function max(a,b) {
  return a<b?b:a;
}

//when  last message node is from assistant, go to message node by user
function jumpMessage(prevFlag) {
  const messages = getMessageNodes();
  const last_node = messages[messages.length-1];
  const last_id = getMessageId(last_node);
  
  
  console.log(last_id)
  
  const node = getCurrentMessageNode()
  console.log("node",node)
  if (node==null) return

  const id = getMessageId(node);
  console.log("id",id)
  if (isAssistant(node)) {
    if (prevFlag) {
      jumpToMessageId(max(id-1, 1));
    } else {
      if (id+1>last_id) {
        jumpToMessageId(last_id, "end");
      } else {
        jumpToMessageId(id+1);
      }
    }
  }

  else {//isUser(node)
    if (prevFlag) {
      console.log(min(id-2,1), id, last_id)
      jumpToMessageId(max(id-2,1));
    } else {
      if (id+2>last_id){
        jumpToMessageId(last_id, "end");
      } else {
        jumpToMessageId(id+2);
      }
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCurrentMessageNode() {
  const centerY = window.innerHeight / 2;
  let best = null;
  let bestDist = Infinity;

  for (const el of getMessageNodes()) {
    const r = el.getBoundingClientRect();

    // 全く見えてない要素はスキップ
    if (r.height <= 0 || r.bottom <= 0 || r.top >= window.innerHeight) continue;

    // center が要素の範囲内にあるか？
    if (r.top <= centerY && centerY <= r.bottom) {
      // 中心を含んでいる要素は無条件で最優先
      return el;
    }

    // 含まれていなければ、top/bottom のどちらか近い方で比較
    const topDist = Math.abs(r.top - centerY);
    const bottomDist = Math.abs(r.bottom - centerY);
    const dist = Math.min(topDist, bottomDist);

    if (dist < bestDist) {
      best = el;
      bestDist = dist;
    }
  }
  return best;
}

function isEditing(node) {
  return node.querySelector("textarea") !== null
}

function cancelEditCurrentNode(node) {
  const cancel_button = Array.from(node.querySelectorAll('button')).find(btn => btn.textContent.trim().includes("キャンセル"));

  cancel_button.click()
}

async function editCurrentNode() {
  const node = jumped_node;
  
  if (isEditing(node)) {
    cancelEditCurrentNode(node);
    return;
  }
  
  if (!isUser(node)) {
    console.log("not user node");
    return;
  }
  
  const button = node.querySelector('button[aria-label="メッセージを編集する"]');

  if (!button) return

  button.click()
  await sleep(5)
  node.querySelector("textarea").focus();
}

//edit
function enableAltE() {
  window.addEventListener("keydown", );
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



chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.siteSettings) {
    applySiteSetting();
  }
});

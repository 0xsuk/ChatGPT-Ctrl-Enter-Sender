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

function handleAltS(event) {
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

function enableAltSStopper() {
  try {
    // capture: true で早めに奪う（ページ保存や他ハンドラより先に処理）
    window.addEventListener('keydown', handleAltS, true);
  } catch (_) {}
}

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
        jumpToMessageId(last_id, "start");
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
        jumpToMessageId(last_id, "start");
      } else {
        jumpToMessageId(id+2);
      }
    }
  }
}

//jump to prev/next message from user
function enableAltJK() {
  window.addEventListener("keydown", (event) => {
    if (!event.isTrusted) return;

    if (!event.altKey) return;

    if (event.code === "KeyJ") {
      event.preventDefault();
      jumpMessage(false); // 次へ
    } else if (event.code === "KeyK") {
      event.preventDefault();
      jumpMessage(true);  // 前へ
    }
  });
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
    if (r.height <= 0 || r.bottom <= 0 || r.top >= window.innerHeight) {
      // 全く見えてない要素はスキップ (必要なら外してOK)
      continue;
    }
    const elCenter = (r.top + r.bottom) / 2;
    const dist = Math.abs(elCenter - centerY);
    if (dist < bestDist) {
      bestDist = dist;
      best = el;
    }
  }
  return best;
}


async function editCurrentNode() {
  const node = getCurrentMessageNode()
  const button = node.querySelectorAll("button")[1]

  if (!button) return

  button.click()
  await sleep(10)
  node.querySelector("textarea").focus();
}

//edit
function enableAltE() {
  window.addEventListener("keydown", (event) => {
    if (!event.isTrusted) return;

    if (!event.altKey) return;

    if (event.code === "KeyE") {
      event.preventDefault();
      editCurrentNode();
    }
  });
}


// Apply the setting based on the current site on initial load
applySiteSetting();

// Listen for changes to the site settings and apply them dynamically
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.siteSettings) {
    applySiteSetting();
  }
});

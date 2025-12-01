class PerplexityHandler extends Dispatcher {
  handleCtrlEnter = (event) => {
    if (!event.isTrusted) return
    const isOnlyEnter = (event.code === "Enter") && !(event.ctrlKey || event.metaKey);
    const isCtrlEnter = (event.code === "Enter") && event.ctrlKey;

    if (isOnlyEnter) {
      // stopPropagation for both Windows and Mac
      event.stopPropagation();
      return
    }

    if (isCtrlEnter) {
      if (event.target.tagName === "BODY") {
        event.preventDefault();
        const btn = getSubmitButtonForEdit()
        if (btn) {
          btn.click()
        }
      } else {
        event.preventDefault();
        const btn = getSubmitButton()
        if (btn) {
          btn.click()
        }
      }
      
    }
  }

  handleAltS = (event) => {
    // <button data-testid="stop-generating-response-button" aria-label="応答の生成を停止" type="button" class="bg-inverse text-inverse hover:opacity-80 text-caution hover:!bg-caution hover:!text-white ml-2 font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-lg cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-[9/8]" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current" width="16" height="16"><use xlink:href="#pplx-icon-player-stop-filled"></use></svg></div></div></button>
    
    if (!isAltS(event)) return
    const stopBtn = getStopButton();
    if (stopBtn && !stopBtn.disabled) {
      event.preventDefault();   // 既定動作を抑止（念のため）
      stopBtn.click();          // 停止！
    }
    
  }
  handleAltE = (event) => {
    
  }
  
  handleAltJK = (event) => {
    if (isAltJ(event)) {
      event.preventDefault();
      jumpMessage(false); // 次へ
    } else if (isAltK(event)) {
      event.preventDefault();
      jumpMessage(true);  // 前へ
    }
  }
}



function getCurrentEditButton(edit_buttons) {
  const centerY = window.innerHeight / 2;
  let best = null;
  let bestDist = Infinity;

  for (const el of edit_buttons) {
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

function getAllUserMessageEditButton() {
  return document.querySelectorAll("button[aria-label='クエリを編集']")
}

function jumpMessage(prevFlag) {
  const editButtons = getAllUserMessageEditButton()
  consoe.log(getCurrentEditButton(editButtons))
}


function getStopButton() {
  return document.querySelector('[data-testid="stop-generating-response-button"]');
}

function getSubmitButton() {
  return document.querySelector('[data-testid="submit-button"]');
}

function getSubmitButtonForEdit() {
  const button = [...document.querySelectorAll('button')] .find(btn => btn.textContent.trim() == '完了');
  return button
}

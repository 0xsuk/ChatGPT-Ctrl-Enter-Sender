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

  handleAltS = (event) => {
    // <button data-testid="stop-generating-response-button" aria-label="応答の生成を停止" type="button" class="bg-inverse text-inverse hover:opacity-80 text-caution hover:!bg-caution hover:!text-white ml-2 font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-lg cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-[9/8]" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current" width="16" height="16"><use xlink:href="#pplx-icon-player-stop-filled"></use></svg></div></div></button>
    
    if (!isAltS(event)) return
    const stopBtn = getStopButton();
    if (stopBtn && !stopBtn.disabled) {
      event.preventDefault();   // 既定動作を抑止（念のため）
      stopBtn.click();          // 停止！
    }
    
  }
  handleAltE = (event) => {}
  handleAltJK = (event) => {}
}



function getStopButton() {
  return document.querySelector('[data-testid="stop-generating-response-button"]');
}

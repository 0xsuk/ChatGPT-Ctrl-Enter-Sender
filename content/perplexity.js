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

  handleAltS = (event) {
    
  }
  handleAltE = (event) => {}
  handleAltJK = (event) => {}
}


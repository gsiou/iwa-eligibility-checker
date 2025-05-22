const tabHeaders = {};

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const headers = {};
    for (const h of details.responseHeaders) {
      const name = h.name.toLowerCase();
      if (
        name === 'content-security-policy' ||
        name === 'cross-origin-opener-policy' ||
        name === 'cross-origin-embedder-policy' ||
        name === 'cross-origin-resource-policy'
      ) {
        if (!headers[name]) headers[name] = [];
        headers[name].push(h.value);
      }
    }
    tabHeaders[details.tabId] = headers;
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "getHeaders") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const headers = tabHeaders[tabs[0].id] || {};
      sendResponse({ headers });
    });
    return true;
  }
});

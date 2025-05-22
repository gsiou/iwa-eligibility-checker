// Expected header rules to check
const expected = {
  "content-security-policy": [
    "base-uri 'none'",
    "default-src 'self'",
    "object-src 'none'",
    "frame-src 'self' https: blob: data:",
    "connect-src 'self' https: wss: blob: data:",
    "script-src 'self' 'wasm-unsafe-eval'",
    "img-src 'self' https: blob: data:",
    "media-src 'self' https: blob: data:",
    "font-src 'self' blob: data:",
    "style-src 'self' 'unsafe-inline'",
    "require-trusted-types-for 'script'",
    "frame-ancestors 'self'",
  ],
  "cross-origin-opener-policy": ["same-origin"],
  "cross-origin-embedder-policy": ["require-corp"],
  "cross-origin-resource-policy": ["same-origin"],
};

// Render the check results in the popup
function render(headers) {
  const container = document.getElementById("result");
  if (!headers) {
    container.textContent = "No headers found.";
    return;
  }

  function checkHeader(name, actualValues) {
    const required = expected[name];
    const results = [];

    for (const rule of required) {
      const matched = actualValues.some(value => value.includes(rule));
      results.push({ rule, matched });
    }

    return results;
  }

  let html = "<h4>Header Check Results</h4><ul>";
  for (const key in expected) {
    const actual = headers[key] || [];
    const results = checkHeader(key, actual);
    html += `<li><strong>${key}</strong><ul>`;
    for (const r of results) {
      html += `<li style="color:${r.matched ? 'green' : 'red'}">`
           + `${r.matched ? '✅' : '❌'} ${r.rule}</li>`;
    }
    html += "</ul></li>";
  }
  html += "</ul>";
  container.innerHTML = html;
}

// Fetch headers from background and render results
function updateHeaders() {
  chrome.runtime.sendMessage({ type: "getHeaders" }, (res) => {
    if (res && res.headers) {
      render(res.headers);
    }
  });
}

// Initial check on popup open
// updateHeaders();

// Reload button handler with auto-refresh after reload completes
document.getElementById("reload-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    // Reload the tab
    chrome.tabs.reload(tabId);

    // Listen for reload completion
    const onUpdated = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        updateHeaders(); // Refresh headers after reload
      }
    };

    chrome.tabs.onUpdated.addListener(onUpdated);
  });
});

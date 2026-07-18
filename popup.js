const toggle = document.getElementById("toggle");

chrome.storage.local.get("enabled", ({ enabled }) => {
    toggle.checked = enabled ?? true;
});

toggle.addEventListener("change", () => {
    chrome.storage.local.set({
        enabled: toggle.checked
    });
});
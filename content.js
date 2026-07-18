const EDUCATIONAL_KEYWORDS = [
    "python","java","javascript","typescript","c","c++","c#",
    "react","nextjs","next.js","angular","vue","svelte",
    "html","css","bootstrap","tailwind",
    "node","nodejs","express","nestjs",
    "sql","mysql","postgresql","mongodb","firebase",
    "tutorial","course","lecture","full course","crash course",
    "coding","programming","developer","development",
    "leetcode","dsa","data structures","algorithms",
    "placement","interview","aptitude","system design",
    "operating system","os","dbms","computer networks","cn",
    "oops","java interview","python interview",
    "machine learning","deep learning","artificial intelligence",
    "ai","gen ai","chatgpt","openai","gemini",
    "tensorflow","keras","pytorch","opencv",
    "roadmap","guide","learn","beginner","advanced"
];

let extensionEnabled = true;

// -----------------------------
// Get Video Information
// -----------------------------
function getVideoData(card) {

    const href =
        card.querySelector(".ytLockupViewModelContentImage")?.getAttribute("href") ||
        card.querySelector(".ytLockupMetadataViewModelTitle")?.getAttribute("href") ||
        "";

    const link = href
        ? new URL(href, location.origin).href
        : "";

    const videoId =
        href.match(/[?&]v=([^&]+)/)?.[1] || "";

    const title =
        card.querySelector(".ytLockupMetadataViewModelTitle")
            ?.textContent.trim() || "";

    const channel =
        card.querySelector(".ytContentMetadataViewModelMetadataRow")
            ?.textContent.trim() || "";

    const duration =
        card.querySelector(".ytBadgeShapeText")
            ?.textContent.trim() || "";

    const thumbnail =
        card.querySelector("img")?.src || "";

    return {
        videoId,
        title,
        channel,
        duration,
        thumbnail,
        link,
        card
    };
}

// -----------------------------
// Educational Check
// -----------------------------
function isEducational(video) {

    const text =
        `${video.title} ${video.channel}`.toLowerCase();

    return EDUCATIONAL_KEYWORDS.some(keyword =>
        text.includes(keyword)
    );
}

// -----------------------------
// Blocking Rules
// -----------------------------
function shouldBlock(video) {

    const text =
        `${video.title} ${video.channel}`.toLowerCase();

    const url =
        video.link.toLowerCase();

    if (video.duration.toLowerCase() === "sponsored")
        return true;

    if (
        url.includes("list=rd") ||
        url.includes("start_radio") ||
        video.duration.toLowerCase() === "mix" ||
        text.startsWith("mix")
    )
        return true;

    if (url.includes("/shorts/"))
        return true;

    if (
        video.duration.toLowerCase() === "live" ||
        text.includes(" live")
    )
        return true;

    return !isEducational(video);
}

// -----------------------------
// Process Videos
// -----------------------------
function processVideos() {

    if (!extensionEnabled)
        return;

    document.querySelectorAll("ytd-rich-item-renderer").forEach(card => {

        const video = getVideoData(card);

        if (!video.title)
            return;

        if (shouldBlock(video)) {

            card.style.display = "none";
            card.dataset.blindlyHidden = "true";

            console.log("Blocked:", video.title);

        }

    });

}

// -----------------------------
// Restore Hidden Videos
// -----------------------------
function restoreVideos() {

    document
        .querySelectorAll("[data-blindly-hidden='true']")
        .forEach(card => {

            card.style.display = "";
            delete card.dataset.blindlyHidden;

        });

}

// -----------------------------
// Initial State
// -----------------------------
chrome.storage.local.get("enabled", ({ enabled }) => {

    extensionEnabled = enabled ?? true;

    if (extensionEnabled) {
        processVideos();
    }

});

// -----------------------------
// Infinite Scroll
// -----------------------------
const observer = new MutationObserver(() => {

    if (extensionEnabled)
        processVideos();

});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// -----------------------------
// Toggle Listener
// -----------------------------
chrome.storage.onChanged.addListener((changes) => {

    if (!changes.enabled)
        return;

    extensionEnabled = changes.enabled.newValue;

    if (extensionEnabled) {

        processVideos();

    } else {

        restoreVideos();

    }

});
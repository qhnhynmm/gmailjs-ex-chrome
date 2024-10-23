// Listener to receive the summary and display it in the sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Listener activated: Side panel is ready to receive messages.");

    if (message.type === "summary") {
        const summaryElement = document.getElementById("summary-content");
        if (summaryElement) {
            summaryElement.textContent = message.content;
            console.log("Summary received:", message.content);
        } else {
            console.error("Summary element not found in the sidepanel.");
        }
    }
});

// Log to indicate that the side panel is loaded and ready
console.log("Side panel loaded successfully and ready for messages.");

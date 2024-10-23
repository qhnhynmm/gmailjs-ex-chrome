"use strict";

// Đặt hành vi cho side panel khi nhấp vào biểu tượng extension
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error setting panel behavior:", error));

// Listener để nhận tin nhắn từ content script và chuyển tiếp đến side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "summary") {
        console.log("Received summary:", message.content);

        // Chuyển tiếp tin nhắn đến side panel
        chrome.runtime.sendMessage({
            type: "summary",
            content: message.content
        });
    }
});

// Listener để xử lý nhấp chuột vào biểu tượng extension
chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked, opening side panel...");
    // Không cần mở lại side panel, hành vi đã được thiết lập trước đó
});

"use strict";

// Loader code: Wait until GmailJS has finished loading before starting the actual extension code.
console.log("Script injected into page");

const loaderId = setInterval(() => {
    console.log("Checking if GmailJS is loaded...");

    if (!window._gmailjs) {
        return;
    }

    console.log("GmailJS loaded, initializing extension...");
    clearInterval(loaderId);
    initializeExtension(window._gmailjs);
}, 100);

// Main extension code
function initializeExtension(gmail) {
    console.log("Extension loading...");
    window.gmail = gmail;

    gmail.observe.on("load", () => {
        const userEmail = gmail.get.user_email();
        console.log("Hello, " + userEmail + ". This is your extension talking!");

        // Listen for when an email is opened
        gmail.observe.on("view_email", async (domEmail) => {
            const emailData = gmail.new.get.email_data(domEmail);

            if (emailData && emailData.content_html) {
                const emailContentText = htmlToText(emailData.content_html);
                console.log("Email content (Text only):", emailContentText);

                // Create "Summarize" button if not already present
                if (!document.getElementById("summarize-btn")) {
                    const summarizeBtn = document.createElement("button");
                    summarizeBtn.id = "summarize-btn";
                    summarizeBtn.textContent = "Summarize Email";
                    summarizeBtn.style.position = "relative";
                    summarizeBtn.style.margin = "10px 0";
                    summarizeBtn.style.padding = "10px 15px";
                    summarizeBtn.style.backgroundColor = "#4CAF50";
                    summarizeBtn.style.color = "white";
                    summarizeBtn.style.border = "none";
                    summarizeBtn.style.borderRadius = "5px";
                    summarizeBtn.style.cursor = "pointer";

                    summarizeBtn.addEventListener("click", async () => {
                        console.log("Starting summarization...");
                        summarizeBtn.textContent = "Summarizing...";

                        // Send email content to GPT-4 API and get summary
                        try {
                            const summary = await summarizeEmail(emailContentText);
                            console.log("Email Summary:", summary);

                            // Gửi tin nhắn đến side panel
                            const response = await chrome.runtime.sendMessage('hpnkgffnbhnnjhoehhgnmkclcolgpfkb',{
                                type: "summary",
                                content: summary
                            });

                            console.log("Message sent to sidepanel:", response);
                        } catch (error) {
                            console.error("Error during summarization or sending message:", error);
                        } finally {
                            // Revert button text after summarization is complete
                            summarizeBtn.textContent = "Summarize Email";
                        }
                    });

                    // Insert the button into the email header section
                    const emailHeader = document.querySelector(".ha");  // Email header section in Gmail UI
                    if (emailHeader) {
                        emailHeader.appendChild(summarizeBtn);
                    }
                }
            } else {
                console.log("Could not retrieve email content.");
            }
        });
    });
}
async function summarizeEmail(emailContent) {
    const apiKey = "";  

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: `Please summarize the following email: ${emailContent}`
                },
            ],
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

// Function to convert HTML content to plain text
function htmlToText(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
}

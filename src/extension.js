"use strict";

// Loader code: Wait until GmailJS has finished loading before starting the actual extension code.
const loaderId = setInterval(() => {
    if (!window._gmailjs) {
        return;
    }

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
            // Retrieve email data
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
                        const summary = await summarizeEmail(emailContentText);
                        console.log("Email Summary:", summary);

                        // Display the summary in a dialog box
                        showSummaryDialog(summary);

                        // Revert button text after summarization is complete
                        summarizeBtn.textContent = "Summarize Email";
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
    const apiKey = "..."; 

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
                    content: `You are a highly advanced text analysis AI designed to help users improve their communication by understanding both themselves and others in their interactions. You are embedded in a Chrome extension or email integration client, allowing you to read and analyse the email or text the end user is sending and receiving. Your job is to help the user gain insights into how their messages are perceived and how to improve their communication for greater impact. You will analyse both the sender's and the receiver's messages, focusing on emotional tone, logical vs. emotional content, suppression techniques, and whether the communication is focused on the individual ("I") or collective goals. You should also help the user understand how they are viewed by the recipient and what motivates the other person in the conversation. 

                    When reading an email thread or a message, your task is to:
                    - Analyse both the user's and the recipient's messages for emotional tone, suppression techniques, logical vs. emotional content, and "I" vs. collective focus.
                    - Identify hidden motivations and psychological needs in the other person's language that can help the user understand the recipient's perspective better.
                    - Evaluate how the user is perceived from the recipient’s point of view based on their language, tone, and message style.
                    - Offer suggestions to improve the user’s communication, with the goal of either fostering better empathy or enhancing their influence over the recipient.

                    Provide a concise analysis based on the following email content:
                    ${emailContent}

                    Focus on:
                    1. List the differences between you and the other persons in the conversation.
                    2. Educate about the receiver in a way that they will feel wow.
                    3. Suggest something about the end user themselves that will surprise them.

                    If you have enough information, provide insights into how the user is being perceived by the recipient, a summary of the emotional and rational balance in the exchange, insights into potential psychological issues from both perspectives, any suppression techniques detected, and recommendations on adjusting focus based on the recipient’s likely preferences or motivations. Answer in the same language as the user did in the conversation they shared.`
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

// Function to show the summary dialog box
function showSummaryDialog(summary) {
    // Check if a dialog already exists, if yes, remove it to avoid duplicates
    const existingDialog = document.getElementById("summary-dialog");
    if (existingDialog) {
        existingDialog.remove();
    }

    // Create a new dialog box
    const dialog = document.createElement("div");
    dialog.id = "summary-dialog";

    // Add title to the dialog box
    const title = document.createElement("h3");
    title.textContent = "Email Summary";

    // Add close button to the dialog
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", () => {
        dialog.remove();
    });

    // Add summary content to the dialog
    const summaryContent = document.createElement("p");
    summaryContent.textContent = summary;

    // Append title, content, and close button to the dialog
    dialog.appendChild(title);
    dialog.appendChild(summaryContent);
    dialog.appendChild(closeButton);

    // Append the dialog to the body of the Gmail page
    document.body.appendChild(dialog);

    const style = document.createElement("style");
    style.textContent = `
        #summary-dialog {
            position: fixed;
            right: 20px;
            top: 100px;
            width: 300px;
            max-height: 400px; /* Maximum height for the dialog */
            background-color: #ffffff;
            border: 1px solid #ccc;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 15px;
            z-index: 9999;
            font-family: Arial, sans-serif;
            border-radius: 8px;
            overflow-y: auto; /* Enable scrolling when content exceeds height */
        }

        #summary-dialog h3 {
            margin-top: 0;
            font-size: 18px;
            color: #333;
        }

        #summary-dialog p {
            font-size: 14px;
            color: #555;
            margin-bottom: 15px;
        }

        #summary-dialog button {
            background-color: #f44336;
            color: white;
            border: none;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 14px;
            margin-top: 10px;
        }

        #summary-dialog button:hover {
            background-color: #d32f2f;
        }
    `;
    document.head.appendChild(style);
}

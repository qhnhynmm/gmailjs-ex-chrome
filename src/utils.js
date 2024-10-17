"use strict";

function htmlToText(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
}

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
}

export { htmlToText, showSummaryDialog };

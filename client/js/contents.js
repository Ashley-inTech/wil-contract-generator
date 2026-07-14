//==================================================
// Contents Page
//==================================================

const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {

    const contentsList = document.getElementById("contentsList");
    const contractViewModal = document.getElementById("contractViewModal");
    const contractViewContent = document.getElementById("contractViewContent");
    const documentsModal = document.getElementById("documentsModal");
    const documentsList = document.getElementById("documentsList");
    const modalParticipantName = document.getElementById("modalParticipantName");

    //==================================================
    // Escape HTML
    //==================================================
    function escapeHtml(text) {
        if (text === null || text === undefined) {
            return "N/A";
        }
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    //==================================================
    // Format Responsibilities
    //==================================================
    function formatResponsibilities(responsibilities) {
        if (!responsibilities) {
            return "<li>No responsibilities specified</li>";
        }

        const items = Array.isArray(responsibilities)
            ? responsibilities
            : String(responsibilities)
                  .split(/\r?\n|\|\||,|;/)
                  .map(item => item.trim())
                  .filter(Boolean);

        if (!items.length) {
            return "<li>No responsibilities specified</li>";
        }

        return items
            .map(item => `<li>${escapeHtml(item)}</li>`)
            .join("");
    }

    //==================================================
    // Load Participants
    //==================================================
    async function loadParticipants() {
        try {
            const response = await fetch(`${API_URL}/participants/filter`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to load participants."
                );
            }

            renderParticipants(result.data);
        } catch (err) {
            console.error(err);
            contentsList.innerHTML = `
                <p class="empty-state">${escapeHtml(err.message)}</p>
            `;
        }
    }

    //==================================================
    // Render Participants
    //==================================================
    function renderParticipants(participants) {
        if (!participants.length) {
            contentsList.innerHTML = `
                <p class="empty-state">No participants found.</p>
            `;
            return;
        }

        contentsList.innerHTML = participants.map(participant => `
            <div class="contents-item">
                <div class="item-meta">
                    <h3>${escapeHtml(participant.first_name)} ${escapeHtml(participant.last_name)}</h3>
                    <p><strong>ID:</strong> ${escapeHtml(participant.id_number)}</p>
                    <p><strong>Career:</strong> ${escapeHtml(participant.career_name)}</p>
                    <p><strong>Status:</strong> ${escapeHtml(participant.status)}</p>
                    <p><strong>Created:</strong> ${participant.created_at ? new Date(participant.created_at).toLocaleDateString() : "N/A"}</p>
                </div>
                <div class="contents-actions">
                    <button class="secondary" data-action="view" data-id="${participant.participant_id}">View</button>
                    <button class="secondary" data-action="documents" data-id="${participant.participant_id}">Documents</button>
                    <button class="secondary" data-action="edit" data-id="${participant.participant_id}">Edit</button>
                    <button class="danger" data-action="delete" data-id="${participant.participant_id}">Delete</button>
                </div>
            </div>
        `).join("");
    }

    //==================================================
    // View Participant
    //==================================================
    async function viewParticipant(participantId) {
        try {
            contractViewContent.innerHTML = "<p>Loading participant...</p>";
            contractViewModal.style.display = "flex";

            const response = await fetch(`${API_URL}/participants/${participantId}`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to load participant.");
            }

            const participant = result.data;

            contractViewContent.innerHTML = `
                <div class="view-group">
                    <h4>Participant Details</h4>
                    <p><strong>Name:</strong> ${escapeHtml(participant.first_name)} ${escapeHtml(participant.last_name)}</p>
                    <p><strong>ID Number:</strong> ${escapeHtml(participant.id_number)}</p>
                    <p><strong>Role:</strong> ${escapeHtml(participant.role)}</p>
                    <p><strong>Career:</strong> ${escapeHtml(participant.career_name)}</p>
                    <p><strong>Status:</strong> ${escapeHtml(participant.status)}</p>
                    <p><strong>Commencement:</strong> ${escapeHtml(participant.commencement_date)}</p>
                    <p><strong>End Date:</strong> ${escapeHtml(participant.end_date)}</p>
                    <h4>Exposure Areas</h4>
                    <ul>${formatResponsibilities(participant.wil_letter_responsibilities || participant.responsibilities)}</ul>
                </div>
            `;
        } catch (err) {
            console.error(err);
            contractViewContent.innerHTML = `<p style="color:red;">${escapeHtml(err.message)}</p>`;
        }
    }

    //==================================================
    // Close View Modal
    //==================================================
    function closeViewModal() {
        contractViewModal.style.display = "none";
    }

    //==================================================
    // Download Document
    //==================================================
    function downloadDocument(url) {
        const link = document.createElement("a");
        link.href = url;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    //==================================================
    // Open Documents Modal
    //==================================================
    async function openDocumentsModal(participantId) {
        console.log("Opening documents modal for participant:", participantId);
        
        try {
            // Show modal and loading state
            documentsModal.style.display = "flex";
            documentsList.innerHTML = "<p>Loading documents...</p>";

            // Get participant details
            const response = await fetch(`${API_URL}/participants/${participantId}`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to load participant.");
            }

            const participant = result.data;
            modalParticipantName.textContent = `Documents for ${participant.first_name} ${participant.last_name}`;

            // Display document download buttons
            documentsList.innerHTML = `
                <div class="document-section">
                    <h4>📄 Internship Contract</h4>
                    <div class="document-buttons">
                        <button class="download-btn" data-url="${API_URL}/contracts/participant/${participantId}/pdf/download">
                            Download PDF
                        </button>
                        <button class="download-btn" data-url="${API_URL}/contracts/participant/${participantId}/docx/download">
                            Download DOCX
                        </button>
                    </div>
                </div>
                <hr>
                <div class="document-section">
                    <h4>📄 WIL Letter</h4>
                    <div class="document-buttons">
                        <button class="download-btn" data-url="${API_URL}/wil-letters/participant/${participantId}/pdf/download">
                            Download PDF
                        </button>
                        <button class="download-btn" data-url="${API_URL}/wil-letters/participant/${participantId}/docx/download">
                            Download DOCX
                        </button>
                    </div>
                </div>
            `;

            // Add event listeners to download buttons
            document.querySelectorAll(".download-btn").forEach(button => {
                button.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = button.dataset.url;
                    console.log("Downloading from:", url);
                    downloadDocument(url);
                });
            });

        } catch (err) {
            console.error("Error opening documents modal:", err);
            documentsList.innerHTML = `<p style="color:red;">${escapeHtml(err.message)}</p>`;
        }
    }

    //==================================================
    // Close Documents Modal
    //==================================================
    function closeDocumentsModal() {
        documentsModal.style.display = "none";
    }

    //==================================================
    // Edit Participant
    //==================================================
    function editParticipant(participantId) {
        window.location.href = `index.html?edit=${participantId}`;
    }

    //==================================================
    // Delete Participant
    //==================================================
    async function deleteParticipant(participantId, participantName) {
        if (!confirm(`Delete ${participantName}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/participants/${participantId}`, {
                method: "DELETE"
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Delete failed.");
            }

            alert("Participant deleted.");
            loadParticipants();
        } catch (err) {
            alert(err.message);
        }
    }

    //==================================================
    // Handle Button Actions
    //==================================================
    async function handleAction(event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const action = button.dataset.action;
        const participantId = button.dataset.id;
        
        if (!participantId) return;

        // For delete action, we need the participant name
        let participantName = '';
        if (action === 'delete') {
            const item = button.closest('.contents-item');
            const nameElement = item?.querySelector('h3');
            participantName = nameElement ? nameElement.textContent : 'this participant';
        }

        switch (action) {
            case "view":
                await viewParticipant(participantId);
                break;
            case "documents":
                console.log("Documents clicked for ID:", participantId);
                await openDocumentsModal(participantId);
                break;
            case "edit":
                editParticipant(participantId);
                break;
            case "delete":
                await deleteParticipant(participantId, participantName);
                break;
        }
    }

    //==================================================
    // Event Listeners
    //==================================================
    
    // Handle content list actions
    if (contentsList) {
        contentsList.addEventListener("click", handleAction);
    }

    // Close modals when clicking outside
    window.addEventListener("click", function(event) {
        if (event.target === contractViewModal) {
            closeViewModal();
        }
        if (event.target === documentsModal) {
            closeDocumentsModal();
        }
    });

    // Close buttons
    const closeViewBtn = document.getElementById("closeViewModalBtn");
    if (closeViewBtn) {
        closeViewBtn.addEventListener("click", closeViewModal);
    }

    const closeDocumentsBtn = document.getElementById("closeDocumentsModalBtn");
    if (closeDocumentsBtn) {
        closeDocumentsBtn.addEventListener("click", closeDocumentsModal);
    }

    // Load participants on page load
    loadParticipants();
});
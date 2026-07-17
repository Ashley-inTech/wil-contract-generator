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
  const generateWilModal = document.getElementById("generateWilModal");
  const wilParticipantSelect = document.getElementById("wilParticipantSelect");
  const floatingGenerateWilBtn = document.getElementById(
    "floatingGenerateWilBtn",
  );
  const pagination = document.getElementById("pagination");

  let allParticipants = [];
  let filteredParticipants = [];
  let currentPage = 1;
  const itemsPerPage = 5;

  const searchInput = document.getElementById("searchInput");

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
          .map((item) => item.trim())
          .filter(Boolean);

    if (!items.length) {
      return "<li>No responsibilities specified</li>";
    }

    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  //==================================================
  // Load Participants
  //==================================================
  async function loadParticipants() {
    try {
      const response = await fetch(`${API_URL}/participants/filter`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load participants.");
      }

      allParticipants = result.data || [];
      filteredParticipants = [...allParticipants];

      renderCurrentPage();

      populateParticipantSelect(allParticipants);
    } catch (err) {
      console.error(err);
      contentsList.innerHTML = `
                <p class="empty-state">${escapeHtml(err.message)}</p>
            `;
    }
  }

  //==================================================
  // Render Current Page
  //==================================================
  function renderCurrentPage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const pageItems = filteredParticipants.slice(start, end);

    renderParticipants(pageItems);

    renderPagination();
  }

  //==================================================
  // Render Pagination Page
  //==================================================
  function renderPagination() {
    const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);

    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    let html = "";

    html += `
            <button
                ${currentPage === 1 ? "disabled" : ""}
                data-page="${currentPage - 1}">
                Previous
            </button>
        `;

    for (let i = 1; i <= totalPages; i++) {
      html += `
                <button
                    class="${i === currentPage ? "active" : ""}"
                    data-page="${i}">
                    ${i}
                </button>
            `;
    }

    html += `
            <button
                ${currentPage === totalPages ? "disabled" : ""}
                data-page="${currentPage + 1}">
                Next
            </button>
        `;

    pagination.innerHTML = html;
  }

  //==================================================
  // Populate Participant Select for WIL Generation
  //==================================================
  function populateParticipantSelect(participants) {
    if (!wilParticipantSelect) return;

    wilParticipantSelect.innerHTML =
      '<option value="">-- Select Participant --</option>';

    participants.forEach((participant) => {
      const option = document.createElement("option");
      option.value = participant.participant_id;
      option.textContent = `${participant.first_name} ${participant.last_name} (${participant.id_number})`;
      wilParticipantSelect.appendChild(option);
    });
  }

  function applySearchFilter(query) {
    const normalized = String(query || "")
      .trim()
      .toLowerCase();

    if (!normalized) {
      return [...allParticipants];
    }

    return allParticipants.filter((participant) => {
      const values = [
        participant.first_name,
        participant.last_name,
        participant.id_number,
        participant.career_name,
        participant.status,
        participant.role,
        participant.company_name,
        participant.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return values.includes(normalized);
    });
  }

  function handleSearchInput() {
    if (!searchInput) return;

    currentPage = 1;
    filteredParticipants = applySearchFilter(searchInput.value);
    renderCurrentPage();
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

    contentsList.innerHTML = participants
      .map(
        (participant) => `
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
        `,
      )
      .join("");
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
      document.querySelectorAll(".download-btn").forEach((button) => {
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
        method: "DELETE",
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
  // Open Generate WIL Modal
  //==================================================
  function openGenerateWilModal() {
    generateWilModal.style.display = "flex";
    // Refresh the participant list
    loadParticipants();
  }

  //==================================================
  // Close Generate WIL Modal
  //==================================================
  function closeGenerateWilModal() {
    generateWilModal.style.display = "none";
    if (wilParticipantSelect) {
      wilParticipantSelect.value = "";
    }
  }

  //==================================================
  // Generate WIL Letter
  //==================================================
  async function generateWilLetter() {
    const participantId = wilParticipantSelect?.value;

    if (!participantId) {
      alert("Please select a participant.");
      return;
    }

    const generateBtn = document.getElementById("generateWilBtn");

    try {
      generateBtn.disabled = true;
      generateBtn.textContent = "Generating...";

      console.log("Generating WIL letter for participant:", participantId);

      const response = await fetch(
        `${API_URL}/wil-letters/participant/${participantId}/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            participant_id: parseInt(participantId),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `HTTP ${response.status}: Failed to generate WIL letter`,
        );
      }

      console.log("WIL letter generated successfully:", result);

      alert("WIL Letter generated successfully!");
      closeGenerateWilModal();

      // Refresh the page to show updated content
      loadParticipants();
    } catch (err) {
      console.error("WIL Generation Error:", err);
      alert("Error generating WIL letter: " + err.message);
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate WIL Letter";
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
    let participantName = "";
    if (action === "delete") {
      const item = button.closest(".contents-item");
      const nameElement = item?.querySelector("h3");
      participantName = nameElement
        ? nameElement.textContent
        : "this participant";
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

  pagination.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if (!button) return;

    currentPage = Number(button.dataset.page);

    renderCurrentPage();
  });

  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }

  // Close modals when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === contractViewModal) {
      closeViewModal();
    }
    if (event.target === documentsModal) {
      closeDocumentsModal();
    }
    if (event.target === generateWilModal) {
      closeGenerateWilModal();
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

  const closeGenerateWilBtn = document.getElementById(
    "closeGenerateWilModalBtn",
  );
  if (closeGenerateWilBtn) {
    closeGenerateWilBtn.addEventListener("click", closeGenerateWilModal);
  }

  const cancelGenerateWilBtn = document.getElementById("cancelGenerateWilBtn");
  if (cancelGenerateWilBtn) {
    cancelGenerateWilBtn.addEventListener("click", closeGenerateWilModal);
  }

  // Floating button to open Generate WIL modal
  if (floatingGenerateWilBtn) {
    floatingGenerateWilBtn.addEventListener("click", openGenerateWilModal);
  }

  // Generate WIL button
  const generateWilBtn = document.getElementById("generateWilBtn");
  if (generateWilBtn) {
    generateWilBtn.addEventListener("click", generateWilLetter);
  }

  // Load participants on page load
  loadParticipants(); 
});
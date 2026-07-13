// client/js/contents.js
const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", function () {
  const contentsList = document.getElementById("contentsList");

  // Load participants from backend
  async function loadParticipants() {
    try {
      const response = await fetch(`${API_URL}/participants/filter`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to load participants');
      }

      renderParticipants(data.data);

    } catch (err) {
      console.error('Error loading participants:', err);
      if (contentsList) {
        contentsList.innerHTML = `
          <p class="empty-state" style="color: #ef4444;">
            Error loading participants: ${err.message}
          </p>
        `;
      }
    }
  }

  // Render participants in the list
  function renderParticipants(participants) {
    if (!contentsList) return;

    if (!participants || !participants.length) {
      contentsList.innerHTML = `
        <p class="empty-state">No participants found. Create a contract from Home to populate this list.</p>
      `;
      return;
    }

    contentsList.innerHTML = participants.map(p => `
      <div class="contents-item">
        <div class="item-meta">
          <h3>${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}</h3>
          <p><strong>ID:</strong> ${escapeHtml(p.id_number || 'N/A')}</p>
          <p><strong>Career:</strong> ${escapeHtml(p.career_name || 'N/A')}</p>
          <p><strong>Status:</strong> ${escapeHtml(p.status || 'N/A')}</p>
          <p><strong>Created:</strong> ${p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div class="contents-actions">
          <button type="button" class="secondary" data-action="view" data-id="${p.participant_id}">View</button>
          <button type="button" class="secondary" data-action="download-contract" data-id="${p.participant_id}">Download Contract</button>
          <button type="button" class="secondary" data-action="download-wil" data-id="${p.participant_id}">Download WIL</button>
          <button type="button" class="secondary" data-action="edit" data-id="${p.participant_id}">Edit</button>
          <button type="button" class="danger" data-action="delete" data-id="${p.participant_id}">Delete</button>
        </div>
      </div>
    `).join("");
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    if (!text) return 'N/A';
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Format responsibilities for display
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

  // Download text file
  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  // Build contract file content from participant data
  function buildContractFile(participant) {
    return [
      "HITeK Solutions - Internship Contract",
      "----------------------------------------",
      `Participant: ${participant.first_name} ${participant.last_name}`,
      `ID Number: ${participant.id_number || 'N/A'}`,
      `Role: ${participant.role || 'N/A'}`,
      `Career: ${participant.career_name || 'N/A'}`,
      `Status: ${participant.status || 'N/A'}`,
      `Commencement Date: ${participant.commencement_date || 'N/A'}`,
      `End Date: ${participant.end_date || 'N/A'}`,
      "",
      "Responsibilities:",
      ...(participant.responsibilities || '')
        .toString()
        .split(/\r?\n|\|\||,|;/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((resp) => `- ${resp}`),
      "",
      `Created on: ${participant.created_at ? new Date(participant.created_at).toLocaleString() : 'N/A'}`,
    ].join("\n");
  }

  // Build WIL letter file content
  function buildWilLetterFile(participant) {
    const responsibilities = participant.wil_letter_responsibilities || participant.responsibilities || '';
    const list = responsibilities
      .toString()
      .split(/\r?\n|\|\||,|;/)
      .map((line) => line.trim())
      .filter(Boolean);

    return [
      "HITeK Solutions - WIL Letter",
      "-----------------------------",
      `Student Name: ${participant.first_name} ${participant.last_name}`,
      `ID Number: ${participant.id_number || 'N/A'}`,
      `Career: ${participant.career_name || 'N/A'}`,
      "",
      "Responsibilities:",
      ...(list.length
        ? list.map((item) => `- ${item}`)
        : ["- No responsibilities specified"]),
      "",
      `Generated on: ${participant.created_at ? new Date(participant.created_at).toLocaleString() : 'N/A'}`,
    ].join("\n");
  }

  // View participant details in modal
  async function viewParticipant(participantId) {
    try {
      const viewModal = document.getElementById("contractViewModal");
      const viewContent = document.getElementById("contractViewContent");
      if (!viewModal || !viewContent) return;

      // Show loading state
      viewContent.innerHTML = '<p>Loading participant details...</p>';
      viewModal.style.display = "flex";

      const response = await fetch(`${API_URL}/participants/${participantId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to load participant details');
      }

      const participant = data.data;

      viewContent.innerHTML = `
        <div class="view-group">
          <h4>Participant Details</h4>
          <p><strong>Name:</strong> ${escapeHtml(participant.first_name)} ${escapeHtml(participant.last_name)}</p>
          <p><strong>ID Number:</strong> ${escapeHtml(participant.id_number || 'N/A')}</p>
          <p><strong>Role:</strong> ${escapeHtml(participant.role || 'N/A')}</p>
          <p><strong>Career:</strong> ${escapeHtml(participant.career_name || 'N/A')}</p>
          <p><strong>Status:</strong> ${escapeHtml(participant.status || 'N/A')}</p>
          <p><strong>Commencement Date:</strong> ${escapeHtml(participant.commencement_date || 'N/A')}</p>
          <p><strong>End Date:</strong> ${escapeHtml(participant.end_date || 'N/A')}</p>
          <p><strong>Created:</strong> ${participant.created_at ? new Date(participant.created_at).toLocaleString() : 'N/A'}</p>
          <p><strong>Updated:</strong> ${participant.updated_at ? new Date(participant.updated_at).toLocaleString() : 'N/A'}</p>
          
          <h4>WIL Letter Details</h4>
          <p><strong>Student Name:</strong> ${escapeHtml(participant.first_name)} ${escapeHtml(participant.last_name)}</p>
          <p><strong>ID Number:</strong> ${escapeHtml(participant.id_number || 'N/A')}</p>
          <p><strong>Responsibilities:</strong></p>
          <ul>${formatResponsibilities(participant.wil_letter_responsibilities || participant.responsibilities)}</ul>
        </div>
      `;

    } catch (error) {
      console.error('Error viewing participant:', error);
      const viewContent = document.getElementById("contractViewContent");
      if (viewContent) {
        viewContent.innerHTML = `
          <p style="color: #ef4444;">Error loading participant details: ${error.message}</p>
        `;
      }
    }
  }

  // Close view modal
  function closeViewModal() {
    const viewModal = document.getElementById("contractViewModal");
    if (viewModal) viewModal.style.display = "none";
  }

  // Edit participant
  function editParticipant(participantId) {
    window.location.href = `index.html?edit=${participantId}`;
  }

  // Delete participant
  async function deleteParticipant(participantId, participantName) {
    if (!confirm(`Are you sure you want to delete ${participantName}? This will also delete all associated documents.`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/participants/${participantId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Participant deleted successfully!');
        loadParticipants(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to delete participant');
      }
    } catch (error) {
      console.error('Error deleting participant:', error);
      alert('Error: ' + error.message);
    }
  }

  // Handle button actions
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
      case "download-contract":
        try {
          const response = await fetch(`${API_URL}/participants/${participantId}`);
          const data = await response.json();
          if (data.success) {
            downloadTextFile(
              `Contract_${data.data.first_name}_${data.data.last_name}.txt`,
              buildContractFile(data.data)
            );
          } else {
            throw new Error('Failed to fetch participant data');
          }
        } catch (error) {
          console.error('Error downloading contract:', error);
          alert('Error downloading contract: ' + error.message);
        }
        break;
      case "download-wil":
        try {
          const response = await fetch(`${API_URL}/participants/${participantId}`);
          const data = await response.json();
          if (data.success) {
            downloadTextFile(
              `WIL_Letter_${data.data.first_name}_${data.data.last_name}.txt`,
              buildWilLetterFile(data.data)
            );
          } else {
            throw new Error('Failed to fetch participant data');
          }
        } catch (error) {
          console.error('Error downloading WIL letter:', error);
          alert('Error downloading WIL letter: ' + error.message);
        }
        break;
      case "edit":
        editParticipant(participantId);
        break;
      case "delete":
        await deleteParticipant(participantId, participantName);
        break;
    }
  }

  // Event listeners
  if (contentsList) {
    contentsList.addEventListener("click", handleAction);
  }

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    const viewModal = document.getElementById("contractViewModal");
    if (event.target === viewModal) {
      closeViewModal();
    }
  });

  // Load participants on page load
  loadParticipants();
});
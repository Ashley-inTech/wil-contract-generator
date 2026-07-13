document.addEventListener("DOMContentLoaded", function () {
  const contentsList = document.getElementById("contentsList");

  function renderContents() {
    const saved = JSON.parse(
      localStorage.getItem("generatedContracts") || "[]",
    );
    if (!contentsList) return;

    if (!saved.length) {
      contentsList.innerHTML =
        '<p class="empty-state">No contracts generated yet. Save a contract from Home to populate this list.</p>';
      return;
    }

    contentsList.innerHTML = saved
      .map(
        (contract) => `
          <div class="contents-item">
            <div class="item-meta">
              <h3>${contract.participantName}</h3>
              <p>ID: ${contract.declarationId || "N/A"}</p>
              <p>Role: ${contract.role || "N/A"}</p>
              <p>Responsibilities: ${
                contract.responsibilities || "None specified"
              }</p>
              <p>Created: ${new Date(contract.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="contents-actions">
              <button type="button" class="secondary" data-action="view" data-id="${contract.id}">View</button>
              <button type="button" class="secondary" data-action="download-contract" data-id="${contract.id}">Download Contract</button>
              <button type="button" class="secondary" data-action="download-wil" data-id="${contract.id}">Download WIL</button>
              <button type="button" class="secondary" data-action="edit" data-id="${contract.id}">Edit</button>
              <button type="button" class="danger" data-action="delete" data-id="${contract.id}">Delete</button>
            </div>
          </div>
        `,
      )
      .join("");
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

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

  function buildContractFile(contract) {
    return [
      "HITeK Solutions - Internship Contract",
      "----------------------------------------",
      `Participant: ${contract.participantName}`,
      `ID Number: ${contract.declarationId || "N/A"}`,
      `Role: ${contract.role || "N/A"}`,
      `Commencement Date: ${contract.commencementDate || "N/A"}`,
      `End Date: ${contract.endDate || "N/A"}`,
      "",
      "Responsibilities:",
      ...(contract.responsibilitiesList || contract.responsibilities || "")
        .toString()
        .split(/\r?\n|\|\||,|;/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((resp) => `- ${resp}`),
      "",
      `Saved on: ${new Date(contract.createdAt).toLocaleString()}`,
    ].join("\n");
  }

  function buildWilLetterFile(contract) {
    const responsibilities = contract.wilLetter?.responsibilities || "";
    const list = responsibilities
      .toString()
      .split(/\r?\n|\|\||,|;/)
      .map((line) => line.trim())
      .filter(Boolean);

    return [
      "HITeK Solutions - WIL Letter",
      "-----------------------------",
      `Student Name: ${contract.wilLetter?.name || "N/A"}`,
      `ID Number: ${contract.wilLetter?.id || "N/A"}`,
      "",
      "Responsibilities:",
      ...(list.length
        ? list.map((item) => `- ${item}`)
        : ["- No responsibilities specified"]),
      "",
      `Generated from Contract: ${contract.participantName}`,
      `Generated on: ${new Date(contract.createdAt).toLocaleString()}`,
    ].join("\n");
  }

  function openViewModal(contract) {
    const viewModal = document.getElementById("contractViewModal");
    const viewContent = document.getElementById("contractViewContent");
    if (!viewModal || !viewContent) return;

    const responsibilities =
      contract.wilLetter?.responsibilities || contract.responsibilities || "";

    viewContent.innerHTML = `
      <div class="view-group">
        <h4>Contract</h4>
        <p><strong>Participant:</strong> ${escapeHtml(
          contract.participantName,
        )}</p>
        <p><strong>ID Number:</strong> ${escapeHtml(
          contract.declarationId || "N/A",
        )}</p>
        <p><strong>Role:</strong> ${escapeHtml(contract.role || "N/A")}</p>
        <p><strong>Commencement:</strong> ${escapeHtml(
          contract.commencementDate || "N/A",
        )}</p>
        <p><strong>End Date:</strong> ${escapeHtml(
          contract.endDate || "N/A",
        )}</p>
        <h4>WIL Letter</h4>
        <p><strong>Student Name:</strong> ${escapeHtml(
          contract.wilLetter?.name || "N/A",
        )}</p>
        <p><strong>ID Number:</strong> ${escapeHtml(
          contract.wilLetter?.id || "N/A",
        )}</p>
        <p><strong>Responsibilities:</strong></p>
        <ul>${formatResponsibilities(responsibilities)}</ul>
      </div>
    `;

    viewModal.style.display = "flex";
  }

  function closeViewModal() {
    const viewModal = document.getElementById("contractViewModal");
    if (viewModal) viewModal.style.display = "none";
  }

  function handleAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;
    const saved = JSON.parse(
      localStorage.getItem("generatedContracts") || "[]",
    );
    const contract = saved.find((item) => item.id === id);

    if (!contract) return;

    switch (action) {
      case "view":
        openViewModal(contract);
        break;
      case "download-contract":
        downloadTextFile(
          `Contract_${contract.participantName || "participant"}.txt`,
          buildContractFile(contract),
        );
        break;
      case "download-wil":
        downloadTextFile(
          `WIL_Letter_${contract.participantName || "participant"}.txt`,
          buildWilLetterFile(contract),
        );
        break;
      case "edit":
        window.location.href = `index.html?edit=${contract.id}`;
        break;
      case "delete":
        if (confirm(`Delete ${contract.participantName}?`)) {
          const updated = saved.filter((item) => item.id !== id);
          localStorage.setItem("generatedContracts", JSON.stringify(updated));
          renderContents();
        }
        break;
    }
  }

  if (contentsList) {
    contentsList.addEventListener("click", handleAction);
  }

  window.addEventListener("click", function (event) {
    const viewModal = document.getElementById("contractViewModal");
    if (event.target === viewModal) {
      closeViewModal();
    }
  });

  renderContents();
});

//client/js/app.js

function getOrdinal(day) {
  if (day > 3 && day < 21) return day + "th";
  switch (day % 10) {
    case 1:
      return day + "st";
    case 2:
      return day + "nd";
    case 3:
      return day + "rd";
    default:
      return day + "th";
  }
}

/**
 * PDF Download Function - Captures document as images with proper font embedding
 */
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const button = document.getElementById("downloadPDF");
  const originalText = button.innerHTML;

  button.innerHTML = "Generating PDF...";
  button.disabled = true;

  const downloadSection = document.querySelector(".download-section");
  downloadSection.style.display = "none";

  const editorElements = document.querySelectorAll(".editor-only");
  editorElements.forEach((element) => {
    element.style.display = "none";
  });

  const textarea = document.getElementById("responsibilities");
  const preview = document.getElementById("responsibilitiesPreview");
  preview.textContent = textarea.value;
  textarea.style.display = "none";
  preview.style.display = "block";

  try {
    const participant =
      document.getElementById("participantName").value.trim() || "Participant";

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pages = document.querySelectorAll(".page");

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: function (clonedDoc) {
          // Add Poppins font to cloned document
          const fontLink = clonedDoc.createElement("link");
          fontLink.href =
            "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
          fontLink.rel = "stylesheet";
          clonedDoc.head.appendChild(fontLink);
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdfWidth = 210;
      const pdfHeight = 297;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`Hiteknology_Contract_Agreement_${participant}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Failed to generate PDF.\n\n" + err.message);
  } finally {
    downloadSection.style.display = "flex";
    editorElements.forEach((element) => {
      element.style.display = "block";
    });
    textarea.style.display = "block";
    preview.style.display = "none";
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

/**
 * Word Download Function - Creates DOCX with embedded images
 */
async function downloadWord() {
  try {
    const button = document.getElementById("downloadWord");
    const originalText = button.innerHTML;
    button.innerHTML = "Generating DOCX...";
    button.disabled = true;

    const downloadSection = document.querySelector(".download-section");
    if (downloadSection) {
      downloadSection.style.display = "none";
    }

    const textarea = document.getElementById("responsibilities");
    const preview = document.getElementById("responsibilitiesPreview");
    if (textarea && preview) {
      preview.textContent = textarea.value;
      textarea.style.display = "none";
      preview.style.display = "block";
    }

    const { Document, Packer, ImageRun, Paragraph, convertInchesToTwip } = docx;

    const participant =
      document.getElementById("participantName").value || "Participant";

    const pages = document.querySelectorAll(".page");
    const pageImages = [];

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: function (clonedDoc) {
          // Add Poppins font to cloned document
          const fontLink = clonedDoc.createElement("link");
          fontLink.href =
            "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
          fontLink.rel = "stylesheet";
          clonedDoc.head.appendChild(fontLink);
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pageImages.push(imgData);
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.5),
                bottom: convertInchesToTwip(0.5),
                left: convertInchesToTwip(0.5),
                right: convertInchesToTwip(0.5),
              },
            },
          },
          children: pageImages.map((imgData, index) => {
            const base64Data = imgData.split(",")[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const imageRun = new ImageRun({
              data: bytes,
              transformation: {
                width: 550,
                height: 780,
              },
              type: "jpeg",
            });

            return new Paragraph({
              children: [imageRun],
              pageBreakBefore: index > 0,
            });
          }),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Hiteknology_Contract_${participant}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("DOCX generation error:", error);
    alert("Error generating DOCX file: " + error.message);
  } finally {
    const downloadSection = document.querySelector(".download-section");
    if (downloadSection) {
      downloadSection.style.display = "flex";
    }

    const textarea = document.getElementById("responsibilities");
    const preview = document.getElementById("responsibilitiesPreview");
    if (textarea && preview) {
      textarea.style.display = "block";
      preview.style.display = "none";
    }

    const button = document.getElementById("downloadWord");
    button.innerHTML = "Download as Word";
    button.disabled = false;
  }
}

/**
 * Update the role field based on selected career
 */
function updateRoleFromCareer() {
  const careerDropdown = document.getElementById("careerCategory");
  const roleInput = document.getElementById("role");
  const selectedCareer = careerDropdown.value;

  if (selectedCareer && careers[selectedCareer]) {
    roleInput.value = selectedCareer;
    roleInput.placeholder = selectedCareer;
  } else {
    roleInput.value = "";
    roleInput.placeholder = "Select a career above";
  }
}

// DOM Ready
document.addEventListener("DOMContentLoaded", function () {
  // Check if careers object exists
  if (typeof careers === "undefined") {
    console.error("Careers object not found! Make sure careers.js is loaded.");
    return;
  }

  // Career dropdown logic
  const careerDropdown = document.getElementById("careerCategory");
  const roleInput = document.getElementById("role");
  const participantName = document.getElementById("participantName");
  const declarationName = document.getElementById("declarationName");
  const declarationId = document.getElementById("declarationId");
  const wilLetterName = document.getElementById("wilLetterParticipantName");
  const wilLetterId = document.getElementById("wilLetterParticipantId");
  const wilLetterNameInput = document.getElementById("wilLetterNameInput");
  const wilLetterIdInput = document.getElementById("wilLetterIdInput");
  const wilLetterEditor = document.getElementById("wilLetterEditor");
  const editWilLetterBtn = document.getElementById("editWilLetterBtn");
  const saveWilLetterBtn = document.getElementById("saveWilLetterBtn");
  const cancelWilLetterBtn = document.getElementById("cancelWilLetterBtn");

  if (!careerDropdown) {
    console.error("Career dropdown not found!");
    return;
  }

  // Clear existing options (except the first one)
  while (careerDropdown.options.length > 1) {
    careerDropdown.remove(1);
  }

  // Populate dropdown from careers object
  for (const career in careers) {
    if (careers.hasOwnProperty(career)) {
      const option = document.createElement("option");
      option.value = career;
      option.textContent = career;
      careerDropdown.appendChild(option);
    }
  }

  // Change event - update role and responsibilities
  careerDropdown.addEventListener("change", function () {
    const selected = careers[this.value];

    updateRoleFromCareer();

    if (selected) {
      document.getElementById("responsibilities").value =
        selected.responsibilities || "";
    } else {
      document.getElementById("responsibilities").value = "";
    }
  });

  // Add career logic
  const addCareerBtn = document.getElementById("addCareerBtn");
  if (addCareerBtn) {
    addCareerBtn.addEventListener("click", openCareerModal);
  }

  const saveCareerBtn = document.getElementById("saveCareerBtn");
  if (saveCareerBtn) {
    saveCareerBtn.addEventListener("click", function () {
      const careerName = document
        .getElementById("modalCareerName")
        .value.trim();
      const responsibilities = document
        .getElementById("modalResponsibilities")
        .value.trim();

      if (!careerName) {
        alert("Please enter a career name.");
        return;
      }

      careers[careerName] = {
        role: careerName,
        responsibilities: responsibilities,
      };

      const option = document.createElement("option");
      option.value = careerName;
      option.textContent = careerName;
      careerDropdown.appendChild(option);
      careerDropdown.value = careerName;

      updateRoleFromCareer();
      document.getElementById("responsibilities").value = responsibilities;

      document.getElementById("modalCareerName").value = "";
      document.getElementById("modalResponsibilities").value = "";
      closeCareerModal();
    });
  }

  const cancelCareerBtn = document.getElementById("cancelCareerBtn");
  if (cancelCareerBtn) {
    cancelCareerBtn.addEventListener("click", function () {
      closeCareerModal();
    });
  }

  function getStoredContracts() {
    return JSON.parse(localStorage.getItem("generatedContracts") || "[]");
  }

  function storeContract(contract) {
    const saved = getStoredContracts();
    const existingIndex = saved.findIndex((item) => item.id === contract.id);
    if (existingIndex !== -1) {
      saved[existingIndex] = contract;
    } else {
      saved.unshift(contract);
    }
    localStorage.setItem("generatedContracts", JSON.stringify(saved));
  }

  function recordGeneratedContract() {
    const participant =
      document.getElementById("participantName").value.trim() || "Participant";
    const commencementDate =
      document.getElementById("commencementDate").value || "";
    const endDate = document.getElementById("endDate").value || "";
    const id = `contract-${Date.now()}`;

    storeContract({
      id,
      participantName: participant,
      commencementDate,
      endDate,
      createdAt: new Date().toISOString(),
    });
  }

  function getDraftContract() {
    return JSON.parse(localStorage.getItem("draftContract") || "null") || {};
  }

  function saveDraftContract(draft) {
    localStorage.setItem("draftContract", JSON.stringify(draft));
  }

  function getDraftWilLetter() {
    return JSON.parse(localStorage.getItem("draftWilLetter") || "null") || {};
  }

  function saveDraftWilLetter(letterData) {
    localStorage.setItem("draftWilLetter", JSON.stringify(letterData));
  }

  function updateWilLetterDraft() {
    const draft = {
      participantName: participantName ? participantName.value.trim() : "",
      declarationId: declarationId ? declarationId.value.trim() : "",
      role: roleInput ? roleInput.value.trim() : "",
      responsibilities: document.getElementById("responsibilities")
        ? document.getElementById("responsibilities").value.trim()
        : "",
      commencementDate:
        document.getElementById("commencementDate")?.value || "",
      endDate: document.getElementById("endDate")?.value || "",
    };

    saveDraftContract(draft);
    saveDraftWilLetter({
      name: draft.participantName || "",
      id: draft.declarationId || "",
      responsibilities: draft.responsibilities || "",
    });
  }

  function syncWilLetterFromContract() {
    updateWilLetterDraft();
  }

  function loadContractDraft() {
    const draft = getDraftContract();
    if (!draft) return;

    if (participantName && draft.participantName) {
      participantName.value = draft.participantName;
      if (declarationName) declarationName.value = draft.participantName;
    }

    if (declarationId && draft.declarationId) {
      declarationId.value = draft.declarationId;
    }

    if (roleInput && draft.role) {
      roleInput.value = draft.role;
    }

    const responsibilitiesField = document.getElementById("responsibilities");
    if (responsibilitiesField && draft.responsibilities) {
      responsibilitiesField.value = draft.responsibilities;
    }

    const commencementField = document.getElementById("commencementDate");
    if (commencementField && draft.commencementDate) {
      commencementField.value = draft.commencementDate;
    }

    const endField = document.getElementById("endDate");
    if (endField && draft.endDate) {
      endField.value = draft.endDate;
    }

    updateWilLetterDraft();
  }

  function clearContractFields() {
    if (participantName) participantName.value = "";
    if (declarationName) declarationName.value = "";
    if (declarationId) declarationId.value = "";
    if (document.getElementById("commencementDate"))
      document.getElementById("commencementDate").value = "";
    if (document.getElementById("endDate"))
      document.getElementById("endDate").value = "";
    if (roleInput) roleInput.value = "";
    const responsibilitiesField = document.getElementById("responsibilities");
    if (responsibilitiesField) responsibilitiesField.value = "";
    localStorage.removeItem("draftContract");
  }

  function saveGeneratedContract() {
    const draft = getDraftContract();
    const responsibilitiesString = draft.responsibilities || "";
    const responsibilitiesArray = responsibilitiesString
      .split(/\r?\n|\|\||,|;/)
      .map((line) => line.trim())
      .filter(Boolean);

    const contract = {
      id: `contract-${Date.now()}`,
      participantName: draft.participantName || "",
      declarationId: draft.declarationId || "",
      role: draft.role || "",
      responsibilities: responsibilitiesString,
      responsibilitiesList: responsibilitiesArray,
      commencementDate: draft.commencementDate || "",
      endDate: draft.endDate || "",
      createdAt: new Date().toISOString(),
      wilLetter: {
        name: draft.participantName || "",
        id: draft.declarationId || "",
        responsibilities: responsibilitiesString || "",
      },
    };

    storeContract(contract);
    saveDraftWilLetter(contract.wilLetter);
    clearContractFields();
    alert(
      "Contract and WIL letter have been saved to Contents. You can review them on the Contents page.",
    );
  }

  function openGenerateModal() {
    const modal = document.getElementById("confirmGenerateModal");
    if (modal) {
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
    }
  }

  function closeGenerateModal() {
    const modal = document.getElementById("confirmGenerateModal");
    if (modal) {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    }
  }

  const generateBtn = document.getElementById("generateContract");
  const confirmYesBtn = document.getElementById("confirmGenerateYes");
  const confirmNoBtn = document.getElementById("confirmGenerateNo");
  const responsibilitiesField = document.getElementById("responsibilities");

  if (generateBtn) {
    generateBtn.addEventListener("click", openGenerateModal);
  }

  if (confirmYesBtn) {
    confirmYesBtn.addEventListener("click", function () {
      saveGeneratedContract();
      closeGenerateModal();
    });
  }

  if (confirmNoBtn) {
    confirmNoBtn.addEventListener("click", closeGenerateModal);
  }

  if (participantName && declarationName) {
    participantName.addEventListener("input", function () {
      declarationName.value = this.value;
      syncWilLetterFromContract();
      updateWilLetterDraft();
    });

    participantName.addEventListener("blur", function () {
      declarationName.value = this.value;
      syncWilLetterFromContract();
      updateWilLetterDraft();
    });

    if (participantName.value) {
      declarationName.value = participantName.value;
    }
  }

  if (declarationId) {
    declarationId.addEventListener("input", function () {
      syncWilLetterFromContract();
      updateWilLetterDraft();
    });
    declarationId.addEventListener("blur", function () {
      syncWilLetterFromContract();
      updateWilLetterDraft();
    });
  }

  if (responsibilitiesField) {
    responsibilitiesField.addEventListener("input", updateWilLetterDraft);
  }

  if (careerDropdown) {
    careerDropdown.addEventListener("change", function () {
      const selected = careers[this.value];

      updateRoleFromCareer();

      if (selected) {
        document.getElementById("responsibilities").value =
          selected.responsibilities || "";
      } else {
        document.getElementById("responsibilities").value = "";
      }

      updateWilLetterDraft();
    });
  }

  const commencementField = document.getElementById("commencementDate");
  const endField = document.getElementById("endDate");
  if (commencementField) {
    commencementField.addEventListener("change", updateWilLetterDraft);
  }
  if (endField) {
    endField.addEventListener("change", updateWilLetterDraft);
  }

  const queryParams = new URLSearchParams(window.location.search);
  if (!queryParams.has("edit")) {
    localStorage.removeItem("draftContract");
    localStorage.removeItem("draftWilLetter");
  }

  loadContractDraft();

  // Keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === "P") {
      e.preventDefault();
      if (pdfBtn) pdfBtn.click();
    }
    if (e.ctrlKey && e.shiftKey && e.key === "W") {
      e.preventDefault();
      if (wordBtn) wordBtn.click();
    }
  });

  // Allow manual editing of role field
  if (roleInput) {
    roleInput.addEventListener("focus", function () {
      this.dataset.previousValue = this.value;
    });

    roleInput.addEventListener("change", function () {
      console.log("Role manually changed to:", this.value);
    });
  }

  console.log("✅ Document ready!");
  console.log("📄 Press Ctrl+Shift+P to download PDF");
  console.log("📄 Press Ctrl+Shift+W to download Word");
  console.log("📋 Careers loaded:", Object.keys(careers).length);
});

// Handle errors globally
window.addEventListener("error", function (e) {
  console.error("Global error:", e.message);
});

// Export functions for debugging
window.downloadPDF = downloadPDF;
window.downloadWord = downloadWord;
window.updateRoleFromCareer = updateRoleFromCareer;

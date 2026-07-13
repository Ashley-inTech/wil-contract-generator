document.addEventListener("DOMContentLoaded", function () {
  const wilLetterName = document.getElementById("wilLetterParticipantName");
  const wilLetterId = document.getElementById("wilLetterParticipantId");
  const wilLetterDate = document.getElementById("wilLetterDate");
  const wilLetterNameInput = document.getElementById("wilLetterNameInput");
  const wilLetterIdInput = document.getElementById("wilLetterIdInput");
  const wilLetterEditor = document.getElementById("wilLetterEditor");
  const editWilLetterBtn = document.getElementById("editWilLetterBtn");
  const saveWilLetterBtn = document.getElementById("saveWilLetterBtn");
  const cancelWilLetterBtn = document.getElementById("cancelWilLetterBtn");

  function formatResponsibilitiesList(responsibilities) {
    if (!responsibilities) {
      return [];
    }

    return Array.isArray(responsibilities)
      ? responsibilities
      : String(responsibilities)
          .split(/\r?\n|\|\||,|;/)
          .map((line) => line.trim())
          .filter(Boolean);
  }

  function loadWilLetter() {
    const saved = JSON.parse(localStorage.getItem("draftWilLetter") || "null");
    wilLetterDate.textContent = new Date().toLocaleDateString();
    if (!saved) return;

    wilLetterName.textContent = saved.name || "";
    wilLetterId.textContent = saved.id || "";
    wilLetterNameInput.value = saved.name || "";
    wilLetterIdInput.value = saved.id || "";

    const responsibilitiesElement = document.getElementById(
      "wilLetterResponsibilities",
    );
    if (responsibilitiesElement) {
      const items = formatResponsibilitiesList(saved.responsibilities);
      responsibilitiesElement.innerHTML = items
        .map((item) => `<li>${item}</li>`)
        .join("");
    }
  }

  function saveWilLetter() {
    const name = wilLetterNameInput.value.trim();
    const id = wilLetterIdInput.value.trim();

    const responsibilitiesElement = document.getElementById(
      "wilLetterResponsibilities",
    );
    let responsibilities = "";
    if (responsibilitiesElement) {
      responsibilities = Array.from(
        responsibilitiesElement.querySelectorAll("li"),
      )
        .map((li) => li.textContent.trim())
        .join("\n");
    }

    const saved = {
      name: name || "",
      id: id || "",
      responsibilities,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("draftWilLetter", JSON.stringify(saved));
    loadWilLetter();
    wilLetterEditor.hidden = true;
  }

  if (editWilLetterBtn) {
    editWilLetterBtn.addEventListener("click", function () {
      wilLetterEditor.hidden = false;
      wilLetterNameInput.value = wilLetterName.textContent || "";
      wilLetterIdInput.value = wilLetterId.textContent || "";
    });
  }

  if (saveWilLetterBtn) {
    saveWilLetterBtn.addEventListener("click", saveWilLetter);
  }

  if (cancelWilLetterBtn) {
    cancelWilLetterBtn.addEventListener("click", function () {
      wilLetterEditor.hidden = true;
    });
  }

  loadWilLetter();
});

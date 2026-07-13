//client/js/contractSave.js

const API_URL = 'http://localhost:3000/api';


const saveContractBtn = document.getElementById("saveContractBtn");
const careerCategory = document.getElementById("careerCategory");

let careers = [];

//==============================
// Load Career Categories
//==============================
async function loadCareerCategories() {
    try {
        const response = await fetch(`${API_URL}/careers`, {
                                        method: "GET"
                                    });

        if (!response.ok) {
            throw new Error("Failed to load careers");
        }

        const responseData = await response.json();

        careers = responseData.data;

        careerCategory.innerHTML =
            `<option value="">-- Select Career --</option>`;

        careers.forEach(career => {
            const option = document.createElement("option");
            option.value = career.career_id;
            option.textContent = career.career_name;
            careerCategory.appendChild(option);
        });

    } catch (err) {
        console.error(err);
        alert("Unable to load career categories.");
    }
}

const editId = new URLSearchParams(window.location.search).get("edit");

loadCareerCategories().then(() => {
    if (editId) {
        loadParticipantForEdit(editId);
    }
});

async function loadParticipantForEdit(participantId) {
    try {
        const response = await fetch(`${API_URL}/participants/${participantId}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to load participant");
        }

        const participant = result.data;

        document.getElementById("participantName").value =
            `${participant.first_name} ${participant.last_name}`;
        document.getElementById("declarationName").value =
            `${participant.first_name} ${participant.last_name}`;
        document.getElementById("declarationId").value = participant.id_number;
        document.getElementById("commencementDate").value = participant.commencement_date?.slice(0, 10) || "";
        document.getElementById("endDate").value = participant.termination_date?.slice(0, 10) || "";
        document.getElementById("role").value = participant.participant_role || "";
        document.getElementById("responsibilities").value = participant.responsibilities || "";

        if (participant.career_id) {
            careerCategory.value = participant.career_id;
        }
    } catch (err) {
        console.error(err);
        alert("Unable to load participant for editing.");
    }
}


//==============================
//Listen for changes and set careeer details
//==============================
careerCategory.addEventListener("change", fillCareerDetails);

function fillCareerDetails() {

    const selectedCareerId = Number(careerCategory.value);

    const selectedCareer = careers.find(career =>
        career.career_id === selectedCareerId
    );

    if (!selectedCareer) return;

    document.getElementById("role").value =
        selectedCareer.role || "";

    document.getElementById("responsibilities").value =
        selectedCareer.responsibilities || "";

}

//==============================
// Sync names
//==============================
const participantName = document.getElementById("participantName");
const declarationName = document.getElementById("declarationName");

participantName.addEventListener("input", syncParticipantName);

function syncParticipantName() {
    declarationName.value = participantName.value;
}

//==============================
// Store in local storage & Save Contract
//==============================

saveContractBtn.addEventListener("click", saveContract);

async function saveContract() {

    const participantName = document.getElementById("participantName").value.trim();

    const names = participantName.split(" ");

    const first_name = names.shift() || "";
    const last_name = names.join(" ");

    const contractData = {

        first_name,
        last_name,

        id_number: document.getElementById("declarationId").value.trim(),

        commencement_date: document.getElementById("commencementDate").value,

        termination_date: document.getElementById("endDate").value,

        career_id: careerCategory.value,

        participant_role: document.getElementById("role").value,

        responsibilities: document.getElementById("responsibilities").value

    };

    if (editId) {
        contractData.participant_id = Number(editId);
    }

    localStorage.setItem(
        "contractData",
        JSON.stringify(contractData)
    );

    window.location.href = "wil-letter.html";

}


//add career category 

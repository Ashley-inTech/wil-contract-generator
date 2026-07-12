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

loadCareerCategories();


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

    localStorage.setItem(
        "contractData",
        JSON.stringify(contractData)
    );

    window.location.href = "wil-letter.html";

}


//add career category 

//client/js/wilLetterSave.js

const API_URL = 'http://localhost:3000/api';

const contractData = JSON.parse(
    localStorage.getItem("contractData")
);

const careerCategory =
    document.getElementById("careerCategory");

const exposureCategory =
    document.getElementById("exposureCategory");

//==============================
//Get Contract data from local storage
//==============================
async function loadContractData() {

    if(!contractData){
        alert("No contract data found.");
        window.location.href = "index.html";
        return;
    }

    console.log(contractData);

    document.getElementById("participantName").value =
        `${contractData.first_name} ${contractData.last_name}`;

    document.getElementById("declarationId").value =
        contractData.id_number;

    document.getElementById("commencementDate").value =
        contractData.commencement_date;

    document.getElementById("endDate").value =
        contractData.termination_date;

    careerCategory.value = contractData.career_id;



    await loadCareerCategories();

    // Wait until exposure areas are loaded
    await loadExposureAreas();
}

loadContractData();


//load career category
async function loadCareerCategories() {

    const response = await fetch(`${API_URL}/careers`);

    if (!response.ok) {
        console.error(responseData);
        return;
    }

    const data = await response.json();

    data.data.forEach(career => {

        const option = document.createElement("option");

        option.value = career.career_id;
        option.textContent = career.career_name;

        careerCategory.appendChild(option);
    });

    careerCategory.value = contractData.career_id;

    await loadExposureAreas();
}

//==============================
// Fetch exposure areas and store in storage
//==============================

careerCategory.addEventListener("change", loadExposureAreas);

async function loadExposureAreas() {

    const careerId = careerCategory.value;

    if (!careerId) {
        exposureCategory.value = "";
        return;
    }

    const response = await fetch(
        `${API_URL}/exposures/career/${careerId}`
    );

    const responseData = await response.json();
    console.log(responseData.data);

    if (!response.ok) {
        console.error(responseData);
        return;
    }

    exposureCategory.value = responseData.data
        .map(area => `• ${area.exposure_name}`)
        .join("\n");

    console.log(exposureCategory);
}


//save participant details

const saveBtn =
    document.getElementById("saveWilContract");


saveBtn.addEventListener("click", saveAll);

async function saveOrUpdateParticipant(participantData) {
    if (participantData.participant_id) {
        const updateResponse = await fetch(
            `${API_URL}/participants/${participantData.participant_id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(participantData)
            }
        );

        const updateResult = await updateResponse.json();

        if (!updateResponse.ok) {
            throw new Error(updateResult.message || "Failed to update participant");
        }

        return participantData.participant_id;
    }

    const createResponse = await fetch(`${API_URL}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(participantData)
    });

    const createResult = await createResponse.json();

    if (createResponse.ok) {
        return createResult.data.participant_id;
    }

    if (createResponse.status === 400 &&
        createResult.message?.includes("already exists")) {

        const lookupResponse = await fetch(
            `${API_URL}/participants/by-id-number/${encodeURIComponent(participantData.id_number)}`
        );

        const lookupResult = await lookupResponse.json();

        if (!lookupResponse.ok) {
            throw new Error(lookupResult.message || "Failed to find existing participant");
        }

        const participantId = lookupResult.data.participant_id;

        const updateResponse = await fetch(`${API_URL}/participants/${participantId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(participantData)
        });

        const updateResult = await updateResponse.json();

        if (!updateResponse.ok) {
            throw new Error(updateResult.message || "Failed to update existing participant");
        }

        return participantId;
    }

    throw new Error(createResult.message || "Failed to save participant");
}

async function saveAll() {

    try{

        const participantData = {

            ...contractData,

            career_id: careerCategory.value,

            exposure_areas: exposureCategory.value

        };

        const participant_id = await saveOrUpdateParticipant(participantData); 

        console.log("Generating contract...");

        const contractResponse = await fetch(`${API_URL}/contracts/participant/${participant_id}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ participant_id })
        });

        const contractResult = await contractResponse.json();

        if (!contractResponse.ok) {
            throw new Error(contractResult.message || "Failed to generate contract");
        }

        const wilResponse = await fetch(`${API_URL}/wil-letters/participant/${participant_id}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ participant_id })
        });

        const wilResult = await wilResponse.json();

        if (!wilResponse.ok) {
            throw new Error(wilResult.message || "Failed to generate WIL letter");
        }

        localStorage.removeItem("contractData");
        alert("Participant saved and documents generated successfully.");
        window.location.href = "participants.html";

    } catch (err) {
        console.error("SAVE ERROR");
        console.error(err);

        if(err.stack){
            console.error(err.stack);
        }

        alert(err.message);
    }
}
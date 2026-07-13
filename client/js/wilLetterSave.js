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

//loadContractData();
if (!localStorage.getItem("generateWil")) {
    loadContractData();
}


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

        localStorage.setItem("generateWil", "true");
        localStorage.setItem("participantId", participant_id);

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



//add exposure areas & link to the added career category from the list 
const addExposureToListBtn =
    document.getElementById("addExposureToListBtn");

const exposureList =
    document.getElementById("exposureList");

let pendingExposureAreas = [];

//======================================
// Exposure Area Modal
//======================================

const exposureModal =
    document.getElementById("exposureModal");

const addExposureBtn =
    document.getElementById("addExposureBtn");

const saveExposureBtn =
    document.getElementById("saveExposureBtn");

const cancelExposureBtn =
    document.getElementById("cancelExposureBtn");

const modalCareerCategory =
    document.getElementById("modalCareerCategory");

const modalExposureName =
    document.getElementById("modalExposureName");


//==============================
// Open Modal
//==============================
async function openExposureModal(){

    exposureModal.style.display="flex";

    pendingExposureAreas=[];

    renderExposureList();

    await loadModalCareers();

}


//==============================
// Close Modal
//==============================
function closeExposureModal(){

    exposureModal.style.display="none";

    modalExposureName.value="";

    pendingExposureAreas=[];

    renderExposureList();

}


//==============================
// Add Exposure To List
//==============================
function addExposureToList() {

    const name =
        modalExposureName.value.trim();

    if (!name) {

        alert("Enter an exposure area.");

        return;

    }

    const exists = pendingExposureAreas.some(area =>
        area.exposure_name.toLowerCase() ===
        name.toLowerCase()
    );

    if (exists) {
        alert("Exposure already added.");
        return;
    }

    pendingExposureAreas.push({

        exposure_name: name

    });

    modalExposureName.value = "";

    renderExposureList();

}


//render exposure list
function renderExposureList(){

    exposureList.innerHTML="";

    pendingExposureAreas.forEach((area,index)=>{

        const li=document.createElement("li");

        li.innerHTML=`

            <span>${area.exposure_name}</span>

            <button
                type="button"
                class="removeExposure"
                data-index="${index}">
                Remove
            </button>

        `;

        exposureList.appendChild(li);

    });

}

//==============================
// Load careers into modal
//==============================
async function loadModalCareers() {

    try {

        const response =
            await fetch(`${API_URL}/careers`);

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        modalCareerCategory.innerHTML =
            `<option value="">-- Select Career --</option>`;

        result.data.forEach(career => {

            const option =
                document.createElement("option");

            option.value =
                career.career_id;

            option.textContent =
                career.career_name;

            modalCareerCategory.appendChild(option);

        });

        // Preselect current career
        modalCareerCategory.value =
            careerCategory.value;

    }
    catch (err) {

        console.error(err);

    }

}


//==============================
// Save Exposure Area
//==============================
async function saveExposureArea(){

    const careerId =
        modalCareerCategory.value;

    if(!careerId){

        alert("Select a career.");

        return;

    }

    if(pendingExposureAreas.length===0){

        alert("Add at least one exposure.");

        return;

    }

    

    try{

        const response =
            await fetch(
                `${API_URL}/exposures/bulk`,
                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        careerId,

                        exposures:
                            pendingExposureAreas.map(area => area.exposure_name)

                    })

                }
            );

        const result =
            await response.json();

        if(!response.ok){

            throw new Error(result.message);

        }

        alert("Exposure areas saved.");

        if(careerCategory.value==careerId){

            await loadExposureAreas();

        }

        closeExposureModal();

    }
    catch(err){

        console.error(err);

        alert(err.message);

    }

}


function removeExposureArea(e){

    if(!e.target.classList.contains("removeExposure")){
        return;
    }

    const index =
        Number(e.target.dataset.index);

    pendingExposureAreas.splice(index,1);

    renderExposureList();

}


//==============================
// Events
//==============================

if (addExposureToListBtn) {
    addExposureToListBtn.addEventListener(
        "click",
        addExposureToList
    );
}

if (addExposureBtn) {
    addExposureBtn.addEventListener(
        "click",
        openExposureModal
    );
}

if (cancelExposureBtn) {
    cancelExposureBtn.addEventListener(
        "click",
        closeExposureModal
    );
}

if (saveExposureBtn) {
    saveExposureBtn.addEventListener(
        "click",
        saveExposureArea
    );
}

if (exposureList) {
    exposureList.addEventListener("click", removeExposureArea);
}
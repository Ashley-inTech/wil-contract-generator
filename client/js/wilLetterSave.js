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

async function saveAll() {

    try{

        const participantData = {

            ...contractData,

            career_id: careerCategory.value,

            exposure_areas: exposureCategory.value

        };

        console.log(participantData);

        const participantResponse = await fetch(`${API_URL}/participants`, {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(participantData)

        });

        const participantResult = await participantResponse.json();

        console.log(participantResult);

        if (!participantResponse.ok) {
            alert(participantResult.message);
            return;
        }

        const participant_id = participantResult.data.participant_id;

        console.log(participant_id);


        //get participant id and save contract
        await fetch(`${API_URL}/contracts/participant/${participant_id}/generate`, {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                participant_id

            })

        });

        // get participant id and save wil
        await fetch(`${API_URL}/wil-letters/participant/${participant_id}/generate`, {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                participant_id

            })

        });

    }
    catch(err){

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error generating contract",
            error: error.message,
            stack: error.stack
        });

    }
    
}


//add career exposure area
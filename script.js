// ================================
// GLOBAL VARIABLES
// ================================
let signaturePad;

document.addEventListener("DOMContentLoaded", () => {

    // Signature Pad
    const canvas = document.getElementById("signaturePad");

    if (canvas) {

        canvas.width = canvas.offsetWidth;
        canvas.height = 180;

        signaturePad = new SignaturePad(canvas);

        const clearBtn = document.getElementById("clearSignature");

        if (clearBtn) {

            clearBtn.addEventListener("click", () => {
                signaturePad.clear();
            });

        }
    }

    // Copy participant name
    const participant = document.getElementById("participantName");
    const declaration = document.getElementById("declarationName");

    if (participant && declaration) {

        participant.addEventListener("input", () => {

            declaration.value = participant.value;

        });

    }

    document
        .getElementById("downloadPDF")
        .addEventListener("click", downloadPDF);

    document
        .getElementById("downloadWord")
        .addEventListener("click", downloadWord);

});


// =====================================
// PDF DOWNLOAD
// =====================================

async function downloadPDF() {

    const { jsPDF } = window.jspdf;

    const pages = document.querySelectorAll(".page");

    const pdf = new jsPDF("p", "mm", "a4");

    for (let i = 0; i < pages.length; i++) {

        const canvas = await html2canvas(pages[i], {

            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff"

        });

        const img = canvas.toDataURL("image/png");

        if (i > 0)
            pdf.addPage();

        pdf.addImage(img, "PNG", 0, 0, 210, 297);

    }

    const participant =
        document.getElementById("participantName").value || "Participant";

    pdf.save(`Hiteknology_Contract_${participant}.pdf`);

}


// =====================================
// WORD DOWNLOAD
// =====================================

function downloadWord() {

    const clone = document
        .getElementById("document")
        .cloneNode(true);

    // Remove buttons
    const buttons = clone.querySelector(".download-section");

    if (buttons)
        buttons.remove();

    // Replace Signature Canvas
    const canvas = document.getElementById("signaturePad");

    if (canvas && signaturePad && !signaturePad.isEmpty()) {

        const img = document.createElement("img");

        img.src = signaturePad.toDataURL();

        img.style.width = "220px";

        img.style.border = "1px solid #999";

        const cloneCanvas = clone.querySelector("#signaturePad");

        cloneCanvas.parentNode.replaceChild(img, cloneCanvas);

    }

    // Replace textarea
    const txt = clone.querySelector("#responsibilities");

    if (txt) {

        const div = document.createElement("div");

        div.innerHTML = txt.value.replace(/\n/g, "<br>");

        div.style.whiteSpace = "pre-wrap";

        txt.parentNode.replaceChild(div, txt);

    }

    const html = `
<html>

<head>

<meta charset="utf-8">

<style>

body{

font-family:Arial,sans-serif;

padding:30px;

}

.page{

page-break-after:always;

}

input{

border:none;

font-weight:bold;

}

textarea{

display:none;

}

button{

display:none;

}

canvas{

display:none;

}

</style>

</head>

<body>

${clone.innerHTML}

</body>

</html>
`;

    const blob = new Blob([html], {

        type: "application/msword"

    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    const participant =
        document.getElementById("participantName").value || "Participant";

    a.href = url;

    a.download = `Hiteknology_Contract_${participant}.doc`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

}
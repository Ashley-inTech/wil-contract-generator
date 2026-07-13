let signaturePad;
      let canvas;

      function getOrdinal(day) {

          if (day > 3 && day < 21) return day + "th";

          switch (day % 10) {
              case 1: return day + "st";
              case 2: return day + "nd";
              case 3: return day + "rd";
              default: return day + "th";
          }

      }
        /**
         * Enhanced PDF Download Function
         * Captures the entire document with proper pagination
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

            editorElements.forEach(element => {
                element.style.display = "none";
            });

          const textarea = document.getElementById("responsibilities");
          const preview = document.getElementById("responsibilitiesPreview");

          preview.textContent = textarea.value;

          textarea.style.display = "none";
          preview.style.display = "block";

          const clearBtn = document.getElementById("clearSignature");
            clearBtn.style.display = "none";

          const date = new Date();

          const day = date.getDate();

          const month = date.toLocaleString("default", {
              month: "long"
          });

          const year = date.getFullYear();

          try {

              const participant =
                  document.getElementById("participantName").value.trim() || "Participant";

              document.getElementById("formattedDate").textContent =
                `${getOrdinal(day)} day of ${month} ${year}`;

              if(signaturePad.isEmpty()){

                  alert("Please sign before downloading.");

                  return;

              }

              const pdf = new jsPDF({
                  orientation: "portrait",
                  unit: "mm",
                  format: "a4"
              });

              const pages = document.querySelectorAll(".page");

              for (let i = 0; i < pages.length; i++) {

                  const canvas = await html2canvas(pages[i], {
                      scale: 2,
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor: "#ffffff",
                      logging: false
                  });

                  const imgData = canvas.toDataURL("image/jpeg", 1.0);

                  const pdfWidth = 210;
                  const pdfHeight = 297;

                  if (i > 0) {
                      pdf.addPage();
                  }

                  pdf.addImage(
                      imgData,
                      "JPEG",
                      0,
                      0,
                      pdfWidth,
                      pdfHeight
                  );
              }

              pdf.save(`Hiteknology_Contract_Agreement_${participant}.pdf`);

          }
          catch (err) {

              console.error(err);
              alert("Failed to generate PDF.\n\n" + err.message);

          }
          finally {

            downloadSection.style.display = "flex";

            editorElements.forEach(element => {
                element.style.display = "block";
            });

            clearBtn.style.display = "inline-block"; // or "block", depending on your CSS

            // Restore responsibilities textarea
            textarea.style.display = "block";
            preview.style.display = "none";

            // Hide formatted date again if you're using it
            document.getElementById("formattedDate").textContent = "";

            button.innerHTML = originalText;
            button.disabled = false;

          }

        }
        /**
         * Enhanced Word Download Function
         * Creates a clean Word document with proper formatting
         */
        // =====================================
      // DOCX DOWNLOAD (IMAGE-BASED - LOOKS LIKE PDF)
      // =====================================

      async function downloadWord() {

          try {

              const button = document.getElementById("downloadWord");
              const originalText = button.innerHTML;
              button.innerHTML = "Generating DOCX...";
              button.disabled = true;

              // Hide the download section temporarily
              const downloadSection = document.querySelector(".download-section");
              if (downloadSection) {
                  downloadSection.style.display = "none";
              }

              // Handle responsibilities textarea
              const textarea = document.getElementById("responsibilities");
              const preview = document.getElementById("responsibilitiesPreview");
              if (textarea && preview) {
                  preview.textContent = textarea.value;
                  textarea.style.display = "none";
                  preview.style.display = "block";
              }

              // Hide clear signature button
              const clearBtn = document.getElementById("clearSignature");
              if (clearBtn) {
                  clearBtn.style.display = "none";
              }

              // Set formatted date
              const now = new Date();
              const day = now.getDate();
              const month = now.toLocaleString("default", { month: "long" });
              const year = now.getFullYear();
              const formattedDate = document.getElementById("formattedDate");
              if (formattedDate) {
                  formattedDate.textContent = `${getOrdinal(day)} day of ${month} ${year}`;
              }

              // Check signature
              if (signaturePad && signaturePad.isEmpty()) {
                  alert("Please sign before downloading.");
                  return;
              }

              // Import docx library
              const { Document, Packer, Paragraph, TextRun, AlignmentType, 
                       ImageRun, convertInchesToTwip } = docx;

              // Get participant name
              const participant = document.getElementById("participantName").value || "Participant";

              // Capture each page as an image
              const pages = document.querySelectorAll(".page");
              const pageImages = [];

              for (let i = 0; i < pages.length; i++) {
                  const canvas = await html2canvas(pages[i], {
                      scale: 2,
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor: "#ffffff",
                      logging: false
                  });
                  
                  // Convert to base64
                  const imgData = canvas.toDataURL("image/jpeg", 0.95);
                  pageImages.push(imgData);
              }

              // Create DOCX with images
              const doc = new Document({
                  sections: [{
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
                      children: [
                          // Add each page as an image
                          ...pageImages.map((imgData, index) => {
                              // Remove data:image/jpeg;base64, prefix
                              const base64Data = imgData.split(',')[1];
                              
                              // Convert base64 to Uint8Array for ImageRun
                              const binaryString = atob(base64Data);
                              const bytes = new Uint8Array(binaryString.length);
                              for (let i = 0; i < binaryString.length; i++) {
                                  bytes[i] = binaryString.charCodeAt(i);
                              }

                              // Create image run
                              const imageRun = new ImageRun({
                                  data: bytes,
                                  transformation: {
                                      width: 550, // Width in pixels (A4 width at 96 DPI)
                                      height: 780, // Height in pixels (A4 height at 96 DPI)
                                  },
                                  type: "jpeg",
                              });

                              // Add page break after each page except the last
                              const pageBreak = (index < pageImages.length - 1) 
                                  ? new Paragraph({
                                      children: [imageRun],
                                      pageBreakBefore: false,
                                  })
                                  : new Paragraph({
                                      children: [imageRun],
                                  });

                              return pageBreak;
                          }),
                      ],
                  }],
              });

              // Generate and download DOCX
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
              // Restore UI
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

              const clearBtn = document.getElementById("clearSignature");
              if (clearBtn) {
                  clearBtn.style.display = "inline-block";
              }

              const button = document.getElementById("downloadWord");
              button.innerHTML = "Download as DOCX";
              button.disabled = false;
          }
      }


        /**
         * Helper function to collect all form data
         */
        function collectFormData() {
            const inputs = document.querySelectorAll('input[type="text"], textarea, input[type="date"]');
            const data = {};
            inputs.forEach(input => {
                if (input.id) {
                    data[input.id] = input.value;
                }
            });
            return data;
        }

        /**
         * Preview function to show what will be exported
         */
        function previewExport() {
            const data = collectFormData();
            console.log("Form Data:", data);
            alert("Form data collected. Check console for details.");
        }

        // Attach event listeners when DOM is ready
        document.addEventListener("DOMContentLoaded", function() {
            //responsibilities section: career drop down
            //career drop logic
            const careerDropdown =
                document.getElementById("careerCategory");

            // Populate dropdown
            for (const career in careers) {

                const option = document.createElement("option");

                option.value = career;
                option.textContent = career;

                careerDropdown.appendChild(option);

            }

            // Change event
            careerDropdown.addEventListener("change", () => {

                const selected = careers[careerDropdown.value];

                if (!selected) return;

                document.getElementById("role").value =
                    selected.role;

                document.getElementById("responsibilities").value =
                    selected.responsibilities;

            });

            // Select first career automatically
            careerDropdown.selectedIndex = 1;
            careerDropdown.dispatchEvent(new Event("change"));


            //add career logic
            document
                .getElementById("addCareerBtn")
                .addEventListener("click", openCareerModal);


            document
                .getElementById("saveCareerBtn")
                .addEventListener("click", () => {

                    const careerName =
                        document.getElementById("modalCareerName").value.trim();

                    const responsibilities =
                        document.getElementById("modalResponsibilities").value.trim();

                    if(!careerName){

                        alert("Please enter a career name.");

                        return;

                    }

                    careers[careerName] = {

                        role: careerName,

                        responsibilities

                    };

                    const option =
                        document.createElement("option");

                    option.value = careerName;
                    option.textContent = careerName;

                    careerDropdown.appendChild(option);

                    careerDropdown.value = careerName;

                    careerDropdown.dispatchEvent(new Event("change"));

                    document.getElementById("modalCareerName").value = "";

                    document.getElementById("modalResponsibilities").value = "";

                    closeCareerModal();

                });

            document
                .getElementById("cancelCareerBtn")
                .addEventListener("click", () => {

                    closeCareerModal();

                });

            //download section
            const pdfBtn = document.getElementById("downloadPDF");
            const wordBtn = document.getElementById("downloadWord");
            canvas = document.getElementById("signaturePad");

            
            if (pdfBtn) {
                pdfBtn.addEventListener("click", downloadPDF);
            }
            
            if (wordBtn) {
                wordBtn.addEventListener("click", downloadWord);
            }

            // Optional: Add keyboard shortcuts
            document.addEventListener("keydown", function(e) {
                // Ctrl+Shift+P for PDF
                if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                    e.preventDefault();
                    if (pdfBtn) pdfBtn.click();
                }
                // Ctrl+Shift+W for Word
                if (e.ctrlKey && e.shiftKey && e.key === 'W') {
                    e.preventDefault();
                    if (wordBtn) wordBtn.click();
                }
            });

            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            signaturePad = new SignaturePad(canvas);

            document
              .getElementById("clearSignature")
              .addEventListener("click", () => {

                  signaturePad.clear();

              });

            const participantName = document.getElementById("participantName");
            const declarationName = document.getElementById("declarationName");

            participantName.addEventListener("input", function () {
                declarationName.value = participantName.value;
            });

            console.log("✅ Document ready!");
            console.log("📄 Press Ctrl+Shift+P to download PDF");
            console.log("📄 Press Ctrl+Shift+W to download Word");
        });

        // Handle errors globally
        window.addEventListener('error', function(e) {
            console.error("Global error:", e.message);
        });

        //Handle resizing: resizing the browser doesn't erase the signature
        window.addEventListener("resize", () => {

          const data = signaturePad.toData();

          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;

          signaturePad.fromData(data);

      });

        // Export functions for debugging
        window.downloadPDF = downloadPDF;
        window.downloadWord = downloadWord;
        window.collectFormData = collectFormData;
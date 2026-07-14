// js/wilGenerator.js
(function() {
    // Use the global API_URL or define fallback
    const API_URL = window.API_URL || 'http://localhost:3000/api';

    document.addEventListener('DOMContentLoaded', function() {
        const saveWilBtn = document.getElementById('saveWilBtn');
        
        if (saveWilBtn) {
            saveWilBtn.addEventListener('click', generateWilLetter);
        }

        const participantId = localStorage.getItem('participantId');
        if (participantId && saveWilBtn) {
            saveWilBtn.disabled = false;
            saveWilBtn.textContent = 'Generate WIL Letter';
        }
    });

    async function generateWilLetter(event) {
        if (event) event.preventDefault();
        
        const saveWilBtn = document.getElementById('saveWilBtn');
        
        try {
            saveWilBtn.disabled = true;
            saveWilBtn.textContent = 'Generating...';

            const participant_id = localStorage.getItem('participantId');

            if (!participant_id) {
                alert('Please save the contract first.');
                saveWilBtn.disabled = false;
                saveWilBtn.textContent = 'Save WIL';
                return;
            }

            console.log('Generating WIL letter for participant:', participant_id);

            const response = await fetch(
                `${API_URL}/wil-letters/participant/${participant_id}/generate`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ 
                        participant_id: parseInt(participant_id) 
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP ${response.status}: Failed to generate WIL letter`);
            }

            console.log('WIL letter generated successfully:', result);

            localStorage.removeItem('participantId');
            localStorage.removeItem('contractData');
            localStorage.removeItem('generateWil');

            alert('WIL Letter generated successfully!');
            window.location.href = 'contents.html';

        } catch (err) {
            console.error('WIL Generation Error:', err);
            alert('Error generating WIL letter: ' + err.message);
            
            saveWilBtn.disabled = false;
            saveWilBtn.textContent = 'Generate WIL Letter';
        }
    }
})();
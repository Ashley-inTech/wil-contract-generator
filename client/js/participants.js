const API_URL = 'http://localhost:3000/api';

// Load participants on page load
document.addEventListener('DOMContentLoaded', function() {
    loadParticipants();
    loadCareerFilter();
    setupEventListeners();
});

function setupEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', loadParticipants);
    
    // Add participant button
    document.getElementById('addParticipantBtn').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', loadParticipants);
    
    // Filters
    document.getElementById('statusFilter').addEventListener('change', loadParticipants);
    document.getElementById('careerFilter').addEventListener('change', loadParticipants);
}

// Load participants with filters
async function loadParticipants() {
    try {
        const search = document.getElementById('searchInput').value;
        const status = document.getElementById('statusFilter').value;
        const careerId = document.getElementById('careerFilter').value;
        
        // Build query string
        let url = `${API_URL}/participants/filter?`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (status) url += `status=${status}&`;
        if (careerId) url += `career_id=${careerId}&`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            renderParticipants(data.data);
            updateStats(data.data);
        } else {
            throw new Error(data.message || 'Failed to load participants');
        }
    } catch (error) {
        console.error('Error loading participants:', error);
        document.getElementById('participantsBody').innerHTML = `
            <tr>
                <td colspan="9" class="loading" style="color: #ef4444;">
                    Error: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Load career filter options
async function loadCareerFilter() {
    try {
        const response = await fetch(`${API_URL}/careers`);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('careerFilter');
            data.data.forEach(career => {
                const option = document.createElement('option');
                option.value = career.career_id;
                option.textContent = career.career_name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading careers:', error);
    }
}

// Render participants table
function renderParticipants(participants) {
    const tbody = document.getElementById('participantsBody');
    
    if (!participants || participants.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="loading">No participants found</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = participants.map(p => `
        <tr>
            <td>${p.participant_id}</td>
            <td><strong>${p.first_name} ${p.last_name}</strong></td>
            <td>${p.id_number}</td>
            <td>${p.career_name || 'N/A'}</td>
            <td>${formatDate(p.commencement_date)}</td>
            <td>${formatDate(p.termination_date)}</td>
            <td><span class="status-badge ${p.status.toLowerCase()}">${p.status}</span></td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewDocuments(${p.participant_id}, '${p.first_name} ${p.last_name}')">
                    📄 View
                </button>
            </td>
            <td class="actions-cell">
                <button class="btn btn-warning btn-sm" onclick="editParticipant(${p.participant_id})">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteParticipant(${p.participant_id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats(participants) {
    const total = participants.length;
    const active = participants.filter(p => p.status === 'Active').length;
    const completed = participants.filter(p => p.status === 'Completed').length;
    const terminated = participants.filter(p => p.status === 'Terminated').length;
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('activeCount').textContent = active;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('terminatedCount').textContent = terminated;
}

// View documents for a participant
async function viewDocuments(participantId, name) {
    try {
        document.getElementById('modalParticipantName').textContent = `${name} - Documents`;
        document.getElementById('documentsList').innerHTML = '<p>Loading documents...</p>';
        document.getElementById('documentsModal').classList.add('show');
        
        const response = await fetch(`${API_URL}/participants/${participantId}`);
        const data = await response.json();
        
        if (data.success) {
            const participant = data.data;
            renderDocuments(participant);
        } else {
            throw new Error(data.message || 'Failed to load documents');
        }
    } catch (error) {
        console.error('Error loading documents:', error);
        document.getElementById('documentsList').innerHTML = `
            <p style="color: #ef4444;">Error: ${error.message}</p>
        `;
    }
}

// Render documents in modal
function renderDocuments(participant) {
    const container = document.getElementById('documentsList');
    
    let html = '';
    
    // Contracts
    if (participant.contracts && participant.contracts.length > 0) {
        html += `<h4 style="margin: 15px 0 10px 0;">Contracts</h4>`;
        participant.contracts.forEach(contract => {
            html += `
                <div class="document-item">
                    <div>
                        <span class="document-name">Contract ${contract.contract_id}</span>
                        <span class="doc-type">${contract.status}</span>
                        <span style="font-size: 12px; color: #64748b; margin-left: 10px;">
                            ${formatDate(contract.generated_date)}
                        </span>
                    </div>
                    <div class="document-actions">
                        ${contract.generated_pdf ? `<button class="btn btn-primary btn-sm" onclick="downloadDocument('contract', '${contract.generated_pdf}')">PDF</button>` : ''}
                        ${contract.generated_docx ? `<button class="btn btn-primary btn-sm" onclick="downloadDocument('contract', '${contract.generated_docx}')">DOCX</button>` : ''}
                    </div>
                </div>
            `;
        });
    }
    
    // WIL Letters
    if (participant.wilLetters && participant.wilLetters.length > 0) {
        html += `<h4 style="margin: 15px 0 10px 0;">WIL Letters</h4>`;
        participant.wilLetters.forEach(letter => {
            html += `
                <div class="document-item">
                    <div>
                        <span class="document-name">WIL Letter ${letter.wil_letter_id}</span>
                        <span class="doc-type">${letter.status}</span>
                        <span style="font-size: 12px; color: #64748b; margin-left: 10px;">
                            ${formatDate(letter.generated_date)}
                        </span>
                    </div>
                    <div class="document-actions">
                        ${letter.generated_pdf ? `<button class="btn btn-primary btn-sm" onclick="downloadDocument('wil-letter', '${letter.generated_pdf}')">PDF</button>` : ''}
                        ${letter.generated_docx ? `<button class="btn btn-primary btn-sm" onclick="downloadDocument('wil-letter', '${letter.generated_docx}')">DOCX</button>` : ''}
                    </div>
                </div>
            `;
        });
    }
    
    if (!html) {
        html = '<p class="no-documents">No documents found for this participant</p>';
    }
    
    container.innerHTML = html;
}

// Download document - Updated to use the download endpoint
function downloadDocument(participantId) {
    // Use the download route we just created
    window.open(`${API_URL}/contracts/participant/${participantId}/pdf/download`, '_blank');
    //window.location.href =`${API_URL}/contracts/participant/${participantId}/pdf/download`;
    
}

// Edit participant
function editParticipant(participantId) {
    window.location.href = `index.html?edit=${participantId}`;
}

// Delete participant
async function deleteParticipant(participantId) {
    if (!confirm('Are you sure you want to delete this participant? This will also delete all associated documents.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/participants/${participantId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Participant deleted successfully!');
            loadParticipants();
        } else {
            throw new Error(data.message || 'Failed to delete participant');
        }
    } catch (error) {
        console.error('Error deleting participant:', error);
        alert('Error: ' + error.message);
    }
}

// Close documents modal
function closeDocumentsModal() {
    document.getElementById('documentsModal').classList.remove('show');
}

// Close modal on click outside
document.getElementById('documentsModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeDocumentsModal();
    }
});

// Utility: Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Export for debugging
window.loadParticipants = loadParticipants;
window.viewDocuments = viewDocuments;
window.downloadDocument = downloadDocument;
window.editParticipant = editParticipant;
window.deleteParticipant = deleteParticipant;
window.closeDocumentsModal = closeDocumentsModal;
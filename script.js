// Feature extraction functions
function extractFeatures(medicalRecord) {
    const features = {
        allergies: [],
        diagnoses: [],
        medications: [],
        procedures: []
    };

    // Extract Allergies
    const allergyMatch = medicalRecord.match(/Allergies?:\s*([^.]+?)(?=\.|$)/i);
    if (allergyMatch) {
        const allergyText = allergyMatch[1];
        const allergyList = allergyText.split(',').map(a => a.trim());
        features.allergies = allergyList.filter(a => a.length > 0);
    }

    // Extract Diagnoses
    const diagnosisMatches = medicalRecord.matchAll(/(diagnosed with|diagnosis|diagnoses):\s*([^.]+?)(?=\.|$)/gi);
    for (const match of diagnosisMatches) {
        const diagnosisText = match[2];
        const diagnosisList = diagnosisText.split(',').map(d => d.trim());
        features.diagnoses.push(...diagnosisList.filter(d => d.length > 0));
    }
    
    // Also look for conditions mentioned with history of
    const historyMatches = medicalRecord.matchAll(/history of\s+([^.]+?)(?=\.|$)/gi);
    for (const match of historyMatches) {
        const conditions = match[1].split(',').map(c => c.trim());
        features.diagnoses.push(...conditions.filter(c => c.length > 0));
    }

    features.diagnoses = [...new Set(features.diagnoses)]; // Remove duplicates

    // Extract Medications
    const medicationMatch = medicalRecord.match(/(?:currently )?taking\s+([^.]+?)(?=\.|$)/i);
    if (medicationMatch) {
        const medicationText = medicationMatch[1];
        const medicationList = medicationText.split(',').map(m => m.trim());
        features.medications = medicationList.filter(m => m.length > 0);
    }

    // Extract Procedures
    const procedureMatches = medicalRecord.matchAll(/(?:recent |previous )?procedures?:\s*([^.]+?)(?=\.|$)/gi);
    for (const match of procedureMatches) {
        const procedureText = match[1];
        const procedureList = procedureText.split(',').map(p => p.trim());
        features.procedures.push(...procedureList.filter(p => p.length > 0));
    }

    features.procedures = [...new Set(features.procedures)]; // Remove duplicates

    return features;
}

// Create badge HTML for displaying items
function createBadges(items) {
    if (!items || items.length === 0) {
        return '<span class="text-muted">-</span>';
    }
    return items
        .map(item => `<span class="badge bg-info badge-sm">${item}</span>`)
        .join('');
}

// Create table row HTML
function createTableRow(patient) {
    const features = extractFeatures(patient.medicalRecord);
    
    return `
        <tr class="clickable-row" onclick="navigateToPatient('${patient.patientId}')">
            <td><strong>${patient.patientId}</strong></td>
            <td>${patient.name}</td>
            <td>
                <div class="medical-record-text" title="${patient.medicalRecord}">
                    ${patient.medicalRecord.substring(0, 100)}...
                </div>
            </td>
            <td>
                <div class="extracted-field">
                    ${createBadges(features.allergies)}
                </div>
            </td>
            <td>
                <div class="extracted-field">
                    ${createBadges(features.diagnoses)}
                </div>
            </td>
            <td>
                <div class="extracted-field">
                    ${createBadges(features.medications)}
                </div>
            </td>
            <td>
                <div class="extracted-field">
                    ${createBadges(features.procedures)}
                </div>
            </td>
        </tr>
    `;
}

function navigateToPatient(patientId) {
    window.location.href = `profile.html?id=${encodeURIComponent(patientId)}`;
}

// Load and display data
function loadPatientData() {
    try {
        const tableBody = document.getElementById('patientTableBody');
        const data = window.patientData;
        if (!data || !data.patients) {
            throw new Error('Patient data not found');
        }
        
        // Clear loading message
        tableBody.innerHTML = '';
        
        // Populate table with all patients
        data.patients.forEach(patient => {
            tableBody.innerHTML += createTableRow(patient);
        });
        
        // Store data for search functionality
        window.allPatients = data.patients;
    } catch (error) {
        console.error('Error loading patient data:', error);
        document.getElementById('patientTableBody').innerHTML = 
            '<tr><td colspan="7" class="text-center text-danger">Error loading patient data</td></tr>';
    }
}

// Search functionality
function filterPatients(searchTerm) {
    const tableBody = document.getElementById('patientTableBody');
    const noResults = document.getElementById('noResults');
    
    if (!window.allPatients) return;
    
    const searchLower = searchTerm.toLowerCase();
    const filteredPatients = window.allPatients.filter(patient => 
        patient.patientId.toLowerCase().includes(searchLower) ||
        patient.name.toLowerCase().includes(searchLower)
    );
    
    if (filteredPatients.length === 0) {
        tableBody.innerHTML = '';
        noResults.style.display = 'block';
    } else {
        tableBody.innerHTML = '';
        filteredPatients.forEach(patient => {
            tableBody.innerHTML += createTableRow(patient);
        });
        noResults.style.display = 'none';
    }
}

// Event listener for search input
document.getElementById('searchInput').addEventListener('keyup', (e) => {
    filterPatients(e.target.value);
});

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadPatientData);
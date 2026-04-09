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
        <tr>
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

// Patient data embedded directly
const patientData = {
  "patients": [
    {
      "patientId": "P001",
      "name": "Ahmed Hassan",
      "medicalRecord": "Patient has a history of hypertension and type 2 diabetes. Allergies: Penicillin (rash), Sulfa drugs (diarrhea). Recent diagnosis of asthma. Currently taking Metformin, Lisinopril, and Albuterol. Recent procedures: Chest X-ray (2024), Electrocardiogram (normal). Family history of heart disease."
    },
    {
      "patientId": "P002",
      "name": "Fatima Al-Rashid",
      "medicalRecord": "Patient with chronic migraine history. Allergies: Aspirin (gastrointestinal upset), Latex. Diagnoses: Migraine with aura, anxiety disorder, hypothyroidism. Taking Sumatriptan, Levothyroxine, and Sertraline. Recent procedures: MRI brain (2024), Thyroid ultrasound. No smoking history."
    },
    {
      "patientId": "P003",
      "name": "Mohammed Ibrahim",
      "medicalRecord": "Patient has a significant smoking history (20 pack-years). Allergies: Codeine (severe reaction). Diagnosed with COPD, chronic bronchitis, and coronary artery disease. Recent procedures: Coronary angiography (2024), Pulmonary function tests. Medications: Atorvastatin, Bisoprolol, Ipratropium bromide. Previous MI in 2018."
    },
    {
      "patientId": "P004",
      "name": "Noor Abdullah",
      "medicalRecord": "Young patient with celiac disease. Allergies: Gluten (intestinal damage - not traditional allergy), Amoxicillin (rash). Diagnoses: Celiac disease, iron deficiency anemia, osteoporosis. Medications: Iron supplements, Calcium with Vitamin D. Recent procedures: Endoscopy with biopsy (2024), DEXA scan. Following gluten-free diet."
    },
    {
      "patientId": "P005",
      "name": "Ali Al-Mansouri",
      "medicalRecord": "Elderly patient with multiple comorbidities. Allergies: NSAIDs (GI bleeding history), Contrast dye (previous reaction). Diagnoses: Atrial fibrillation, hypertension, chronic kidney disease stage 3, osteoarthritis. Medications: Warfarin, Enalapril, Amlodipine, Allopurinol. Recent procedures: Echocardiogram (2024), Carotid ultrasound. Fall risk assessment done."
    },
    {
      "patientId": "P006",
      "name": "Leila Al-Zahra",
      "medicalRecord": "Patient with autoimmune condition. Allergies: Methotrexate (previous severe side effects), Shellfish. Diagnoses: Systemic lupus erythematosus (SLE), hypertension, depression. Medications: Hydroxychloroquine, Prednisone, Lisinopril, Sertraline. Recent procedures: ANA test (positive), Complement levels checked (2024). Requires close monitoring."
    },
    {
      "patientId": "P007",
      "name": "Hassan Al-Karim",
      "medicalRecord": "Patient with metabolic syndrome. Allergies: Atorvastatin (muscle pain), Peanuts (anaphylaxis risk). Diagnoses: Obesity, hypertension, hyperlipidemia, Type 2 diabetes. Medications: Metformin, Lisinopril, Simvastatin, Aspirin. Recent procedures: Lipid panel (elevated), Glucose tolerance test (2024). Referred to nutritionist. EpiPen prescribed."
    },
    {
      "patientId": "P008",
      "name": "Aisha Al-Balushi",
      "medicalRecord": "Patient post-pregnancy. Allergies: Iodine (prior reaction). History of gestational diabetes. Current diagnoses: Type 2 diabetes (postpartum), postpartum depression, iron deficiency. Medications: Metformin, Sertraline, Iron supplements, Prenatal vitamins. Recent procedures: Postpartum checkup (normal), Iron studies (2024). Breastfeeding."
    }
  ]
};

// Load and display data
function loadPatientData() {
    try {
        const tableBody = document.getElementById('patientTableBody');
        
        // Clear loading message
        tableBody.innerHTML = '';
        
        // Populate table with all patients
        patientData.patients.forEach(patient => {
            tableBody.innerHTML += createTableRow(patient);
        });
        
        // Store data for search functionality
        window.allPatients = patientData.patients;
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

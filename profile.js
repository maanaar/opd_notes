function extractFeatures(medicalRecord) {
    const features = {
        allergies: [],
        diagnoses: [],
        medications: [],
        procedures: []
    };

    const allergyMatch = medicalRecord.match(/Allergies?:\s*([^.]+?)(?=\.|$)/i);
    if (allergyMatch) {
        features.allergies = allergyMatch[1].split(',').map(a => a.trim()).filter(Boolean);
    }

    const diagnosisMatches = medicalRecord.matchAll(/(diagnosed with|diagnosis|diagnoses):\s*([^.]+?)(?=\.|$)/gi);
    for (const match of diagnosisMatches) {
        features.diagnoses.push(...match[2].split(',').map(d => d.trim()).filter(Boolean));
    }

    const historyMatches = medicalRecord.matchAll(/history of\s+([^.]+?)(?=\.|$)/gi);
    for (const match of historyMatches) {
        features.diagnoses.push(...match[1].split(',').map(c => c.trim()).filter(Boolean));
    }

    features.diagnoses = [...new Set(features.diagnoses)];

    const medicationMatch = medicalRecord.match(/(?:currently )?taking\s+([^.]+?)(?=\.|$)/i);
    if (medicationMatch) {
        features.medications = medicationMatch[1].split(',').map(m => m.trim()).filter(Boolean);
    }

    const procedureMatches = medicalRecord.matchAll(/(?:recent |previous )?procedures?:\s*([^.]+?)(?=\.|$)/gi);
    for (const match of procedureMatches) {
        features.procedures.push(...match[1].split(',').map(p => p.trim()).filter(Boolean));
    }

    features.procedures = [...new Set(features.procedures)];
    return features;
}

function createBadges(items) {
    if (!items || items.length === 0) {
        return '<span class="text-muted">-</span>';
    }
    return items.map(item => `<span class="badge bg-info badge-sm">${item}</span>`).join(' ');
}

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function getInitials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('');
}

function renderProfile(patient) {
    document.getElementById('patientName').textContent = patient.name;
    document.getElementById('patientIdText').textContent = `ID: ${patient.patientId}`;
    document.getElementById('patientAvatar').textContent = getInitials(patient.name);
    document.getElementById('medicalRecord').textContent = patient.medicalRecord;
    document.getElementById('ageText').textContent = patient.age || '-';
    document.getElementById('genderText').textContent = patient.gender || '-';
    document.getElementById('nationalityText').textContent = patient.nationality || '-';
    document.getElementById('cityText').textContent = patient.city || '-';

    const features = extractFeatures(patient.medicalRecord);
    document.getElementById('allergiesList').innerHTML = createBadges(features.allergies);
    document.getElementById('diagnosesList').innerHTML = createBadges(features.diagnoses);
    document.getElementById('medicationsList').innerHTML = createBadges(features.medications);
    document.getElementById('proceduresList').innerHTML = createBadges(features.procedures);
}

function showNotFound() {
    document.getElementById('notFound').style.display = 'block';
    document.getElementById('patientName').textContent = 'Patient Profile';
    document.getElementById('patientIdText').textContent = 'ID: -';
    document.getElementById('patientAvatar').textContent = 'P';
    document.getElementById('medicalRecord').textContent = '-';
    document.getElementById('ageText').textContent = '-';
    document.getElementById('genderText').textContent = '-';
    document.getElementById('nationalityText').textContent = '-';
    document.getElementById('cityText').textContent = '-';
    document.getElementById('allergiesList').innerHTML = '<span class="text-muted">-</span>';
    document.getElementById('diagnosesList').innerHTML = '<span class="text-muted">-</span>';
    document.getElementById('medicationsList').innerHTML = '<span class="text-muted">-</span>';
    document.getElementById('proceduresList').innerHTML = '<span class="text-muted">-</span>';
}

function initProfilePage() {
    const patientId = getQueryParam('id');
    if (!patientId || !window.patientData) {
        showNotFound();
        return;
    }

    const patient = window.patientData.patients.find(p => p.patientId === patientId);
    if (!patient) {
        showNotFound();
        return;
    }
    renderProfile(patient);
}

document.addEventListener('DOMContentLoaded', initProfilePage);

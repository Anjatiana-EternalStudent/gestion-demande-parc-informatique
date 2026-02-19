const API_BASE = '/api/tickets/';

function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value;
}

// Labels français
const STATUS_LABELS = {
    'EN_ATTENTE': '<i class="fa-solid fa-clock"></i> En attente',
    'EN_COURS':   '<i class="fa-solid fa-arrows-rotate"></i> En cours',
    'RESOLUE':    '<i class="fa-solid fa-circle-check"></i> Résolue'
};
const PRIORITY_LABELS = {
    'FAIBLE':  '<i class="fa-solid fa-circle-dot" style="color:var(--success)"></i> Faible',
    'MOYENNE': '<i class="fa-solid fa-circle-dot" style="color:var(--warning)"></i> Moyenne',
    'ELEVE':   '<i class="fa-solid fa-circle-dot" style="color:var(--danger)"></i> Élevée'
};

// Récupère rôle utilisateur
function getUserRole() {
    return document.body.dataset.userRole || 'USER';
}

// Charge tickets
async function loadTickets() {
    try {
        const response = await fetch(API_BASE, {
            headers: { 'X-CSRFToken': getCSRFToken() }
        });
        if (!response.ok) throw new Error('Erreur API');
        const tickets = await response.json();
        displayTickets(tickets);
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('ticketsBody').innerHTML =
            '<tr><td colspan="8"><i class="fa-solid fa-triangle-exclamation"></i> Erreur chargement tickets</td></tr>';
    }
}

// Affiche tickets
function displayTickets(tickets) {
    const tbody = document.getElementById('ticketsBody');

    if (!tickets.length) {
        tbody.innerHTML = '<tr><td colspan="8"><i class="fa-solid fa-inbox"></i> Aucun ticket</td></tr>';
        return;
    }

    tbody.innerHTML = tickets.map(ticket => {
        let techName = '<i class="fa-solid fa-xmark"></i> Non assigné';
        if (ticket.technicien) {
            if (ticket.technicien.username) {
                techName = `<i class="fa-solid fa-user-gear"></i> ${ticket.technicien.username}`;
            } else if (typeof ticket.technicien === 'number') {
                techName = `<i class="fa-solid fa-user-gear"></i> Tech #${ticket.technicien}`;
            } else {
                techName = `<i class="fa-solid fa-user-gear"></i> Assigné`;
            }
        }

        const dateCreation = ticket.date_creation ?
            new Date(ticket.date_creation).toLocaleDateString('fr-FR') : 'N/A';

        return `
            <tr>
                <td>${ticket.id || 'N/A'}</td>
                <td>${ticket.titre || 'Sans titre'}</td>
                <td>${(ticket.description || '').substring(0, 50)}${(ticket.description || '').length > 50 ? '...' : ''}</td>
                <td>${STATUS_LABELS[ticket.statut] || '<i class="fa-solid fa-question"></i>'}</td>
                <td>${PRIORITY_LABELS[ticket.priorite] || '<i class="fa-solid fa-question"></i>'}</td>
                <td>${techName}</td>
                <td>${dateCreation}</td>
                <td>
                    <button class="btn-success" onclick="editTicket(${ticket.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-danger" onclick="deleteTicket(${ticket.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

// Nouveau ticket (USER SEULEMENT)
function showNewTicketModal() {
    const userRole = getUserRole();
    if (userRole === 'TECH') {
        alert('Technicien : création de ticket interdite');
        return;
    }

    document.body.insertAdjacentHTML('beforeend', `
        <div class="modal" id="newTicketModal">
            <div class="modal-content">
                <h3>Nouveau ticket</h3>
                <label>Titre</label>
                <input id="newTitre" placeholder="Titre du ticket" required>
                <label>Description</label>
                <textarea id="newDescription" placeholder="Décrivez le problème..." required></textarea>
                <label>Priorité</label>
                <select id="newPriorite">
                    <option value="MOYENNE">Moyenne</option>
                    <option value="FAIBLE">Faible</option>
                    <option value="ELEVE">Élevée</option>
                </select>
                <div class="modal-buttons">
                    <button onclick="createTicket()" class="btn-primary"><i class="fa-solid fa-plus"></i> Créer</button>
                    <button onclick="closeModal('newTicketModal')" class="btn-secondary"><i class="fa-solid fa-xmark"></i> Annuler</button>
                </div>
            </div>
        </div>
    `);
}

// Créer ticket
async function createTicket() {
    const titre = document.getElementById('newTitre').value;
    const description = document.getElementById('newDescription').value;
    const priorite = document.getElementById('newPriorite').value;

    if (!titre || !description) return alert('Champs obligatoires');

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ titre, description, priorite })
        });

        if (response.ok) {
            closeModal('newTicketModal');
            loadTickets();
        } else {
            alert('Erreur création');
        }
    } catch (error) {
        alert('Erreur réseau');
    }
}

// Supprimer
async function deleteTicket(id) {
    if (confirm('Supprimer définitivement ce ticket ?')) {
        try {
            const response = await fetch(`${API_BASE}${id}/`, {
                method: 'DELETE',
                headers: { 'X-CSRFToken': getCSRFToken() }
            });
            if (response.ok) loadTickets();
        } catch (error) {
            console.error(error);
        }
    }
}

// *** EDIT MODAL - PERMISSIONS CORRIGÉES ***
async function editTicket(id) {
    const ticketResp = await fetch(`${API_BASE}${id}/`);
    const ticket = await ticketResp.json();

    const userRole = getUserRole();

    // Statut
    const statutSelect = (userRole === 'TECH' || userRole === 'ADMIN') ? `
        <label>Statut</label>
        <select id="editStatut-${id}">
            <option value="EN_ATTENTE" ${ticket.statut=='EN_ATTENTE'?'selected':''}>En attente</option>
            <option value="EN_COURS"   ${ticket.statut=='EN_COURS'  ?'selected':''}>En cours</option>
            <option value="RESOLUE"    ${ticket.statut=='RESOLUE'   ?'selected':''}>Résolue</option>
        </select>
    ` : '<p class="locked-field"><i class="fa-solid fa-lock"></i> Statut (TECH / Admin uniquement)</p>';

    // Priorité
    const prioriteSelect = (userRole === 'USER' || userRole === 'TECH' || userRole === 'ADMIN') ? `
        <label>Priorité</label>
        <select id="editPriorite-${id}">
            <option value="FAIBLE"  ${ticket.priorite=='FAIBLE' ?'selected':''}>Faible</option>
            <option value="MOYENNE" ${ticket.priorite=='MOYENNE'?'selected':''}>Moyenne</option>
            <option value="ELEVE"   ${ticket.priorite=='ELEVE'  ?'selected':''}>Élevée</option>
        </select>
    ` : '';

    // Technicien (ADMIN uniquement)
    let techSelect = '';
    if (userRole === 'ADMIN') {
        try {
            const techsResp = await fetch(`${API_BASE}techs`);
            if (techsResp.ok) {
                const techs = await techsResp.json();
                let options = '<option value="">Non assigné</option>';
                techs.forEach(tech => {
                    const selected = (ticket.technicien && ticket.technicien.id == tech.id) ? 'selected' : '';
                    options += `<option value="${tech.id}" ${selected}>${tech.username}</option>`;
                });
                techSelect = `<label>Technicien</label><select id="editTechnicien-${id}">${options}</select>`;
            }
        } catch (error) {
            techSelect = '<p class="locked-field"><i class="fa-solid fa-lock"></i> Techniciens (Admin uniquement)</p>';
        }
    } else {
        techSelect = '<p class="locked-field"><i class="fa-solid fa-lock"></i> Technicien (Admin uniquement)</p>';
    }

    document.body.insertAdjacentHTML('beforeend', `
        <div class="modal" id="editModal-${id}">
            <div class="modal-content">
                <h3>Ticket #${id}</h3>

                <label>Titre</label>
                <input id="editTitre-${id}" value="${ticket.titre}">

                <label>Description</label>
                <textarea id="editDescription-${id}">${ticket.description}</textarea>

                ${statutSelect}
                ${prioriteSelect}
                ${techSelect}

                <div class="modal-buttons">
                    <button onclick="saveTicket(${id})" class="btn-primary"><i class="fa-solid fa-floppy-disk"></i> Enregistrer</button>
                    <button onclick="closeModal('editModal-${id}')" class="btn-secondary"><i class="fa-solid fa-xmark"></i> Annuler</button>
                </div>
            </div>
        </div>
    `);
}

// Sauvegarde selon rôle
async function saveTicket(id) {
    const userRole = getUserRole();
    const titre = document.getElementById(`editTitre-${id}`).value;
    const description = document.getElementById(`editDescription-${id}`).value;

    const payload = { titre, description };

    if (userRole === 'TECH') {
        const statutSelect = document.getElementById(`editStatut-${id}`);
        if (statutSelect) payload.statut = statutSelect.value;
    } else if (userRole === 'USER') {
        const prioriteSelect = document.getElementById(`editPriorite-${id}`);
        if (prioriteSelect) payload.priorite = prioriteSelect.value;
    } else if (userRole === 'ADMIN') {
        const statutSelect = document.getElementById(`editStatut-${id}`);
        const prioriteSelect = document.getElementById(`editPriorite-${id}`);
        const techSelect = document.getElementById(`editTechnicien-${id}`);

        if (statutSelect) payload.statut = statutSelect.value;
        if (prioriteSelect) payload.priorite = prioriteSelect.value;
        if (techSelect) payload.technicien = techSelect.value ? parseInt(techSelect.value) : null;
    }

    return sendUpdate(payload, id);
}

async function sendUpdate(payload, id) {
    try {
        const response = await fetch(`${API_BASE}${id}/`, {
            method: 'PUT',
            headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            closeModal(`editModal-${id}`);
            loadTickets();
        } else {
            const error = await response.json();
            alert(`Erreur: ${error.detail || 'Permissions insuffisantes'}`);
        }
    } catch (error) {
        alert('Erreur réseau');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId)?.remove();
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
    const userRole = getUserRole();

    // TECH → Cache bouton créer
    if (userRole === 'TECH') {
        const newTicketBtn = document.getElementById('newTicket');
        if (newTicketBtn) newTicketBtn.style.display = 'none';
    } else {
        // USER/ADMIN → Écouteur créer
        const newTicketBtn = document.getElementById('newTicket');
        if (newTicketBtn) newTicketBtn.addEventListener('click', showNewTicketModal);
    }

    loadTickets();
});

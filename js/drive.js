/* =================================================================== */
/* File: js/drive.js
/* Desc: Script specifico per la pagina Drive (Google App Script)
/* =================================================================== */

// !--- URL DELLA TUA WEB APP INSERITO ---!
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzZLCkeWMr01HAs78xbv9O39F8MBR-1HOLaxW0IAEJScmCdnKvdOhTSmGi4AAnHtOfC/exec';

// Elementi DOM specifici di questa pagina
const fileGrid = document.getElementById('fileGrid');
const uploadModal = document.getElementById('uploadModal');
const folderModal = document.getElementById('folderModal');
const uploadBtn = document.getElementById('uploadBtn');
const newFolderBtn = document.getElementById('newFolderBtn');
const closeModals = document.querySelectorAll('.close-modal');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');
const searchInput = document.getElementById('searchInput');
const loadingSpinner = document.getElementById('loadingSpinner');
const folderSelect = document.getElementById('folderSelect'); // Select nel modal di upload

// Array per memorizzare i file caricati (utile per la ricerca e il modal)
let currentFiles = [];

// Funzione per mostrare notifica
function showNotification(message, duration = 3000) {
    if (!notification || !notificationMessage) return;
    notificationMessage.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, duration);
}

// Funzione per mostrare/nascondere lo spinner di caricamento
function toggleLoading(show) {
    if (!loadingSpinner || !fileGrid) return;
    if (show) {
        loadingSpinner.style.display = 'block';
        fileGrid.style.display = 'none';
    } else {
        loadingSpinner.style.display = 'none';
        fileGrid.style.display = 'grid';
    }
}

// Carica i file da Google Apps Script
async function fetchFilesFromStorage() {
    toggleLoading(true);
    
    try {
        const response = await fetch(GAS_WEB_APP_URL); // Chiama il doGet
        if (!response.ok) throw new Error('Errore nella risposta del server');
        
        const data = await response.json(); 
        if (data.error) throw new Error(data.error);

        currentFiles = data.folders; // Salva i file per la ricerca
        renderFiles(currentFiles); 
        populateFolderSelect(currentFiles); // Popola il menu a tendina nel modal
        
        toggleLoading(false);

    } catch (error) {
        console.error('Errore nel recupero dei file:', error);
        showNotification('Errore nel caricamento dei file. Riprova più tardi.', 5000);
        toggleLoading(false);
    }
}

// Renderizza i file nella griglia
function renderFiles(filesToRender) {
    if (!fileGrid) return;
    fileGrid.innerHTML = '';
    
    if (filesToRender.length === 0) {
        fileGrid.innerHTML = '<p class="no-results">Nessun file o cartella trovata.</p>';
        return;
    }

    filesToRender.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        fileCard.setAttribute('data-folder-id', file.id);
        fileCard.setAttribute('data-file', file.name.toLowerCase());
        fileCard.setAttribute('data-category', file.type);
        
        // Usa 'folder' come icona di default se 'type' non è definito
        const iconType = file.type || 'folder';

        fileCard.innerHTML = `
            <div class="file-actions">
                <button title="Scarica"><i class="fas fa-download"></i></button>
                <button title="Condividi"><i class="fas fa-share-alt"></i></button>
            </div>
            <div class="file-icon"><i class="fas fa-${iconType}"></i></div>
            <div class="file-name">${file.name}</div>
            <div class="file-meta">
                <span>${file.count} file</span>
            </div>
        `;
        fileGrid.appendChild(fileCard);
    });
    
    addFileEventListeners();
}

// Popola il menu a tendina nel modal di upload
function populateFolderSelect(folders) {
    if (!folderSelect) return;
    folderSelect.innerHTML = '<option value="">Seleziona una cartella</option>'; // Reset
    folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id; // Usiamo l'ID della cartella
        option.textContent = folder.name;
        folderSelect.appendChild(option);
    });
}

// Aggiunge listener ai pulsanti (per ora solo placeholder)
function addFileEventListeners() {
    document.querySelectorAll('.file-actions button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.getAttribute('title');
            const card = this.closest('.file-card');
            const folderName = card.querySelector('.file-name').textContent;
            
            if (action === 'Scarica') {
                downloadFolder(folderName);
            } else if (action === 'Condividi') {
                shareFolder(folderName);
            }
        });
    });
    
    document.querySelectorAll('.file-card').forEach(card => {
        card.addEventListener('click', function() {
            const folderName = this.querySelector('.file-name').textContent;
            const folderId = this.getAttribute('data-folder-id');
            openFolder(folderId, folderName);
        });
    });
}

function downloadFolder(folderName) {
    showNotification(`Download di "${folderName}" non ancora implementato.`);
    // Qui andrebbe la logica di download
}

function shareFolder(folderName) {
    showNotification(`Condivisione di "${folderName}" non ancora implementato.`);
    // Qui andrebbe la logica di condivisione
}

function openFolder(folderId, folderName) {
    showNotification(`Apertura di "${folderName}" non ancora implementata.`);
    // Prossimo passo: chiamare fetchFilesFromStorage con il nuovo folderId
    // Esempio: fetchFilesFromStorage(folderId);
}

// Carica i file all'avvio
window.addEventListener('DOMContentLoaded', () => {
    // Assicurati che gli elementi esistano prima di aggiungere listener
    if (document.getElementById('fileGrid')) {
        fetchFilesFromStorage();
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            if (uploadModal) uploadModal.style.display = 'flex';
        });
    }
    
    if (newFolderBtn) {
        newFolderBtn.addEventListener('click', () => {
            if (folderModal) folderModal.style.display = 'flex';
        });
    }
    
    closeModals.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === uploadModal) uploadModal.style.display = 'none';
        if (e.target === folderModal) folderModal.style.display = 'none';
    });
    
    // Gestione form upload (placeholder)
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Aggiungi qui la logica di upload
            showNotification(`Caricamento file non ancora implementato.`);
        });
    }
    
    // Gestione form nuova cartella (COLLEGATO!)
    const folderForm = document.getElementById('folderForm');
    if (folderForm) {
        folderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const folderNameInput = document.getElementById('folderName');
            if (!folderNameInput) return;

            const folderName = folderNameInput.value;
            if (!folderName) return;

            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creazione...';
            
            try {
                const response = await fetch(GAS_WEB_APP_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'createFolder',
                        folderName: folderName
                    })
                });

                if (!response.ok) throw new Error('Errore di rete');
                
                const data = await response.json();
                if (data.error) throw new Error(data.error);

                if (data.success) {
                    showNotification(`Cartella "${data.name}" creata!`);
                    fetchFilesFromStorage(); // Aggiorna la griglia
                    if (folderModal) folderModal.style.display = 'none';
                    this.reset();
                }

            } catch (error) {
                console.error('Errore creazione cartella:', error);
                showNotification(`Errore: ${error.message}`, 5000);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Crea';
            }
        });
    }
    
    // Funzionalità di ricerca (ora su 'currentFiles')
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm === '') {
                renderFiles(currentFiles);
            } else {
                const filteredFiles = currentFiles.filter(file => 
                    file.name.toLowerCase().includes(searchTerm)
                );
                renderFiles(filteredFiles);
            }
        });
    }
});
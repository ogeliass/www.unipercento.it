/* =================================================================== */
/* File: js/eventi.js
/* Desc: Script specifico per la pagina Eventi (filtri, modal, view)
/* =================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // Elementi DOM specifici di questa pagina
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const eventsGrid = document.getElementById('eventsGrid');
    const eventsList = document.getElementById('eventsList');
    
    const categoryDropdown = document.getElementById('categoryDropdown');
    const categoryMenu = document.getElementById('categoryMenu');
    const dateDropdown = document.getElementById('dateDropdown');
    const dateMenu = document.getElementById('dateMenu');
    
    const searchInput = document.getElementById('searchInput');
    
    const registrationModal = document.getElementById('registrationModal');
    const registrationForm = document.getElementById('registrationForm');
    const eventIdInput = document.getElementById('eventId');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // --- View toggle (Grid/List) ---
    if (gridViewBtn && listViewBtn && eventsGrid && eventsList) {
        gridViewBtn.addEventListener('click', function() {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            eventsGrid.classList.add('active');
            eventsList.classList.remove('active');
        });
        
        listViewBtn.addEventListener('click', function() {
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            eventsList.classList.add('active');
            eventsGrid.classList.remove('active');
        });
    }
    
    // --- Dropdown menus ---
    function toggleDropdown(button, menu) {
        if (!button || !menu) return;
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            // Chiudi altri dropdown
            if (menu === categoryMenu && dateMenu) dateMenu.classList.remove('show');
            if (menu === dateMenu && categoryMenu) categoryMenu.classList.remove('show');
            // Toggle attuale
            menu.classList.toggle('show');
        });
    }
    
    toggleDropdown(categoryDropdown, categoryMenu);
    toggleDropdown(dateDropdown, dateMenu);
    
    // Chiudi dropdown quando si clicca fuori
    window.addEventListener('click', function(e) {
        if (!e.target.matches('.filter-dropdown-button') && !e.target.closest('.filter-dropdown-menu')) {
            if (categoryMenu) categoryMenu.classList.remove('show');
            if (dateMenu) dateMenu.classList.remove('show');
        }
    });
    
    // --- Logica Filtri ---
    
    // Filtra per categoria
    if (categoryMenu) {
        document.querySelectorAll('#categoryMenu .filter-dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('#categoryMenu .filter-dropdown-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                const selectedText = this.textContent;
                if (categoryDropdown) {
                    categoryDropdown.innerHTML = `<i class="fas fa-filter"></i> ${selectedText} <i class="fas fa-chevron-down"></i>`;
                }
                categoryMenu.classList.remove('show');
                filterEvents();
            });
        });
    }

    // Filtra per data
    if (dateMenu) {
        document.querySelectorAll('#dateMenu .filter-dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('#dateMenu .filter-dropdown-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                const selectedText = this.textContent;
                if (dateDropdown) {
                    dateDropdown.innerHTML = `<i class="far fa-calendar-alt"></i> ${selectedText} <i class="fas fa-chevron-down"></i>`;
                }
                dateMenu.classList.remove('show');
                filterEvents();
            });
        });
    }

    // Funzione principale per filtrare gli eventi
    function filterEvents() {
        const selectedCategory = document.querySelector('#categoryMenu .filter-dropdown-item.active')?.getAttribute('data-value') || 'all';
        const selectedDate = document.querySelector('#dateMenu .filter-dropdown-item.active')?.getAttribute('data-value') || 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        // Date per il confronto
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - (endOfWeek.getDay() || 7))); // Fine settimana (Domenica)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Ottieni tutti gli eventi (sia in grid che in list)
        const allEvents = document.querySelectorAll('.event-card, .event-row');
        let visibleEventsCount = 0;

        allEvents.forEach(event => {
            let showEvent = true;
            
            // 1. Filtra per categoria
            if (selectedCategory !== 'all' && event.getAttribute('data-category') !== selectedCategory) {
                showEvent = false;
            }
            
            // 2. Filtra per data
            if (selectedDate !== 'all' && showEvent) {
                const eventDateStr = event.getAttribute('data-date');
                if (!eventDateStr) {
                    showEvent = false; // Nasconde se non ha data
                } else {
                    const eventDate = new Date(eventDateStr);
                    eventDate.setHours(0, 0, 0, 0); // Normalizza
                    
                    if (selectedDate === 'today' && eventDate.getTime() !== today.getTime()) {
                        showEvent = false;
                    } else if (selectedDate === 'tomorrow' && eventDate.getTime() !== tomorrow.getTime()) {
                        showEvent = false;
                    } else if (selectedDate === 'week' && (eventDate < today || eventDate > endOfWeek)) {
                        showEvent = false;
                    } else if (selectedDate === 'month' && (eventDate < today || eventDate > endOfMonth)) {
                        showEvent = false;
                    }
                }
            }
            
            // 3. Filtra per termine di ricerca
            if (searchTerm && showEvent) {
                const title = event.querySelector('.event-title, .event-row-title')?.textContent.toLowerCase() || '';
                const description = event.querySelector('.event-description, .event-row-description')?.textContent.toLowerCase() || '';
                
                if (!title.includes(searchTerm) && !description.includes(searchTerm)) {
                    showEvent = false;
                }
            }
            
            // Mostra o nascondi l'evento
            event.style.display = showEvent ? '' : 'none';
            if (showEvent) visibleEventsCount++;
        });

        // Controlla se ci sono eventi visibili
        handleNoResults(visibleEventsCount);
    }
    
    // Gestisce il messaggio "Nessun risultato"
    function handleNoResults(visibleCount) {
        let noEventsMessage = document.querySelector('.no-results');
        
        if (visibleCount === 0) {
            if (!noEventsMessage) {
                noEventsMessage = document.createElement('div');
                noEventsMessage.className = 'no-results'; // Usa classe generica
                noEventsMessage.innerHTML = '<i class="fas fa-info-circle"></i> Nessun evento corrisponde ai filtri selezionati.';
                
                if (eventsGrid && eventsGrid.classList.contains('active')) {
                    eventsGrid.appendChild(noEventsMessage);
                } else if (eventsList) {
                    eventsList.appendChild(noEventsMessage);
                }
            }
        } else {
            if (noEventsMessage) {
                noEventsMessage.remove();
            }
        }
    }
    
    // Ricerca
    if (searchInput) {
        searchInput.addEventListener('input', filterEvents);
    }
    
    // --- Logica Modal ---
    
    // Mostra notifica
    function showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notificationMessage');
        if (!notification || !notificationMessage) return;
        
        notificationMessage.textContent = message;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    }
    
    // Apri modal quando si clicca su "Iscriviti"
    document.querySelectorAll('.register-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            const eventCard = this.closest('.event-card, .event-row');
            const eventTitle = eventCard ? eventCard.querySelector('.event-title, .event-row-title').textContent : 'Evento';
            
            if (eventIdInput) eventIdInput.value = eventId;
            const modalTitle = document.querySelector('#registrationModal .modal-title');
            if (modalTitle) modalTitle.textContent = `Iscrizione a: ${eventTitle}`;
            
            if (registrationModal) registrationModal.style.display = 'flex';
        });
    });
    
    // Chiudi modal (da pulsanti X e Annulla)
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // Chiudi modal quando si clicca fuori
    window.addEventListener('click', function(e) {
        if (e.target === registrationModal) {
            registrationModal.style.display = 'none';
        }
    });
    
    // Gestione invio form
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulazione di invio form
            const eventId = eventIdInput.value;
            // Qui ci sarebbe l'invio dei dati a un server
            
            // Chiudi il modal
            if (registrationModal) registrationModal.style.display = 'none';
            
            // Reset del form
            this.reset();
            
            // Mostra notifica di conferma
            showNotification(`Iscrizione completata con successo! Riceverai un'email di conferma a breve.`, 5000);
        });
    }
    
    // --- Logica Paginazione (Placeholder) ---
    const paginationButtons = document.querySelectorAll('.pagination-button:not(.pagination-prev):not(.pagination-next)');
    const prevButton = document.querySelector('.pagination-prev');
    const nextButton = document.querySelector('.pagination-next');
    
    paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
            paginationButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // In un'app reale, qui caricheresti altri eventi
            window.scrollTo({
                top: (document.querySelector('.container')?.offsetTop || 0) - 100,
                behavior: 'smooth'
            });
        });
    });
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            const activeButton = document.querySelector('.pagination-button.active:not(.pagination-prev):not(.pagination-next)');
            const prevSibling = activeButton ? activeButton.previousElementSibling : null;
            
            if (prevSibling && !prevSibling.classList.contains('pagination-prev')) {
                prevSibling.click();
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            const activeButton = document.querySelector('.pagination-button.active:not(.pagination-prev):not(.pagination-next)');
            const nextSibling = activeButton ? activeButton.nextElementSibling : null;
            
            if (nextSibling && !nextSibling.classList.contains('pagination-next')) {
                nextSibling.click();
            }
        });
    }

});
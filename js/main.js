/* =================================================================== */
/* File: js/main.js
/* Desc: Script comuni a tutto il sito (menu, scroll, etc.)
/* =================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- Page Loader ---
    window.addEventListener('load', function() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 300); // Breve ritardo per fluidità
        }
    });
    
    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                    this.setAttribute('aria-label', 'Chiudi menu');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                    this.setAttribute('aria-label', 'Apri menu');
                }
            }
        });

        // Chiude il menu quando si clicca fuori (su mobile)
        document.addEventListener('click', function(event) {
            if (navLinks.classList.contains('active') && 
                !event.target.closest('.nav-links') && 
                !event.target.closest('.mobile-menu-btn')) {
                
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
                if (mobileMenuBtn) {
                    mobileMenuBtn.setAttribute('aria-label', 'Apri menu');
                }
            }
        });
    }
    
    // --- Smooth Scroll per Ancore (#) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 80;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Chiude menu mobile dopo click
                    if (navLinks && navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        const menuIcon = mobileMenuBtn.querySelector('i');
                        if (menuIcon) {
                            menuIcon.classList.remove('fa-times');
                            menuIcon.classList.add('fa-bars');
                        }
                        if (mobileMenuBtn) {
                            mobileMenuBtn.setAttribute('aria-label', 'Apri menu');
                        }
                    }
                }
            }
        });
    });
    
    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('active');
            } else {
                backToTopBtn.classList.remove('active');
            }
        });
        
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Animazioni su Scroll (per la Homepage) ---
    const animatedElements = document.querySelectorAll('[data-animation]');
    if (animatedElements.length > 0) {
        const isInViewport = function(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
                rect.bottom >= 0
            );
        };

        const handleAnimation = function() {
            animatedElements.forEach(element => {
                if (isInViewport(element) && !element.classList.contains('animated')) {
                    const animationType = element.dataset.animation;
                    const delay = element.dataset.delay || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animated', animationType);
                    }, parseInt(delay));
                }
            });
        };

        // Aggiungi stili per le animazioni (se non già presenti in CSS)
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            [data-animation] { opacity: 0; transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
            [data-animation="fade-in"] { transform: translateY(20px); }
            [data-animation="fade-in-right"] { transform: translateX(-20px); }
            [data-animation="fade-in-left"] { transform: translateX(20px); }
            
            [data-animation].animated { opacity: 1; transform: translateY(0) translateX(0); }
        `;
        document.head.appendChild(styleSheet);
        
        // Esegui al caricamento e allo scroll
        setTimeout(handleAnimation, 100);
        window.addEventListener('scroll', handleAnimation);
        window.addEventListener('resize', handleAnimation);
    }
    
    // --- Contatore Numeri (per la Homepage) ---
    const counterElements = document.querySelectorAll('.stat-number[data-count]');
    counterElements.forEach(counter => {
        counter.innerText = '0';
        
        const updateCounter = () => {
            const target = +counter.dataset.count;
            const count = +counter.innerText.replace('+', '');
            const increment = target / 50; // Velocità animazione
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCounter, 30);
            } else {
                counter.innerText = target + '+';
            }
        };
        
        const counterObserver = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    updateCounter();
                    counterObserver.unobserve(counter);
                }
            },
            { threshold: 0.5 }
        );
        
        counterObserver.observe(counter);
    });

    // --- Script Accordion (per FAQ) ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                // Chiudi tutti gli altri item
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                // Toggle dell'item corrente
                item.classList.toggle('active');
            });
        }
    });

});
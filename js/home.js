/*
 * Homepage JavaScript
 * Handles navigation, animations, and interactions
 */

(function() {
    'use strict';

    // ============================================
    // HEADER NAVIGATION TOGGLE
    // ============================================
    const navToggle = document.getElementById('navToggle');
    const headerNav = document.getElementById('headerNav');

    if (navToggle && headerNav) {
        navToggle.addEventListener('click', () => {
            headerNav.classList.toggle('open');
            navToggle.classList.toggle('active');
        });

        // Close nav when clicking a link (mobile)
        headerNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    headerNav.classList.remove('open');
                    navToggle.classList.remove('active');
                }
            });
        });
    }

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // SCROLL REVEAL ANIMATION
    // ============================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const revealPoint = 150;

            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('visible');
            }
        });
    };

    // Initial check
    revealOnScroll();

    // On scroll
    window.addEventListener('scroll', revealOnScroll, { passive: true });

    // ============================================
    // ACTIVE NAV LINK ON SCROLL
    // ============================================
    const sections = document.querySelectorAll('section[id]');
    const headerLinks = document.querySelectorAll('.header-link');

    const updateActiveLink = () => {
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                headerLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}` ||
                        (sectionId === 'hero' && link.getAttribute('href') === '/')) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', updateActiveLink, { passive: true });

    // ============================================
    // EASTER EGG: KONAMI CODE
    // ============================================
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.code === konamiCode[konamiIndex]) {
            konamiIndex++;

            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function activateEasterEgg() {
        // Create confetti effect
        const colors = ['#f97316', '#fafafa', '#22c55e', '#3b82f6', '#a855f7'];
        const confettiCount = 150;

        for (let i = 0; i < confettiCount; i++) {
            createConfetti(colors[Math.floor(Math.random() * colors.length)]);
        }

        // Show message
        const message = document.createElement('div');
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-secondary);
                border: 2px solid var(--accent);
                padding: 2rem 3rem;
                border-radius: 12px;
                z-index: 10000;
                text-align: center;
                animation: fadeUp 0.4s ease;
            ">
                <h3 style="font-family: var(--font-display); margin-bottom: 0.5rem; color: var(--accent);">You found it!</h3>
                <p style="color: var(--text-secondary); margin: 0;">Nice work, fellow developer. Let's build something together.</p>
            </div>
        `;
        document.body.appendChild(message);

        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transition = 'opacity 0.3s ease';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }

    function createConfetti(color) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${color};
            left: ${Math.random() * 100}vw;
            top: -20px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            pointer-events: none;
            z-index: 9999;
        `;

        document.body.appendChild(confetti);

        const animation = confetti.animate([
            {
                transform: 'translateY(0) rotate(0deg)',
                opacity: 1
            },
            {
                transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`,
                opacity: 0
            }
        ], {
            duration: Math.random() * 2000 + 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        animation.onfinish = () => confetti.remove();
    }

    // ============================================
    // EASTER EGG: CONSOLE MESSAGE
    // ============================================
    console.log(`
%c
   █████╗ ██╗  ██╗███╗   ███╗ █████╗ ██████╗
  ██╔══██╗██║  ██║████╗ ████║██╔══██╗██╔══██╗
  ███████║███████║██╔████╔██║███████║██║  ██║
  ██╔══██║██╔══██║██║╚██╔╝██║██╔══██║██║  ██║
  ██║  ██║██║  ██║██║ ╚═╝ ██║██║  ██║██████╔╝
  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝

  ██╗   ██╗ █████╗ ███████╗███████╗███████╗███╗   ██╗
  ╚██╗ ██╔╝██╔══██╗██╔════╝██╔════╝██╔════╝████╗  ██║
   ╚████╔╝ ███████║███████╗█████╗  █████╗  ██╔██╗ ██║
    ╚██╔╝  ██╔══██║╚════██║██╔══╝  ██╔══╝  ██║╚██╗██║
     ██║   ██║  ██║███████║███████╗███████╗██║ ╚████║
     ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═══╝

%cHey, curious developer!

You're digging through the source - I respect that.
Let's build something together.

→ Ahdfactz@gmail.com
→ github.com/ahmadkhattak1
→ x.com/AhmadYKhattak

P.S. Try the Konami code ↑↑↓↓←→←→BA
`,
    'color: #f97316; font-weight: bold; font-family: monospace;',
    'color: #a1a1a1; font-size: 11px; line-height: 1.6;'
    );

    // ============================================
    // PROFILE PHOTO EASTER EGG
    // ============================================
    const profilePhoto = document.querySelector('.profile-photo');
    let clickCount = 0;
    let clickTimer;

    if (profilePhoto) {
        profilePhoto.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);

            if (clickCount >= 5) {
                profilePhoto.style.transition = 'transform 0.5s ease';
                profilePhoto.style.transform = 'rotate(360deg) scale(1.1)';

                setTimeout(() => {
                    profilePhoto.style.transform = '';
                }, 500);

                clickCount = 0;
            }

            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 1000);
        });
    }

    // ============================================
    // FORM SUBMISSION HANDLING
    // ============================================
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Let Netlify handle the form - just update UI
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    // ============================================
    // STAGGERED ANIMATION ON LOAD
    // ============================================
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

})();

/*
 * Homepage JavaScript
 * Handles navigation, animations, and interactions
 */

(function () {
    'use strict';

    // ============================================
    // SPLASH SCREEN ANIMATION
    // ============================================
    const greetings = ['Hello', 'Salam', 'Ni hao', 'Bonjour', 'Hola'];
    const splashScreen = document.getElementById('splashScreen');
    const greetingEl = document.getElementById('splashGreeting');
    const greetingNextEl = document.getElementById('splashGreetingNext');

    if (splashScreen && greetingEl && greetingNextEl) {
        document.body.classList.add('splash-active');

        let currentIndex = 0;
        const holdDuration = 200; // pause before exiting
        const overlapOffset = 100; // next enters before previous fully exits

        function showGreeting(element, text) {
            element.textContent = text;
            element.classList.remove('visible', 'exiting');
            element.classList.add('entering');

            element.addEventListener('animationend', function handler() {
                element.classList.remove('entering');
                element.classList.add('visible');
                element.removeEventListener('animationend', handler);
            }, { once: true });
        }

        function exitGreeting(element) {
            element.classList.remove('visible', 'entering');
            element.classList.add('exiting');
        }

        function runSequence() {
            // Use alternating elements for overlap
            const elements = [greetingEl, greetingNextEl];
            let activeIndex = 0;

            // Show first greeting
            showGreeting(elements[activeIndex], greetings[currentIndex]);
            currentIndex++;

            function next() {
                if (currentIndex < greetings.length) {
                    // After hold, start exit and simultaneously enter next
                    setTimeout(() => {
                        const exitingEl = elements[activeIndex];
                        activeIndex = 1 - activeIndex; // toggle 0/1
                        const enteringEl = elements[activeIndex];

                        exitGreeting(exitingEl);

                        // Next greeting enters slightly before exit completes
                        setTimeout(() => {
                            showGreeting(enteringEl, greetings[currentIndex]);
                            currentIndex++;
                            next();
                        }, overlapOffset);
                    }, holdDuration);
                } else {
                    // Final greeting - hold then hide splash
                    setTimeout(() => {
                        exitGreeting(elements[activeIndex]);
                        setTimeout(() => {
                            splashScreen.classList.add('hidden');
                            document.body.classList.remove('splash-active');
                        }, 250);
                    }, holdDuration);
                }
            }

            next();
        }

        runSequence();
    }

    // ============================================
    // HERO INTERACTIVE GRID PATTERN
    // ============================================
    const hero = document.getElementById('hero');
    const heroGridCanvas = document.getElementById('heroGridCanvas');

    if (hero && heroGridCanvas) {
        initInteractiveGridPattern(hero, heroGridCanvas);
    }

    function initInteractiveGridPattern(container, canvas) {
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        const state = {
            dpr: Math.min(window.devicePixelRatio || 1, 2),
            width: 0,
            height: 0,
            cellSize: 32,
            cols: 0,
            rows: 0,
            intensities: new Float32Array(0),
            pointerX: 0,
            pointerY: 0,
            prevPointerX: null,
            prevPointerY: null,
            pointerInside: false,
            rafId: 0
        };

        function resizeGrid() {
            const rect = container.getBoundingClientRect();
            state.width = rect.width;
            state.height = rect.height;
            state.cellSize = window.innerWidth <= 640 ? 26 : window.innerWidth <= 1024 ? 30 : 34;
            state.cols = Math.max(1, Math.ceil(state.width / state.cellSize));
            state.rows = Math.max(1, Math.ceil(state.height / state.cellSize));
            state.intensities = new Float32Array(state.cols * state.rows);
            state.dpr = Math.min(window.devicePixelRatio || 1, 2);

            canvas.width = Math.max(1, Math.floor(state.width * state.dpr));
            canvas.height = Math.max(1, Math.floor(state.height * state.dpr));
            canvas.style.width = `${state.width}px`;
            canvas.style.height = `${state.height}px`;

            container.style.setProperty('--hero-grid-size', `${state.cellSize}px`);
            container.style.setProperty('--pointer-x', `${state.width * 0.56}px`);
            container.style.setProperty('--pointer-y', `${state.height * 0.3}px`);

            ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
        }

        function energizeCell(x, y) {
            const baseCol = Math.floor(x / state.cellSize);
            const baseRow = Math.floor(y / state.cellSize);
            const searchRadius = 2;
            const influenceRadius = state.cellSize * 2.4;

            for (let row = baseRow - searchRadius; row <= baseRow + searchRadius; row++) {
                if (row < 0 || row >= state.rows) {
                    continue;
                }

                for (let col = baseCol - searchRadius; col <= baseCol + searchRadius; col++) {
                    if (col < 0 || col >= state.cols) {
                        continue;
                    }

                    const centerX = (col * state.cellSize) + (state.cellSize / 2);
                    const centerY = (row * state.cellSize) + (state.cellSize / 2);
                    const distance = Math.hypot(x - centerX, y - centerY);
                    const falloff = Math.max(0, 1 - (distance / influenceRadius));

                    if (falloff <= 0) {
                        continue;
                    }

                    const index = (row * state.cols) + col;
                    const nextIntensity = Math.pow(falloff, 1.65);
                    state.intensities[index] = Math.max(state.intensities[index], nextIntensity);
                }
            }
        }

        function updatePointer(clientX, clientY) {
            const rect = container.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            const startX = state.prevPointerX == null ? x : state.prevPointerX;
            const startY = state.prevPointerY == null ? y : state.prevPointerY;
            const distance = Math.hypot(x - startX, y - startY);
            const steps = Math.max(1, Math.ceil(distance / Math.max(12, state.cellSize * 0.45)));

            state.pointerInside = true;
            state.pointerX = x;
            state.pointerY = y;
            container.style.setProperty('--pointer-x', `${x}px`);
            container.style.setProperty('--pointer-y', `${y}px`);

            for (let step = 1; step <= steps; step++) {
                const progress = step / steps;
                energizeCell(
                    startX + ((x - startX) * progress),
                    startY + ((y - startY) * progress)
                );
            }

            state.prevPointerX = x;
            state.prevPointerY = y;
        }

        function resetPointer() {
            state.pointerInside = false;
            state.prevPointerX = null;
            state.prevPointerY = null;
            container.style.setProperty('--pointer-x', `${state.width * 0.56}px`);
            container.style.setProperty('--pointer-y', `${state.height * 0.3}px`);
        }

        function renderGrid() {
            ctx.clearRect(0, 0, state.width, state.height);

            for (let row = 0; row < state.rows; row++) {
                for (let col = 0; col < state.cols; col++) {
                    const index = (row * state.cols) + col;
                    const centerX = (col * state.cellSize) + (state.cellSize / 2);
                    const centerY = (row * state.cellSize) + (state.cellSize / 2);
                    const trailIntensity = state.intensities[index];
                    let proximityIntensity = 0;

                    if (trailIntensity > 0.001) {
                        state.intensities[index] = trailIntensity * 0.92;
                    } else if (trailIntensity !== 0) {
                        state.intensities[index] = 0;
                    }

                    if (state.pointerInside) {
                        const distance = Math.hypot(state.pointerX - centerX, state.pointerY - centerY);
                        proximityIntensity = Math.max(0, 1 - (distance / (state.cellSize * 2.8))) * 0.3;
                    }

                    const intensity = Math.max(state.intensities[index], proximityIntensity);

                    if (intensity < 0.04) {
                        continue;
                    }

                    const inset = Math.max(1.6, state.cellSize * 0.08);
                    const size = Math.max(3, state.cellSize - (inset * 2));
                    const x = (col * state.cellSize) + inset;
                    const y = (row * state.cellSize) + inset;

                    ctx.fillStyle = `rgba(249, 115, 22, ${0.045 + (intensity * 0.18)})`;
                    ctx.shadowColor = `rgba(251, 146, 60, ${0.1 + (intensity * 0.16)})`;
                    ctx.shadowBlur = 10 * intensity;
                    ctx.fillRect(x, y, size, size);
                }
            }

            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
            state.rafId = window.requestAnimationFrame(renderGrid);
        }

        container.addEventListener('pointermove', event => {
            updatePointer(event.clientX, event.clientY);
        });

        container.addEventListener('pointerleave', resetPointer);
        container.addEventListener('touchend', resetPointer, { passive: true });

        container.addEventListener('touchmove', event => {
            if (!event.touches[0]) {
                return;
            }

            updatePointer(event.touches[0].clientX, event.touches[0].clientY);
        }, { passive: true });

        if (typeof ResizeObserver === 'function') {
            const resizeObserver = new ResizeObserver(() => resizeGrid());
            resizeObserver.observe(container);
        } else {
            window.addEventListener('resize', resizeGrid);
        }

        resizeGrid();
        renderGrid();
    }

    // ============================================
    // CONTACT DOTTED SURFACE
    // ============================================
    const contactSurface = document.getElementById('contactSurface');

    if (contactSurface && window.THREE) {
        initContactDottedSurface(contactSurface, window.THREE);
    }

    function initContactDottedSurface(container, THREE) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(58, 1, 1, 10000);
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        const state = {
            separation: 130,
            amountX: 28,
            amountY: 46,
            count: 0,
            animationId: 0,
            geometry: null,
            material: null
        };

        scene.fog = new THREE.Fog(0x0a0a0a, 1800, 5200);
        camera.position.set(0, 320, 1040);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let ix = 0; ix < state.amountX; ix++) {
            for (let iy = 0; iy < state.amountY; iy++) {
                const x = ix * state.separation - ((state.amountX * state.separation) / 2);
                const y = 0;
                const z = iy * state.separation - ((state.amountY * state.separation) / 2);
                positions.push(x, y, z);
                colors.push(170 / 255, 170 / 255, 170 / 255);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 6.4,
            vertexColors: true,
            transparent: true,
            opacity: 0.62,
            sizeAttenuation: true
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        state.geometry = geometry;
        state.material = material;

        function resizeSurface() {
            const rect = container.getBoundingClientRect();
            const width = Math.max(1, rect.width);
            const height = Math.max(1, rect.height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }

        function animateSurface() {
            state.animationId = window.requestAnimationFrame(animateSurface);

            const positionAttribute = geometry.attributes.position;
            const positionArray = positionAttribute.array;
            let i = 0;

            for (let ix = 0; ix < state.amountX; ix++) {
                for (let iy = 0; iy < state.amountY; iy++) {
                    const index = i * 3;
                    positionArray[index + 1] =
                        (Math.sin((ix + state.count) * 0.28) * 34) +
                        (Math.sin((iy + state.count) * 0.42) * 34);
                    i++;
                }
            }

            positionAttribute.needsUpdate = true;
            renderer.render(scene, camera);
            state.count += 0.055;
        }

        const handleResize = () => resizeSurface();
        window.addEventListener('resize', handleResize);
        resizeSurface();
        animateSurface();

        window.addEventListener('beforeunload', () => {
            window.cancelAnimationFrame(state.animationId);
            window.removeEventListener('resize', handleResize);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        }, { once: true });
    }

    // ============================================
    // PROJECTS CAROUSEL
    // ============================================
    const projectsTrack = document.querySelector('[data-projects-track]');
    const projectCards = projectsTrack
        ? Array.from(projectsTrack.querySelectorAll('[data-project-card]'))
        : [];
    const prevProjectButton = document.querySelector('[data-projects-nav="prev"]');
    const nextProjectButton = document.querySelector('[data-projects-nav="next"]');

    if (projectsTrack && projectCards.length > 1) {
        initProjectsCarousel(projectsTrack, projectCards, prevProjectButton, nextProjectButton);
    }

    function initProjectsCarousel(track, cards, prevButton, nextButton) {
        let activeIndex = 0;
        let scrollFrame = 0;
        const carousel = track.closest('.projects-carousel');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
        let lastWheelInteraction = 0;

        const clampIndex = index => Math.max(0, Math.min(cards.length - 1, index));

        const getCardTargetLeft = card => {
            const trackStyles = window.getComputedStyle(track);
            const paddingLeft = parseFloat(trackStyles.paddingLeft) || 0;
            const maxScrollLeft = track.scrollWidth - track.clientWidth;
            const targetLeft = card.offsetLeft - paddingLeft;

            return Math.max(0, Math.min(targetLeft, maxScrollLeft));
        };

        const findClosestIndex = () => {
            let closestIndex = 0;
            let closestDistance = Number.POSITIVE_INFINITY;

            cards.forEach((card, index) => {
                const distance = Math.abs(getCardTargetLeft(card) - track.scrollLeft);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            return closestIndex;
        };

        const updateNavState = () => {
            if (prevButton) {
                prevButton.disabled = activeIndex === 0;
            }

            if (nextButton) {
                nextButton.disabled = activeIndex === cards.length - 1;
            }
        };

        const syncActiveIndex = () => {
            activeIndex = findClosestIndex();
            updateNavState();
        };

        const scrollToIndex = index => {
            const nextIndex = clampIndex(index);
            activeIndex = nextIndex;
            updateNavState();
            track.scrollTo({
                left: getCardTargetLeft(cards[nextIndex]),
                behavior: scrollBehavior
            });
        };

        const handleDirection = direction => {
            scrollToIndex(findClosestIndex() + direction);
        };

        if (prevButton) {
            prevButton.addEventListener('click', () => handleDirection(-1));
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => handleDirection(1));
        }

        if (carousel) {
            carousel.addEventListener('click', event => {
                if (event.target.closest('.project-card, .projects-nav')) {
                    return;
                }

                const rect = carousel.getBoundingClientRect();
                const clickX = event.clientX - rect.left;
                const edgeThreshold = Math.max(64, Math.min(120, rect.width * 0.16));

                if (clickX <= edgeThreshold) {
                    handleDirection(-1);
                    return;
                }

                if (clickX >= rect.width - edgeThreshold) {
                    handleDirection(1);
                }
            });
        }

        track.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                handleDirection(-1);
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                handleDirection(1);
            }
        });

        track.addEventListener('scroll', () => {
            if (scrollFrame) {
                window.cancelAnimationFrame(scrollFrame);
            }

            scrollFrame = window.requestAnimationFrame(() => {
                syncActiveIndex();
                scrollFrame = 0;
            });
        }, { passive: true });

        track.addEventListener('wheel', event => {
            const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;

            if (!horizontalIntent) {
                return;
            }

            const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
                ? event.deltaX
                : event.deltaY;

            if (Math.abs(dominantDelta) < 10) {
                return;
            }

            const direction = dominantDelta > 0 ? 1 : -1;
            const currentIndex = findClosestIndex();
            const nextIndex = clampIndex(currentIndex + direction);

            if (nextIndex === currentIndex) {
                return;
            }

            event.preventDefault();

            const now = window.performance.now();
            if (now - lastWheelInteraction < 420) {
                return;
            }

            lastWheelInteraction = now;
            scrollToIndex(nextIndex);
        }, { passive: false });

        cards.forEach((card, index) => {
            const link = card.querySelector('.project-card');

            if (!link) {
                return;
            }

            link.addEventListener('focus', () => {
                if (index === activeIndex) {
                    updateNavState();
                    return;
                }

                scrollToIndex(index);
            });
        });

        window.addEventListener('resize', syncActiveIndex);
        syncActiveIndex();
    }

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
        anchor.addEventListener('click', function (e) {
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

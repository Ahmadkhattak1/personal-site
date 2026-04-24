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
        const holdDuration = 120; // pause before exiting
        const overlapOffset = 60; // next enters before previous fully exits

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
                        }, 160);
                    }, holdDuration);
                }
            }

            next();
        }

        runSequence();
    }

    // ============================================
    // CONTACT DOTTED SURFACE
    // ============================================
    const heroContourCanvas = document.getElementById('heroContourCanvas');
    if (heroContourCanvas) {
        initHeroContour(heroContourCanvas);
    }

    const contactSurface = document.getElementById('contactSurface');

    if (contactSurface && window.THREE) {
        initContactDottedSurface(contactSurface, window.THREE);
    }

    function initHeroContour(canvas) {
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        if (!ctx || !container) {
            return;
        }

        let width = 0;
        let height = 0;
        let resizeFrame = 0;

        function terrainHeight(normX, normY) {
            const fx = normX * 7.3;
            const fy = normY * 5.9;
            let value = Math.sin(fx * 1.2) * Math.cos(fy * 0.8) * 0.6;
            value += Math.cos(fx * 2.5 + 1.0) * Math.sin(fy * 1.9) * 0.4;
            value += Math.sin(fx * 4.8 - fy * 1.6) * 0.3;
            value += Math.cos(fy * 3.9 + fx * 0.6) * 0.35;
            value += Math.sin(fx * 2.2 + Math.sin(fy * 2.8)) * 0.3;
            value += Math.cos(fy * 2.5 + Math.cos(fx * 2.0)) * 0.3;
            return value;
        }

        function drawContour() {
            if (!width || !height) {
                return;
            }

            ctx.clearRect(0, 0, width, height);

            const aspect = width / height;
            const gridCols = Math.max(92, Math.round(118 * aspect));
            const gridRows = Math.max(74, Math.round(gridCols / Math.max(aspect, 1.1)));
            const cellWidth = width / gridCols;
            const cellHeight = height / gridRows;
            const terrainGrid = new Array(gridRows + 1);

            for (let row = 0; row <= gridRows; row++) {
                terrainGrid[row] = new Array(gridCols + 1);
                const normY = row / gridRows;

                for (let col = 0; col <= gridCols; col++) {
                    const normX = col / gridCols;
                    terrainGrid[row][col] = terrainHeight(normX, normY);
                }
            }

            const contourLevels = [];
            const minRaw = -0.9;
            const maxRaw = 1.45;
            const steps = 8;

            for (let index = 0; index <= steps; index++) {
                contourLevels.push(minRaw + (index / steps) * (maxRaw - minRaw));
            }

            for (let levelIndex = 0; levelIndex < contourLevels.length; levelIndex++) {
                const level = contourLevels[levelIndex];
                const isMajor = levelIndex % 2 === 0;
                ctx.strokeStyle = isMajor ? 'rgba(214, 224, 234, 0.2)' : 'rgba(214, 224, 234, 0.1)';
                ctx.lineWidth = isMajor ? 1.25 : 0.75;
                ctx.beginPath();

                for (let row = 0; row < gridRows; row++) {
                    for (let col = 0; col < gridCols; col++) {
                        const x = col * cellWidth;
                        const y = row * cellHeight;
                        const valueTopLeft = terrainGrid[row][col];
                        const valueTopRight = terrainGrid[row][col + 1];
                        const valueBottomRight = terrainGrid[row + 1][col + 1];
                        const valueBottomLeft = terrainGrid[row + 1][col];

                        let configuration = 0;
                        if (valueTopLeft >= level) configuration |= 1;
                        if (valueTopRight >= level) configuration |= 2;
                        if (valueBottomRight >= level) configuration |= 4;
                        if (valueBottomLeft >= level) configuration |= 8;

                        if (configuration === 0 || configuration === 15) {
                            continue;
                        }

                        const topInterpolation = valueTopLeft !== valueTopRight
                            ? (level - valueTopLeft) / (valueTopRight - valueTopLeft)
                            : 0.5;
                        const rightInterpolation = valueTopRight !== valueBottomRight
                            ? (level - valueTopRight) / (valueBottomRight - valueTopRight)
                            : 0.5;
                        const bottomInterpolation = valueBottomLeft !== valueBottomRight
                            ? (level - valueBottomLeft) / (valueBottomRight - valueBottomLeft)
                            : 0.5;
                        const leftInterpolation = valueTopLeft !== valueBottomLeft
                            ? (level - valueTopLeft) / (valueBottomLeft - valueTopLeft)
                            : 0.5;

                        const topX = x + topInterpolation * cellWidth;
                        const topY = y;
                        const rightX = x + cellWidth;
                        const rightY = y + rightInterpolation * cellHeight;
                        const bottomX = x + bottomInterpolation * cellWidth;
                        const bottomY = y + cellHeight;
                        const leftX = x;
                        const leftY = y + leftInterpolation * cellHeight;

                        const segment = (x1, y1, x2, y2) => {
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                        };

                        switch (configuration) {
                            case 1:
                            case 14:
                                segment(leftX, leftY, topX, topY);
                                break;
                            case 2:
                            case 13:
                                segment(topX, topY, rightX, rightY);
                                break;
                            case 3:
                            case 12:
                                segment(leftX, leftY, rightX, rightY);
                                break;
                            case 4:
                            case 11:
                                segment(bottomX, bottomY, rightX, rightY);
                                break;
                            case 5:
                                segment(leftX, leftY, topX, topY);
                                segment(bottomX, bottomY, rightX, rightY);
                                break;
                            case 6:
                            case 9:
                                segment(topX, topY, bottomX, bottomY);
                                break;
                            case 7:
                            case 8:
                                segment(leftX, leftY, bottomX, bottomY);
                                break;
                            case 10:
                                segment(topX, topY, rightX, rightY);
                                segment(leftX, leftY, bottomX, bottomY);
                                break;
                            default:
                                break;
                        }
                    }
                }

                ctx.stroke();
            }
        }

        function resizeContour() {
            const rect = container.getBoundingClientRect();
            const nextWidth = Math.max(1, Math.round(rect.width));
            const nextHeight = Math.max(1, Math.round(rect.height));

            if (nextWidth === width && nextHeight === height) {
                return;
            }

            width = nextWidth;
            height = nextHeight;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

            drawContour();
        }

        function queueResize() {
            if (resizeFrame) {
                window.cancelAnimationFrame(resizeFrame);
            }

            resizeFrame = window.requestAnimationFrame(() => {
                resizeFrame = 0;
                resizeContour();
            });
        }

        const resizeObserver = typeof window.ResizeObserver === 'function'
            ? new window.ResizeObserver(queueResize)
            : null;

        if (resizeObserver) {
            resizeObserver.observe(container);
        }

        window.addEventListener('resize', queueResize);
        resizeContour();

        window.addEventListener('beforeunload', () => {
            if (resizeFrame) {
                window.cancelAnimationFrame(resizeFrame);
            }

            window.removeEventListener('resize', queueResize);

            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        }, { once: true });
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

    const copyEmailLink = document.querySelector('[data-copy-email]');
    if (copyEmailLink) {
        initCopyEmail(copyEmailLink);
    }

    function initProjectsCarousel(track, cards, prevButton, nextButton) {
        let activeIndex = 0;
        let scrollFrame = 0;
        const carousel = track.closest('.projects-carousel');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
        let lastWheelInteraction = 0;
        let suppressClickUntil = 0;
        const dragThreshold = 8;
        const dragState = {
            pointerId: null,
            startX: 0,
            startScrollLeft: 0,
            active: false,
            dragging: false,
            captured: false
        };

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

        const stopDragging = pointerId => {
            if (!dragState.active || (pointerId !== null && dragState.pointerId !== pointerId)) {
                return;
            }

            if (dragState.captured && typeof track.releasePointerCapture === 'function' && dragState.pointerId !== null) {
                try {
                    track.releasePointerCapture(dragState.pointerId);
                } catch (error) {
                    // Ignore release errors when capture has already been dropped.
                }
            }

            if (dragState.dragging) {
                suppressClickUntil = window.performance.now() + 220;
            }

            dragState.pointerId = null;
            dragState.active = false;
            dragState.dragging = false;
            dragState.captured = false;
            track.classList.remove('is-dragging');
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

        track.addEventListener('pointerdown', event => {
            if (event.pointerType === 'touch' || event.button !== 0 || event.target.closest('.projects-nav')) {
                return;
            }

            dragState.pointerId = event.pointerId;
            dragState.startX = event.clientX;
            dragState.startScrollLeft = track.scrollLeft;
            dragState.active = true;
            dragState.dragging = false;
            dragState.captured = false;
        });

        track.addEventListener('pointermove', event => {
            if (!dragState.active || dragState.pointerId !== event.pointerId) {
                return;
            }

            const deltaX = event.clientX - dragState.startX;

            if (!dragState.dragging && Math.abs(deltaX) >= dragThreshold) {
                dragState.dragging = true;
                track.classList.add('is-dragging');

                if (!dragState.captured && typeof track.setPointerCapture === 'function') {
                    track.setPointerCapture(event.pointerId);
                    dragState.captured = true;
                }
            }

            if (!dragState.dragging) {
                return;
            }

            event.preventDefault();
            track.scrollLeft = dragState.startScrollLeft - deltaX;
        });

        track.addEventListener('pointerup', event => {
            stopDragging(event.pointerId);
        });

        track.addEventListener('pointercancel', event => {
            stopDragging(event.pointerId);
        });

        window.addEventListener('pointerup', event => {
            stopDragging(event.pointerId);
        });

        window.addEventListener('pointercancel', event => {
            stopDragging(event.pointerId);
        });

        track.addEventListener('lostpointercapture', () => {
            stopDragging(null);
        });

        track.addEventListener('dragstart', event => {
            event.preventDefault();
        });

        track.addEventListener('click', event => {
            if (window.performance.now() < suppressClickUntil) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, true);

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

    function initCopyEmail(link) {
        const email = link.getAttribute('data-copy-email');
        const label = link.querySelector('.contact-email-label');
        const defaultLabel = link.getAttribute('data-copy-label-default') || (label ? label.textContent : '');
        const copiedLabel = link.getAttribute('data-copy-label-copied') || 'Copied';
        let resetTimer = 0;

        const setCopiedState = copied => {
            if (label) {
                label.textContent = copied ? copiedLabel : defaultLabel;
            }

            link.classList.toggle('is-copied', copied);
            link.setAttribute('aria-label', copied ? `${email} copied` : `Copy ${email}`);
        };

        setCopiedState(false);

        link.addEventListener('click', async event => {
            event.preventDefault();

            if (!email) {
                return;
            }

            try {
                await navigator.clipboard.writeText(email);
                setCopiedState(true);

                if (resetTimer) {
                    window.clearTimeout(resetTimer);
                }

                resetTimer = window.setTimeout(() => {
                    setCopiedState(false);
                    resetTimer = 0;
                }, 1200);
            } catch (error) {
                window.location.href = link.href;
            }
        });
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

            → hi@ahmadyaseen.com
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

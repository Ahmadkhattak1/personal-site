/*
 * Journey Page JavaScript
 * Handles sidebar navigation, section rendering, and interactions
 */

(function() {
    'use strict';

    // ============================================
    // MOBILE NAVIGATION TOGGLE
    // ============================================
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            navToggle.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
            });
        });
    }

    // ============================================
    // RENDER ABOUT SECTION
    // ============================================
    function renderAbout() {
        const container = document.getElementById('aboutContent');
        if (!container || !JOURNEY_DATA.about.full) return;

        container.innerHTML = JOURNEY_DATA.about.full
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('');
    }

    // ============================================
    // RENDER EXPERIENCE TIMELINE
    // ============================================
    function renderExperience() {
        const container = document.getElementById('experienceTimeline');
        if (!container || !JOURNEY_DATA.experience) return;

        container.innerHTML = JOURNEY_DATA.experience.map(exp => `
            <div class="timeline-item">
                <span class="timeline-date">${exp.date}</span>
                <h3 class="timeline-title">${exp.role}</h3>
                <span class="timeline-subtitle">
                    ${exp.companyUrl
                        ? `<a href="${exp.companyUrl}" target="_blank" rel="noopener noreferrer">${exp.company}</a>`
                        : exp.company
                    }
                </span>
                <p class="timeline-desc">${exp.description}</p>
            </div>
        `).join('');
    }

    // ============================================
    // RENDER EDUCATION TIMELINE
    // ============================================
    function renderEducation() {
        const container = document.getElementById('educationTimeline');
        if (!container || !JOURNEY_DATA.education) return;

        container.innerHTML = JOURNEY_DATA.education.map(edu => `
            <div class="timeline-item">
                <span class="timeline-date">${edu.date}</span>
                <h3 class="timeline-title">${edu.degree}</h3>
                <span class="timeline-subtitle">
                    ${edu.institutionUrl
                        ? `<a href="${edu.institutionUrl}" target="_blank" rel="noopener noreferrer">${edu.institution}</a>`
                        : edu.institution
                    }
                </span>
                <p class="timeline-desc">${edu.description}</p>
            </div>
        `).join('');
    }

    // ============================================
    // RENDER SKILLS
    // ============================================
    function renderSkills() {
        const container = document.getElementById('skillsContainer');
        if (!container || !JOURNEY_DATA.skills) return;

        const skillCategories = {
            frontend: 'Frontend',
            backend: 'Backend',
            ai: 'AI / ML',
            tools: 'Tools'
        };

        container.innerHTML = Object.entries(JOURNEY_DATA.skills).map(([key, skills]) => `
            <div class="skill-category">
                <h3 class="skill-category-title">${skillCategories[key] || key}</h3>
                <div class="skill-tags">
                    ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    // ============================================
    // RENDER PROJECTS
    // ============================================
    function renderProjects() {
        const container = document.getElementById('projectsGrid');
        if (!container || !JOURNEY_DATA.allProjects) return;

        container.innerHTML = JOURNEY_DATA.allProjects.map(project => `
            <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-item">
                <div class="project-item-header">
                    ${project.logo
                        ? `<img src="${project.logo}" alt="${project.name} logo" class="project-item-logo">`
                        : ''
                    }
                    <h3 class="project-item-name">${project.name}</h3>
                </div>
                <p class="project-item-desc">${project.description}</p>
                <div class="project-item-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </a>
        `).join('');
    }

    // ============================================
    // RENDER RESEARCH
    // ============================================
    function renderResearch() {
        const container = document.getElementById('researchList');
        if (!container || !JOURNEY_DATA.research) return;

        container.innerHTML = JOURNEY_DATA.research.map(item => `
            <div class="research-item">
                <div class="research-item-header">
                    <h3 class="research-item-title">${item.title}</h3>
                    <span class="research-item-year">${item.year}</span>
                </div>
                <p class="research-item-meta">${item.role} · ${item.publication}</p>
                <p class="research-item-desc">${item.description}</p>
                ${item.url && item.url !== '#'
                    ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="research-item-link">
                        Read Paper
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M7 17L17 7M17 7H7M17 7V17"/>
                        </svg>
                       </a>`
                    : ''
                }
            </div>
        `).join('');
    }

    // ============================================
    // RENDER CERTIFICATIONS
    // ============================================
    function renderCertifications() {
        const container = document.getElementById('certsList');
        if (!container || !JOURNEY_DATA.certifications) return;

        container.innerHTML = JOURNEY_DATA.certifications.map(cert => `
            <a href="${cert.url}" target="_blank" rel="noopener noreferrer" class="cert-item">
                <div class="cert-item-info">
                    <div class="cert-item-name">${cert.name}</div>
                    <div class="cert-item-issuer">${cert.issuer}${cert.date ? ` · ${cert.date}` : ''}</div>
                </div>
                <svg class="cert-item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
            </a>
        `).join('');
    }

    // ============================================
    // RENDER GITHUB CHART
    // ============================================
    function renderGitHub() {
        const chartContainer = document.getElementById('githubChart');
        const profileLink = document.getElementById('githubProfileLink');

        if (!JOURNEY_DATA.github) return;

        const { username, chartColor } = JOURNEY_DATA.github;

        if (chartContainer) {
            chartContainer.innerHTML = `
                <img
                    src="https://ghchart.rshah.org/${chartColor}/${username}"
                    alt="${username}'s GitHub contribution chart"
                    loading="lazy"
                >
            `;
        }

        if (profileLink) {
            profileLink.href = `https://github.com/${username}`;
        }
    }

    // ============================================
    // SIDEBAR ACTIVE STATE ON SCROLL
    // ============================================
    function setupScrollSpy() {
        const sections = document.querySelectorAll('.journey-section');
        const sidebarLinks = document.querySelectorAll('.journey-sidebar-link');
        const mobileLinks = document.querySelectorAll('.mobile-tab');

        const updateActiveLink = () => {
            const scrollPosition = window.scrollY + 150;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Check if we're at the bottom of the page
            const isAtBottom = windowHeight + window.scrollY >= documentHeight - 50;

            let currentSection = null;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSection = sectionId;
                }
            });

            // If at bottom, activate the last section
            if (isAtBottom && sections.length > 0) {
                currentSection = sections[sections.length - 1].getAttribute('id');
            }

            if (currentSection) {
                // Update sidebar links
                sidebarLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === currentSection) {
                        link.classList.add('active');
                    }
                });

                // Update mobile tabs
                mobileLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === currentSection) {
                        link.classList.add('active');
                    }
                });
            }
        };

        window.addEventListener('scroll', updateActiveLink, { passive: true });
        updateActiveLink(); // Initial call
    }

    // ============================================
    // SMOOTH SCROLL FOR NAVIGATION
    // ============================================
    function setupSmoothScroll() {
        const allNavLinks = document.querySelectorAll('.journey-sidebar-link, .mobile-tab');

        allNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Skip if it's the home link
                if (link.getAttribute('href') === '/') {
                    return;
                }

                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    // Calculate offset based on screen size
                    const mobileTabsHeight = window.innerWidth <= 768 ? 60 : 0;
                    const offset = mobileTabsHeight + 20;

                    window.scrollTo({
                        top: targetSection.offsetTop - offset,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // DOWNLOAD RESUME BUTTON
    // ============================================
    function setupDownloadButton() {
        const downloadBtn = document.getElementById('downloadResume');

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (typeof generateResumePDF === 'function') {
                    generateResumePDF();
                } else {
                    console.error('PDF generator not loaded');
                    alert('PDF generator is loading. Please try again.');
                }
            });
        }
    }

    // ============================================
    // INITIALIZE
    // ============================================
    function init() {
        // Render all sections
        renderAbout();
        renderExperience();
        renderEducation();
        renderSkills();
        renderProjects();
        renderResearch();
        renderCertifications();
        renderGitHub();

        // Setup interactions
        setupScrollSpy();
        setupSmoothScroll();
        setupDownloadButton();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================
    // CONSOLE EASTER EGG
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

%cExploring my journey? Nice!

→ Ahdfactz@gmail.com
`,
    'color: #f97316; font-weight: bold; font-family: monospace;',
    'color: #a1a1a1; font-size: 11px;'
    );

})();

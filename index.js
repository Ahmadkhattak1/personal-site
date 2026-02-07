/*
 * Made with <3 by Ahmad Yaseen
 * GitHub: https://github.com/ahmadkhattak1
 */

// Verify template attribution
(function () {
    if (!CONFIG._meta || !CONFIG._meta.author || CONFIG._meta.author !== "Ahmad Yaseen") {
        console.warn("Template attribution modified. Please maintain original attribution.");
    }
})();

const shouldShowSection = (sectionName) => {
    return CONFIG.showSection && CONFIG.showSection[sectionName] !== false;
};

const hideSection = (selector) => {
    const section = document.querySelector(selector);
    if (section) section.style.display = 'none';
};

const populatePage = () => {
    // Personal Information
    document.getElementById('name').textContent = CONFIG.personal.name;
    document.getElementById('title').textContent = CONFIG.personal.title;
    const profileImg = document.querySelector('#profile img');
    if (profileImg) {
        profileImg.src = CONFIG.personal.profileImage;
        profileImg.alt = CONFIG.personal.profileImageAlt;
    }

    // Social Links
    const socialLinks = document.querySelector('.social-links');
    if (socialLinks) {
        socialLinks.innerHTML = `
            <a href="mailto:${CONFIG.social.email}">Email</a>
            <a href="${CONFIG.social.github}" target="_blank">GitHub</a>
            <a href="${CONFIG.social.linkedin}" target="_blank">LinkedIn</a>
            <a href="${CONFIG.social.twitter}" target="_blank">X</a>
        `;
    }

    // Status Indicator ("Currently working on")
    const statusIndicator = document.getElementById('statusIndicator');
    if (statusIndicator && CONFIG.personal.currently) {
        const statusText = statusIndicator.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = CONFIG.personal.currently;
        }
    } else if (statusIndicator) {
        statusIndicator.style.display = 'none';
    }

    // About Me
    if (shouldShowSection('about') && CONFIG.about) {
        const p = document.querySelector('#about p');
        if (p) p.textContent = CONFIG.about;
    } else {
        hideSection('#about');
    }

    // Skills
    if (shouldShowSection('skills') && CONFIG.skills) {
        const skillsList = document.querySelector('#skills ul');
        if (skillsList) {
            skillsList.className = 'skills-list';
            skillsList.innerHTML = CONFIG.skills.map(skill => {
                if (typeof skill === 'string') {
                    return `<li><span class="skill-category">${skill}</span></li>`;
                } else {
                    const subItems = skill.subItems.map(item => `<span class="skill-tag">${item}</span>`).join('');
                    return `<li><span class="skill-category">${skill.text}</span> <div class="skill-items">${subItems}</div></li>`;
                }
            }).join('');
        }
    } else {
        hideSection('#skills');
    }

    // Research (new)
    if (shouldShowSection('research') && CONFIG.research) {
        // Populate research interests summary
        const researchInterests = document.getElementById('researchInterests');
        if (researchInterests && CONFIG.researchInterests) {
            researchInterests.textContent = CONFIG.researchInterests;
        }

        const researchGrid = document.querySelector('#research .grid-container');
        if (researchGrid) {
            researchGrid.innerHTML = CONFIG.research.map(item => `
                <a href="${item.url}" class="card-link" target="_blank">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">${item.title}</h3>
                            <span class="card-year">${item.year}</span>
                        </div>
                        <div class="card-subtitle">${item.institution}</div>
                        <p class="card-desc">${item.description}</p>
                        <div class="card-tags">
                            <span class="tag">Research</span>
                            <span class="tag">${item.role}</span>
                        </div>
                    </div>
                </a>
            `).join('');
        }
    } else {
        hideSection('#research');
    }

    // Projects
    if (shouldShowSection('projects') && CONFIG.projects) {
        const projectsGrid = document.querySelector('#projects .grid-container');
        if (projectsGrid) {
            projectsGrid.innerHTML = CONFIG.projects.map(project => `
                <a href="${project.url}" class="card-link" target="_blank">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title-group">
                                ${project.logo ? `<img src="${project.logo}" class="card-logo" alt="${project.name}">` : ''}
                                <h3 class="card-title">${project.name}</h3>
                            </div>
                            <span class="card-year">Project</span>
                        </div>
                        <p class="card-desc">${project.description}</p>
                        <div class="card-tags">
                            ${(project.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </a>
            `).join('');
        }
    } else {
        hideSection('#projects');
    }

    // Experience
    if (shouldShowSection('experience') && CONFIG.experience) {
        const expList = document.querySelector('#experience ul');
        if (expList) {
            expList.innerHTML = CONFIG.experience.map(exp => `
                <li class="timeline-item">
                    <div class="timeline-role">${exp.role}</div>
                    <span class="timeline-company">${exp.company} | ${exp.year}</span>
                    <p class="timeline-desc">${exp.description}</p>
                </li>
            `).join('');
        }
    } else {
        hideSection('#experience');
    }

    // Education
    if (shouldShowSection('education') && CONFIG.education) {
        const eduList = document.querySelector('#education ul');
        if (eduList) {
            eduList.innerHTML = CONFIG.education.map(edu => `
                <li class="timeline-item">
                    <div class="timeline-role">${edu.degree}</div>
                    <span class="timeline-company">${edu.institution} | ${edu.year}</span>
                    <p class="timeline-desc">${edu.description}</p>
                </li>
            `).join('');
        }
    } else {
        hideSection('#education');
    }

    // Certifications
    if (shouldShowSection('certifications') && CONFIG.certifications) {
        const certList = document.querySelector('#certifications ul');
        if (certList) {
            certList.innerHTML = CONFIG.certifications.map(cert => `
                <li>
                    <a href="${cert.url}" target="_blank" class="cert-link" data-cert="${cert.previewImage}">
                        ${cert.name} ↗
                    </a>
                </li>
            `).join('');
        }
    } else {
        hideSection('#certifications');
    }

    // GitHub
    if (shouldShowSection('github') && CONFIG.github) {
        const githubChart = document.querySelector('.calendar img');
        if (githubChart) {
            githubChart.src = `https://ghchart.rshah.org/${CONFIG.github.chartColor}/${CONFIG.github.username}`;
        }
    } else {
        hideSection('#github');
    }
};

const createLinkPreview = () => {
    const preview = document.createElement('div');
    preview.style.position = 'fixed';
    preview.style.zIndex = '9999';
    preview.style.display = 'none';
    preview.style.pointerEvents = 'none';
    preview.style.background = '#0d1117';
    preview.style.padding = '8px';
    preview.style.border = '1px solid #30363d';
    preview.style.borderRadius = '6px';
    preview.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';

    document.body.appendChild(preview);

    // Dynamic listener assignment since elements are created in populatePage
    document.body.addEventListener('mouseover', (e) => {
        if (e.target.closest('.cert-link')) {
            const link = e.target.closest('.cert-link');
            const certImage = link.getAttribute('data-cert');
            if (!certImage) return;

            const imagePath = `public/certs/${certImage}`;
            preview.innerHTML = `<img src="${imagePath}" style="max-width:280px; display:block; border-radius:4px;" alt="Preview" onerror="this.style.display='none'">`;
            preview.style.display = 'block';
            updatePreviewPosition(e, preview);
        }
    });

    document.body.addEventListener('mousemove', (e) => {
        if (preview.style.display === 'block') {
            updatePreviewPosition(e, preview);
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        if (e.target.closest('.cert-link')) {
            preview.style.display = 'none';
        }
    });
};

const updatePreviewPosition = (event, preview) => {
    const offset = 20;
    let x = event.clientX + offset;
    let y = event.clientY + offset;

    // Bounds checking
    const rect = preview.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) x = event.clientX - rect.width - offset;
    if (y + rect.height > window.innerHeight) y = event.clientY - rect.height - offset;

    preview.style.left = x + 'px';
    preview.style.top = y + 'px';
};

const setupContactForm = () => {
    const contactBtn = document.getElementById('contactBtn');
    const closeBtn = document.getElementById('closeBtn');
    const contactForm = document.getElementById('contactForm');

    if (contactBtn && contactForm) {
        contactBtn.addEventListener('click', () => {
            contactForm.classList.remove('hidden'); // Force remove hidden
            contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const emailInput = contactForm.querySelector('input[name="email"]');
            if (emailInput) emailInput.focus();
        });
    }

    if (closeBtn && contactForm) {
        closeBtn.addEventListener('click', () => {
            contactForm.classList.add('hidden');
        });
    }

    // Simple form submission demo
    const form = document.querySelector('form[name="contact"]');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.submit-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = 'Message Sent';
                setTimeout(() => {
                    contactForm.classList.add('hidden');
                    btn.textContent = originalText;
                    btn.disabled = false;
                    form.reset();
                }, 1500);
            }, 1000);
        });
    }
};

(function init() {
    populatePage();
    createLinkPreview();
    setupContactForm();
})();

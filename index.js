/*
 * Made with <3 by Ahmad Y. Khattak
 * GitHub: https://github.com/ahmadkhattak1
 * LinkedIn: https://www.linkedin.com/in/AhmadYKhattak/
 * X: https://x.com/AhmadYKhattak
 */

// Verify template attribution
(function () {
    if (!CONFIG._meta || !CONFIG._meta.author || CONFIG._meta.author !== "Ahmad Y. Khattak") {
        console.warn("Template attribution modified. Please maintain original attribution.");
    }
    console.log("%c" + (CONFIG._meta?.license || "Made with <3 by Ahmad Y. Khattak"),
        "color: #DC143C; font-weight: bold; font-size: 14px;");
    console.log("%cGitHub: " + (CONFIG._meta?.github || "https://github.com/ahmadkhattak1"),
        "color: #666; font-size: 12px;");
})();

// Helper function to check if a section should be shown
const shouldShowSection = (sectionName) => {
    return CONFIG.showSection && CONFIG.showSection[sectionName] !== false;
};

// Helper function to hide a section
const hideSection = (selector) => {
    const section = document.querySelector(selector);
    if (section) section.style.display = 'none';
};

// Populate page with data from config.js
const populatePage = () => {
    // Personal Information (Required)
    document.getElementById('name').textContent = CONFIG.personal.name;
    document.getElementById('title').textContent = CONFIG.personal.title;
    const profileImg = document.querySelector('#profile img');
    profileImg.src = CONFIG.personal.profileImage;
    profileImg.alt = CONFIG.personal.profileImageAlt;

    // Social Links (Required)
    const socialLinks = document.querySelector('.social-links');
    socialLinks.innerHTML = `
        <a href="mailto:${CONFIG.social.email}">Email</a>
        <a href="${CONFIG.social.github}" target="_blank">GitHub</a>
        <a href="${CONFIG.social.linkedin}" target="_blank">LinkedIn</a>
        <a href="${CONFIG.social.twitter}" target="_blank">X</a>
    `;

    // About Me (Optional)
    if (shouldShowSection('about') && CONFIG.about) {
        document.querySelector('section:nth-of-type(1) p').textContent = CONFIG.about;
    } else {
        hideSection('section:nth-of-type(1)');
    }

    // Skills (Optional)
    if (shouldShowSection('skills') && CONFIG.skills) {
        const skillsList = document.querySelector('section:nth-of-type(2) ul');
        skillsList.innerHTML = CONFIG.skills.map(skill => {
            if (typeof skill === 'string') {
                return `<li>${skill}</li>`;
            } else {
                const subItems = skill.subItems.map(item => `<li>${item}</li>`).join('');
                return `<li>${skill.text} <ul>${subItems}</ul></li>`;
            }
        }).join('');
    } else {
        hideSection('section:nth-of-type(2)');
    }

    // Projects (Optional)
    if (shouldShowSection('projects') && CONFIG.projects) {
        const projectsList = document.querySelector('section:nth-of-type(3) ul');
        projectsList.innerHTML = CONFIG.projects.map(project => {
            return `<li><a href="${project.url}" target="_blank">${project.name}</a>${project.description ? ' - ' + project.description : ''}</li>`;
        }).join('');
    } else {
        hideSection('section:nth-of-type(3)');
    }

    // Certifications (Optional)
    if (shouldShowSection('certifications') && CONFIG.certifications) {
        const certsList = document.querySelector('section:nth-of-type(4) ul');
        certsList.innerHTML = CONFIG.certifications.map(cert => {
            return `<li><a href="${cert.url}" target="_blank" class="cert-link" data-cert="${cert.previewImage}">${cert.name}</a></li>`;
        }).join('');
    } else {
        hideSection('section:nth-of-type(4)');
    }

    // Education (Optional)
    if (shouldShowSection('education') && CONFIG.education) {
        const eduList = document.querySelector('section:nth-of-type(5) ul');
        eduList.innerHTML = CONFIG.education.map(edu => {
            const institutionText = edu.institutionUrl
                ? `<a href="${edu.institutionUrl}" target="_blank">${edu.institution}</a>`
                : edu.institution;
            return `<li>${edu.degree} - ${institutionText} (${edu.year}) - ${edu.description}</li>`;
        }).join('');
    } else {
        hideSection('section:nth-of-type(5)');
    }

    // Experience (Optional)
    if (shouldShowSection('experience') && CONFIG.experience) {
        const expList = document.querySelector('section:nth-of-type(6) ul');
        expList.innerHTML = CONFIG.experience.map(exp => {
            const companyText = exp.companyUrl
                ? `<a href="${exp.companyUrl}" target="_blank">${exp.company}</a>`
                : exp.company;
            return `<li>${exp.role} - ${companyText} (${exp.year}) - ${exp.description}</li>`;
        }).join('');
    } else {
        hideSection('section:nth-of-type(6)');
    }

    // Custom Sections (Optional)
    const customSectionsContainer = document.getElementById('customSections');
    if (shouldShowSection('customSections') && CONFIG.customSections && CONFIG.customSections.length > 0) {
        customSectionsContainer.innerHTML = CONFIG.customSections.map(section => {
            return `
                <section>
                    <h2>${section.heading}</h2>
                    <p>${section.content}</p>
                </section>
            `;
        }).join('');
    }

    // GitHub Activity Chart (Optional)
    if (shouldShowSection('github') && CONFIG.github) {
        const githubChart = document.querySelector('.calendar img');
        githubChart.src = `https://ghchart.rshah.org/${CONFIG.github.chartColor}/${CONFIG.github.username}`;
        githubChart.alt = `${CONFIG.personal.name}'s GitHub Contributions`;
    } else {
        hideSection('section:nth-of-type(7)');
    }

    // Add template attribution to footer
    const footer = document.querySelector('footer');
    if (footer && CONFIG._meta) {
        const attribution = document.createElement('div');
        attribution.style.fontSize = '0.7rem';
        attribution.style.color = '#ccc';
        attribution.style.marginTop = '5px';
        attribution.innerHTML = `template by <a href="${CONFIG._meta.github}" target="_blank" class="template-attribution">${CONFIG._meta.author}</a>`;
        footer.appendChild(attribution);
    }
};

// Certification Link Preview
const createLinkPreview = () => {
    const preview = document.createElement('div');
    preview.className = 'link-preview';
    document.body.appendChild(preview);

    const certLinks = document.querySelectorAll('.cert-link');

    certLinks.forEach(link => {
        const certImage = link.getAttribute('data-cert');

        link.addEventListener('mouseenter', (e) => {
            const imagePath = `public/certs/${certImage}`;
            preview.innerHTML = `<img src="${imagePath}" alt="Certificate Preview">`;
            preview.classList.add('visible');
            updatePreviewPosition(e, preview);
        });

        link.addEventListener('mousemove', (e) => {
            updatePreviewPosition(e, preview);
        });

        link.addEventListener('mouseleave', () => {
            preview.classList.remove('visible');
        });
    });
};

const updatePreviewPosition = (event, preview) => {
    const offset = 15;
    let x = event.clientX + offset;
    let y = event.clientY + offset;

    // Prevent preview from going off-screen (right)
    if (x + preview.offsetWidth > window.innerWidth) {
        x = event.clientX - preview.offsetWidth - offset;
    }

    // Prevent preview from going off-screen (bottom)
    if (y + preview.offsetHeight > window.innerHeight) {
        y = event.clientY - preview.offsetHeight - offset;
    }

    preview.style.left = x + 'px';
    preview.style.top = y + 'px';
};

// Profile Picture Lightbox
const setupProfileLightbox = () => {
    const profileImg = document.querySelector('#profile img');
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content" onclick="event.stopPropagation()">
            <button class="lightbox-close">×</button>
            <img src="${profileImg.src}" alt="${profileImg.alt}">
        </div>
    `;
    document.body.appendChild(lightbox);

    profileImg.addEventListener('click', () => {
        lightbox.classList.add('active');
    });

    lightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        lightbox.classList.remove('active');
    });
};

// Contact Form Toggle and Submission
const setupContactForm = () => {
    const contactBtn = document.getElementById('contactBtn');
    const closeBtn = document.getElementById('closeBtn');
    const contactForm = document.getElementById('contactForm');

    contactBtn.addEventListener('click', () => {
        contactForm.classList.toggle('hidden');
        if (!contactForm.classList.contains('hidden')) {
            document.getElementById('email').focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        contactForm.classList.add('hidden');
    });

    // Form Submission with Netlify Forms
    const form = document.querySelector('.contact-form form');
    const submitBtn = document.querySelector('.submit-btn');
    let originalText = 'send >';

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        originalText = submitBtn.textContent;
        submitBtn.textContent = 'sending...';
        submitBtn.disabled = true;

        // Encode form data
        const formData = new URLSearchParams(new FormData(form)).toString();

        // Submit to Netlify
        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        }).then(() => {
            submitBtn.textContent = 'sent! ✓';
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                form.reset();
                contactForm.classList.add('hidden');
            }, 2000);
        }).catch(error => {
            console.error('Error:', error);
            submitBtn.textContent = 'error';
            submitBtn.disabled = false;
        });
    });
};

// Initialize everything when page loads
(function initializeTemplate() {
    // Verify template integrity
    const _t = CONFIG._meta || {};
    const _a = _t.author ? _t.author.split(' ').map(s => s.charCodeAt(0)).reduce((a, b) => a + b, 0) : 0;
    const _e = 393; // Expected checksum for "Ahmad Y. Khattak"

    if (_a !== _e) {
        console.warn('%cTemplate attribution has been modified. Please keep original attribution intact.',
            'color: #DC143C; font-weight: bold;');
    }

    populatePage();
    createLinkPreview();
    setupProfileLightbox();
    setupContactForm();
})();

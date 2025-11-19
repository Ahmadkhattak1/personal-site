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

// Generate and Download CV as PDF
const generateCV = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const themeRed = [220, 20, 60];

    // Two-column layout
    const leftColX = margin;
    const leftColWidth = 85;
    const rightColX = leftColX + leftColWidth + 10;
    const rightColWidth = pageWidth - rightColX - margin;

    let currentY = margin;
    let currentX = leftColX;
    let currentColWidth = leftColWidth;
    let headerEndY = 0;
    const startRightCol = () => {
        currentX = rightColX;
        currentColWidth = rightColWidth;
        currentY = headerEndY; // Start at same position as left column
    };

    // ===== HEADER (Full Width) =====
    doc.setFontSize(40);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(CONFIG.personal.name.toUpperCase(), margin, currentY);
    currentY += 12.65;

    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(CONFIG.personal.title, margin, currentY);
    currentY += 10.12;

    // Contact info - properly formatted
    doc.setFontSize(12);
    doc.setTextColor(...themeRed);
    doc.setFont(undefined, 'bold');
    doc.text('AhmadYaseen.com', margin, currentY);
    currentY += 6.325;

    // Contact links - horizontal layout with wrapping
    doc.setFontSize(10);
    const contactItems = [
        { label: 'Email:', value: CONFIG.social.email },
        { label: 'GitHub:', value: 'github.com/ahmadkhattak1' },
        { label: 'LinkedIn:', value: 'linkedin.com/in/AhmadYKhattak' },
        { label: 'X:', value: '@AhmadYKhattak' }
    ];

    const maxLineWidth = pageWidth - (2 * margin);
    let contactX = margin;
    const lineHeight = 5;

    contactItems.forEach((item, idx) => {
        // Calculate width needed for this item
        doc.setFont(undefined, 'bold');
        const labelWidth = doc.getTextWidth(item.label);
        doc.setFont(undefined, 'normal');
        const valueWidth = doc.getTextWidth(item.value);
        const separatorWidth = idx < contactItems.length - 1 ? doc.getTextWidth('  |  ') : 0;
        const itemWidth = labelWidth + 1 + valueWidth + separatorWidth;

        // Check if we need to wrap to next line
        if (contactX + itemWidth > pageWidth - margin && contactX > margin) {
            currentY += lineHeight;
            contactX = margin;
        }

        // Draw label in theme color
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...themeRed);
        doc.text(item.label, contactX, currentY);
        contactX += labelWidth + 1;

        // Draw value in gray
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(item.value, contactX, currentY);
        contactX += valueWidth;

        // Add separator if not last item
        if (idx < contactItems.length - 1) {
            doc.text('  |  ', contactX, currentY);
            contactX += separatorWidth;
        }
    });
    currentY += 10.12;

    // Line separator
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10.12;

    // Save header end position for right column alignment
    headerEndY = currentY;

    // Helper function to add section header
    const addSectionHeader = (title) => {
        // Check if we need to move to right column
        if (currentY > pageHeight - 40 && currentX === leftColX) {
            startRightCol();
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...themeRed);
        doc.text(title, currentX, currentY);
        currentY += 8.855;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
    };

    // ABOUT Section
    if (shouldShowSection('about') && CONFIG.about) {
        addSectionHeader('ABOUT');
        const aboutLines = doc.splitTextToSize(CONFIG.about, currentColWidth);
        const lineHeight = 5.5; // Proper line spacing within text
        aboutLines.forEach((line, idx) => {
            doc.text(line, currentX, currentY);
            currentY += lineHeight;
        });
        currentY += 10.12 - lineHeight; // Adjust for section spacing
    }

    // SKILLS Section
    if (shouldShowSection('skills') && CONFIG.skills) {
        if (currentY > pageHeight - 40 && currentX === leftColX) startRightCol();

        addSectionHeader('SKILLS');
        const lineHeight = 5;
        CONFIG.skills.forEach((skill, idx) => {
            if (typeof skill === 'string') {
                const lines = doc.splitTextToSize(`• ${skill}`, currentColWidth);
                lines.forEach(line => {
                    doc.text(line, currentX, currentY);
                    currentY += lineHeight;
                });
                currentY += 1.5;
            } else {
                doc.setFont(undefined, 'bold');
                doc.text(`${skill.text}`, currentX, currentY);
                currentY += 5.5;
                doc.setFont(undefined, 'normal');
                skill.subItems.forEach(item => {
                    const lines = doc.splitTextToSize(`  • ${item}`, currentColWidth - 4);
                    lines.forEach(line => {
                        doc.text(line, currentX + 4, currentY);
                        currentY += lineHeight;
                    });
                });
                currentY += 2;
            }
        });
        currentY += 5;
    }

    // EXPERIENCE Section
    if (shouldShowSection('experience') && CONFIG.experience) {
        if (currentY > pageHeight - 40 && currentX === leftColX) startRightCol();

        addSectionHeader('EXPERIENCE');
        const lineHeight = 5.5;
        CONFIG.experience.forEach((exp, idx) => {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            const roleLines = doc.splitTextToSize(exp.role, currentColWidth);
            roleLines.forEach(line => {
                doc.text(line, currentX, currentY);
                currentY += lineHeight;
            });
            currentY += 1;

            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(80, 80, 80);
            const companyLines = doc.splitTextToSize(`${exp.company} | ${exp.year}`, currentColWidth);
            companyLines.forEach(line => {
                doc.text(line, currentX, currentY);
                currentY += lineHeight;
            });
            currentY += 1;

            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            const descLines = doc.splitTextToSize(exp.description, currentColWidth);
            descLines.forEach(line => {
                doc.text(line, currentX, currentY);
                currentY += lineHeight;
            });
            currentY += (idx < CONFIG.experience.length - 1 ? 4 : 6);
        });
    }

    // PROJECTS Section
    if (shouldShowSection('projects') && CONFIG.projects) {
        if (currentY > pageHeight - 40 && currentX === leftColX) startRightCol();

        addSectionHeader('PROJECTS');
        const lineHeight = 5.5;
        CONFIG.projects.forEach((project, idx) => {
            // Project name and URL on same line
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(project.name, currentX, currentY);

            const nameWidth = doc.getTextWidth(project.name);
            doc.setFontSize(10);
            doc.setTextColor(...themeRed);
            doc.text(' ↗', currentX + nameWidth, currentY);
            currentY += 5;

            doc.setFontSize(10);
            doc.text(project.url, currentX, currentY);
            currentY += 6;

            if (project.description) {
                doc.setFontSize(11);
                doc.setFont(undefined, 'normal');
                doc.setTextColor(0, 0, 0);
                const descLines = doc.splitTextToSize(project.description, currentColWidth);
                descLines.forEach(line => {
                    doc.text(line, currentX, currentY);
                    currentY += lineHeight;
                });
            }

            doc.setTextColor(0, 0, 0);
            currentY += (idx < CONFIG.projects.length - 1 ? 4 : 6);
        });
    }

    // EDUCATION Section
    if (shouldShowSection('education') && CONFIG.education) {
        if (currentY > pageHeight - 40 && currentX === leftColX) startRightCol();

        addSectionHeader('EDUCATION');
        const lineHeight = 5.5;
        CONFIG.education.forEach((edu, idx) => {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            const degreeLines = doc.splitTextToSize(edu.degree, currentColWidth);
            degreeLines.forEach(line => {
                doc.text(line, currentX, currentY);
                currentY += lineHeight;
            });
            currentY += 1;

            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(80, 80, 80);
            const instLines = doc.splitTextToSize(`${edu.institution} | ${edu.year}`, currentColWidth);
            instLines.forEach(line => {
                doc.text(line, currentX, currentY);
                currentY += lineHeight;
            });
            currentY += 1;

            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            const descLines = doc.splitTextToSize(edu.description, currentColWidth);
            descLines.forEach(line => {
                doc.text(line, currentX, currentY);
                currentY += lineHeight;
            });
            currentY += (idx < CONFIG.education.length - 1 ? 4 : 6);
        });
    }

    // CERTIFICATIONS Section
    if (shouldShowSection('certifications') && CONFIG.certifications) {
        if (currentY > pageHeight - 40 && currentX === leftColX) startRightCol();

        addSectionHeader('CERTIFICATIONS');
        doc.setFontSize(11);
        const lineHeight = 5.5;
        CONFIG.certifications.forEach((cert, idx) => {
            const certLines = doc.splitTextToSize(`• ${cert.name}`, currentColWidth);
            certLines.forEach(line => {
                doc.text(line, currentX, currentY);
                currentY += lineHeight;
            });
        });
    }

    // Save
    doc.save(`${CONFIG.personal.name.replace(/\s+/g, '_')}_CV.pdf`);
};

// Setup Download CV Button
const setupDownloadCV = () => {
    const downloadBtn = document.getElementById('downloadCVBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', generateCV);
    }
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
    setupDownloadCV();
})();

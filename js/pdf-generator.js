/*
 * PDF Resume Generator
 * Generates a clean, professional PDF resume from JOURNEY_DATA
 * Using jsPDF library
 */

function generateResumePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const data = JOURNEY_DATA;
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // Colors
    const primaryColor = [10, 10, 10];
    const accentColor = [249, 115, 22];
    const textColor = [51, 51, 51];
    const mutedColor = [128, 128, 128];

    // Helper function to check for page break
    function checkPageBreak(requiredSpace) {
        if (y + requiredSpace > pageHeight - margin) {
            doc.addPage();
            y = margin;
            return true;
        }
        return false;
    }

    // Helper to add section title
    function addSectionTitle(title) {
        checkPageBreak(20);
        y += 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentColor);
        doc.text(title.toUpperCase(), margin, y);
        y += 2;
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 40, y);
        y += 8;
    }

    // Helper to add text block
    function addText(text, fontSize = 10, bold = false, color = textColor) {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(...color);

        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.4;

        lines.forEach(line => {
            checkPageBreak(lineHeight + 2);
            doc.text(line, margin, y);
            y += lineHeight + 1;
        });
    }

    // ============================================
    // HEADER
    // ============================================
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(data.personal.name, margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...accentColor);
    doc.text(data.personal.title, margin, y);
    y += 8;

    // Contact info
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    const contactLine = `${data.personal.email}  |  ${data.personal.location}  |  github.com/${data.personal.githubUsername}`;
    doc.text(contactLine, margin, y);
    y += 4;

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);

    // ============================================
    // SUMMARY
    // ============================================
    addSectionTitle('Summary');
    addText(data.about.short);

    // ============================================
    // EXPERIENCE
    // ============================================
    addSectionTitle('Experience');

    data.experience.forEach(exp => {
        checkPageBreak(25);

        // Role and date
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(exp.role, margin, y);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...mutedColor);
        const dateWidth = doc.getTextWidth(exp.date);
        doc.text(exp.date, pageWidth - margin - dateWidth, y);
        y += 5;

        // Company
        doc.setFontSize(10);
        doc.setTextColor(...accentColor);
        doc.text(exp.company, margin, y);
        y += 5;

        // Description
        addText(exp.description, 9);
        y += 3;
    });

    // ============================================
    // EDUCATION
    // ============================================
    addSectionTitle('Education');

    data.education.forEach(edu => {
        checkPageBreak(20);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(edu.degree, margin, y);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...mutedColor);
        const dateWidth = doc.getTextWidth(edu.date);
        doc.text(edu.date, pageWidth - margin - dateWidth, y);
        y += 5;

        doc.setFontSize(10);
        doc.setTextColor(...accentColor);
        doc.text(edu.institution, margin, y);
        y += 5;

        if (edu.description) {
            addText(edu.description, 9);
        }
        y += 3;
    });

    // ============================================
    // SKILLS
    // ============================================
    addSectionTitle('Skills');

    const skillCategories = {
        frontend: 'Frontend',
        backend: 'Backend',
        ai: 'AI / ML',
        tools: 'Tools'
    };

    Object.entries(data.skills).forEach(([key, skills]) => {
        checkPageBreak(10);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(`${skillCategories[key] || key}: `, margin, y);

        const labelWidth = doc.getTextWidth(`${skillCategories[key] || key}: `);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        const skillText = skills.join(', ');
        const skillLines = doc.splitTextToSize(skillText, contentWidth - labelWidth);
        doc.text(skillLines[0], margin + labelWidth, y);

        if (skillLines.length > 1) {
            y += 5;
            for (let i = 1; i < skillLines.length; i++) {
                doc.text(skillLines[i], margin, y);
                y += 5;
            }
        } else {
            y += 5;
        }
    });

    // ============================================
    // PROJECTS
    // ============================================
    addSectionTitle('Projects');

    // Featured projects
    data.featuredProjects.slice(0, 3).forEach(project => {
        checkPageBreak(20);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(project.name, margin, y);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...mutedColor);
        const urlWidth = doc.getTextWidth(project.url.replace('https://', ''));
        doc.textWithLink(project.url.replace('https://', ''), pageWidth - margin - urlWidth, y, { url: project.url });
        y += 5;

        addText(project.tagline, 9);

        // Tech stack
        doc.setFontSize(8);
        doc.setTextColor(...accentColor);
        doc.text(project.tech.join(' · '), margin, y);
        y += 6;
    });

    // ============================================
    // CERTIFICATIONS
    // ============================================
    addSectionTitle('Certifications');

    data.certifications.forEach(cert => {
        checkPageBreak(8);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...primaryColor);
        doc.text(`• ${cert.name}`, margin, y);

        doc.setFontSize(9);
        doc.setTextColor(...mutedColor);
        doc.text(` - ${cert.issuer}`, margin + doc.getTextWidth(`• ${cert.name}`), y);
        y += 5;
    });

    // ============================================
    // FOOTER
    // ============================================
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(`Generated from ahmadyaseen.com/journey`, margin, footerY);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), pageWidth - margin - 30, footerY);

    // ============================================
    // SAVE PDF
    // ============================================
    doc.save('Ahmad_Yaseen_Khattak_Resume.pdf');
}

// Make function globally available
window.generateResumePDF = generateResumePDF;

/*
 * PDF CV Generator
 * Generates a readable, print-first CV from JOURNEY_DATA using jsPDF.
 */

async function generateResumePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const data = JOURNEY_DATA;
    const page = {
        width: 210,
        height: 297,
        marginX: 16,
        marginTop: 17,
        marginBottom: 16
    };
    const contentWidth = page.width - (page.marginX * 2);
    const sectionContentX = page.marginX + 8.5;
    const sectionContentWidth = page.width - page.marginX - sectionContentX;
    const nestedContentX = sectionContentX + 4.6;
    const nestedContentWidth = page.width - page.marginX - nestedContentX;
    const deepNestedContentX = nestedContentX + 4;
    const deepNestedContentWidth = page.width - page.marginX - deepNestedContentX;
    const mmPerPt = 0.352778;
    const imageCache = new Map();
    const colors = {
        accent: [249, 115, 22],
        heading: [20, 20, 20],
        text: [48, 48, 48],
        muted: [110, 110, 110],
        rule: [214, 214, 214]
    };
    const fonts = {
        title: 'helvetica',
        heading: 'helvetica',
        body: 'times'
    };
    const titleFontStyle = {
        style: 'bold',
        size: 31,
        lineFactor: 1.04
    };

    const siteUrl = (data.meta && data.meta.siteUrl) || 'https://ahmadyaseen.com';
    const profileParagraphs = [
        ...((data.about && data.about.full) || []),
        'My work spans product thinking, frontend, backend, deployment, and practical AI integrations.'
    ];
    const cvProjects = [
        {
            emoji: '\uD83E\uDD9E',
            title: 'ClawPilot',
            summary: 'Managed Openclaw Hosting',
            url: 'https://clawpilot-web-landing.vercel.app/'
        },
        {
            emoji: '\uD83D\uDCCB',
            title: 'LiveBoard',
            summary: 'Collaborative freeform whiteboard',
            url: 'https://liveboard-zeta.vercel.app/'
        },
        {
            emoji: '\uD83C\uDFAF',
            title: 'Stumbnail',
            summary: 'Thumbnail Generator',
            url: 'https://stumbnail.com'
        },
        {
            emoji: '\uD83D\uDCFA',
            title: 'Screenchat',
            summary: 'Chat with any page. (Extension)',
            url: 'https://github.com/Ahmadkhattak1/ScreenChat'
        },
        {
            emoji: '\uD83D\uDDC2\uFE0F',
            title: 'Scrapify',
            summary: 'Google Business Profile Data Scraper (Extension)',
            url: 'https://github.com/Ahmadkhattak1/scrapify-extension'
        }
    ];
    const contactItems = [
        {
            key: 'email',
            iconPath: 'public/resume/email.svg',
            label: data.personal.email,
            url: `mailto:${data.personal.email}`
        },
        {
            key: 'github',
            iconPath: 'public/resume/github.svg',
            label: data.personal.githubUsername,
            url: data.personal.github
        },
        {
            key: 'linkedin',
            iconPath: 'public/resume/linkedin.svg',
            label: getLinkedInHandle(data.personal.linkedin),
            url: data.personal.linkedin
        },
        {
            key: 'site',
            iconPath: 'public/resume/personal-site.svg',
            label: siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
            url: siteUrl
        }
    ];

    let y = page.marginTop;
    let titleWordmark = null;

    doc.setProperties({
        title: `${data.personal.name} CV`,
        subject: 'Curriculum Vitae',
        author: data.personal.name,
        creator: 'ahmadyaseen.com'
    });

    const customTitleFont = await loadCustomTitleFont();
    if (customTitleFont) {
        fonts.title = customTitleFont.name || fonts.title;
        titleFontStyle.style = customTitleFont.style || titleFontStyle.style;
        titleWordmark = await createTitleWordmark(data.personal.name, customTitleFont.cssFamily);
    }

    const contactIcons = Object.fromEntries(
        await Promise.all(contactItems.map(async item => [item.key, await loadImageAsset(item.iconPath, 120)]))
    );

    const projectIcons = new Map(cvProjects.map(project => [project.title, createEmojiBadge(project.emoji, 120)]));

    await drawHeader();
    drawSectionTitle('Professional Profile');
    drawParagraphs(profileParagraphs, 10.1, 1.52, 3.8);

    drawSectionTitle('Experience');
    data.experience.forEach((item, index) => drawExperienceItem(item, index, data.experience.length));

    drawSectionTitle('Projects');
    drawProjectList(cvProjects);

    drawSectionTitle('Research');
    drawResearchSection(data.research || []);

    drawSectionTitle('Education');
    data.education.forEach(drawEducationItem);

    drawSectionTitle('Technical Skills');
    drawSkillsSection();

    drawSectionTitle('Certifications');
    data.certifications.forEach(drawCertificationItem);

    drawFooter();
    doc.save('Ahmad_Yaseen_CV.pdf');

    function getLineHeight(fontSize, factor = 1.3) {
        return fontSize * mmPerPt * factor;
    }

    function setTextStyle(fontSize, fontStyle = 'normal', color = colors.text, fontName = fonts.body) {
        doc.setFont(fontName, fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
    }

    function splitText(text, width, fontSize, fontStyle = 'normal', fontName = fonts.body) {
        setTextStyle(fontSize, fontStyle, colors.text, fontName);
        return doc.splitTextToSize(String(text), width);
    }

    function measureTextWidth(text, fontSize, fontStyle = 'normal', fontName = fonts.body) {
        setTextStyle(fontSize, fontStyle, colors.text, fontName);
        return doc.getTextWidth(String(text));
    }

    function measureWrappedHeight(text, width, fontSize, fontStyle = 'normal', lineFactor = 1.3, fontName = fonts.body) {
        const lines = splitText(text, width, fontSize, fontStyle, fontName);
        return lines.length * getLineHeight(fontSize, lineFactor);
    }

    function ensureSpace(requiredHeight) {
        if (y + requiredHeight <= page.height - page.marginBottom) {
            return;
        }

        doc.addPage();
        y = page.marginTop;
    }

    function drawWrappedText(text, x, startY, width, options = {}) {
        const {
            fontSize = 9.5,
            fontStyle = 'normal',
            color = colors.text,
            lineFactor = 1.3,
            fontName = fonts.body
        } = options;
        const lines = splitText(text, width, fontSize, fontStyle, fontName);
        const lineHeight = getLineHeight(fontSize, lineFactor);
        let cursorY = startY;

        setTextStyle(fontSize, fontStyle, color, fontName);
        lines.forEach(line => {
            doc.text(line, x, cursorY);
            cursorY += lineHeight;
        });

        return cursorY;
    }

    async function drawHeader() {
        const subhead = String(data.personal.title || '').toUpperCase();
        const titleHeight = titleWordmark ? titleWordmark.heightMm : getLineHeight(titleFontStyle.size, titleFontStyle.lineFactor);
        const contactHeightEstimate = getLineHeight(8.7, 1.42) * 2;
        const headerHeight =
            titleHeight +
            getLineHeight(9.2, 1.26) +
            contactHeightEstimate +
            19;

        ensureSpace(headerHeight);

        if (titleWordmark) {
            doc.addImage(titleWordmark.dataUrl, 'PNG', page.marginX, y - 0.8, titleWordmark.widthMm, titleWordmark.heightMm);
            y += titleWordmark.heightMm + 3.4;
        } else {
            setTextStyle(titleFontStyle.size, titleFontStyle.style, colors.heading, fonts.title);
            doc.text(data.personal.name, page.marginX, y);
            y += getLineHeight(titleFontStyle.size, titleFontStyle.lineFactor) + 2.6;
        }

        const headerTextX = titleWordmark ? page.marginX + titleWordmark.textStartMm : page.marginX;
        setTextStyle(9.2, 'bold', colors.muted, fonts.heading);
        doc.text(subhead, headerTextX, y);
        y += getLineHeight(9.2, 1.26) + 1.9;

        y = drawInlineContacts(contactItems, y, {
            startX: headerTextX + 1.5,
            iconSize: 4,
            gap: 6.1,
            fontSize: 8.7
        });
        y += 4.6;

        doc.setDrawColor(...colors.rule);
        doc.setLineWidth(0.35);
        doc.line(page.marginX, y, page.width - page.marginX, y);
        doc.setDrawColor(...colors.accent);
        doc.setLineWidth(0.7);
        doc.line(page.marginX, y, page.marginX + 28, y);
        y += 8.6;
    }

    function drawInlineContacts(items, startY, options = {}) {
        const {
            startX = page.marginX,
            iconSize = 3.2,
            gap = 7,
            fontSize = 9
        } = options;
        let cursorX = startX;
        let baselineY = startY;

        items.forEach(item => {
            setTextStyle(fontSize, 'normal', colors.muted, fonts.heading);
            const labelWidth = doc.getTextWidth(item.label);
            const itemWidth = iconSize + 2 + labelWidth;

            if (cursorX + itemWidth > page.width - page.marginX) {
                baselineY += getLineHeight(fontSize, 1.42);
                cursorX = startX;
            }

            if (contactIcons[item.key]) {
                doc.addImage(contactIcons[item.key], 'PNG', cursorX, baselineY - iconSize + 0.35, iconSize, iconSize);
            }

            doc.text(item.label, cursorX + iconSize + 1.7, baselineY);
            doc.link(cursorX, baselineY - 3.2, itemWidth, 4.8, { url: item.url });
            cursorX += itemWidth + gap;
        });

        return baselineY + getLineHeight(9, 1.34);
    }

    function drawSectionTitle(title) {
        ensureSpace(36);

        if (y > page.marginTop + 1) {
            y += 8.5;
        }

        setTextStyle(13, 'bold', colors.heading, fonts.heading);
        doc.text(title, page.marginX, y);

        const width = doc.getTextWidth(title);
        doc.setDrawColor(...colors.accent);
        doc.setLineWidth(0.5);
        doc.line(page.marginX, y + 1.9, page.marginX + 18, y + 1.9);
        doc.setDrawColor(...colors.rule);
        doc.setLineWidth(0.3);
        doc.line(page.marginX + width + 4, y - 0.8, page.width - page.marginX, y - 0.8);
        y += 12;
    }

    function drawParagraphs(paragraphs, fontSize, lineFactor, paragraphGap) {
        paragraphs.forEach(paragraph => {
            const paragraphHeight = measureWrappedHeight(paragraph, sectionContentWidth, fontSize, 'normal', lineFactor);
            ensureSpace(paragraphHeight + paragraphGap);
            y = drawWrappedText(paragraph, sectionContentX, y, sectionContentWidth, {
                fontSize,
                color: colors.text,
                lineFactor
            });
            y += paragraphGap;
        });
    }

    function drawExperienceItem(item, index, total) {
        const titleFont = 11.6;
        const companyFont = 9.8;
        const bulletFont = 9.5;
        const roleX = sectionContentX;
        const companyX = nestedContentX;
        const bulletX = deepNestedContentX;
        const bulletWidth = page.width - page.marginX - bulletX;
        const dateWidth = measureTextWidth(item.date, 9, 'normal', fonts.heading);
        const titleWidth = sectionContentWidth - dateWidth - 10;
        const titleLines = splitText(item.role, titleWidth, titleFont, 'bold', fonts.heading);
        const bullets = descriptionToBullets(item.description);
        const bulletHeights = bullets.map(bullet => measureWrappedHeight(`- ${bullet}`, bulletWidth, bulletFont, 'normal', 1.46, fonts.body));
        const estimatedHeight =
            (titleLines.length * getLineHeight(titleFont, 1.18)) +
            getLineHeight(companyFont, 1.24) +
            bulletHeights.reduce((sum, height) => sum + height, 0) +
            10;

        ensureSpace(estimatedHeight);

        setTextStyle(titleFont, 'bold', colors.heading, fonts.heading);
        doc.text(titleLines, roleX, y);

        setTextStyle(9, 'normal', colors.muted, fonts.heading);
        doc.text(item.date, page.width - page.marginX - dateWidth, y);
        y += titleLines.length * getLineHeight(titleFont, 1.18);

        setTextStyle(companyFont, 'bold', colors.accent, fonts.heading);
        if (item.companyUrl) {
            doc.textWithLink(item.company, companyX, y, { url: item.companyUrl });
        } else {
            doc.text(item.company, companyX, y);
        }
        y += getLineHeight(companyFont, 1.24) + 0.8;

        bullets.forEach(bullet => {
            const bulletText = `- ${bullet}`;
            const bulletHeight = measureWrappedHeight(bulletText, bulletWidth, bulletFont, 'normal', 1.46, fonts.body);
            ensureSpace(bulletHeight + 1);
            y = drawWrappedText(bulletText, bulletX, y, bulletWidth, {
                fontSize: bulletFont,
                color: colors.text,
                lineFactor: 1.46,
                fontName: fonts.body
            });
            y += 1.4;
        });

        if (index < total - 1) {
            y += 5.8;
        } else {
            y += 3.8;
        }
    }

    function drawProjectList(projects) {
        const titleFont = 10.6;
        const urlFont = 9.2;
        const iconSize = 4.8;
        const iconGap = 1.5;
        const urlIndent = 2.6;

        projects.forEach((project, index) => {
            const iconX = sectionContentX;
            const textX = iconX + iconSize + iconGap;
            const urlX = textX + urlIndent;
            const textWidth = page.width - page.marginX - textX;
            const urlWidth = page.width - page.marginX - urlX;
            const titleText = `${project.title} - ${project.summary}`;
            const titleHeight = measureWrappedHeight(titleText, textWidth, titleFont, 'bold', 1.34, fonts.heading);
            const urlLabel = project.url;
            const urlHeight = measureWrappedHeight(urlLabel, urlWidth, urlFont, 'normal', 1.28, fonts.heading);
            const estimatedHeight = Math.max(iconSize, titleHeight + urlHeight) + 6.5;

            ensureSpace(estimatedHeight);

            const icon = projectIcons.get(project.title);
            if (icon) {
                doc.addImage(icon, 'PNG', iconX, y - 4.4, iconSize, iconSize);
            }

            let textY = y;
            textY = drawWrappedText(titleText, textX, textY, textWidth, {
                fontSize: titleFont,
                fontStyle: 'bold',
                color: colors.heading,
                lineFactor: 1.34,
                fontName: fonts.heading
            });
            textY += 1.1;

            setTextStyle(urlFont, 'normal', colors.accent, fonts.heading);
            const urlLines = splitText(urlLabel, urlWidth, urlFont, 'normal', fonts.heading);
            doc.text(urlLines, urlX, textY);
            doc.link(urlX, textY - getLineHeight(urlFont, 1.0), urlWidth, urlHeight + 1.5, { url: project.url });

            y += estimatedHeight;
            if (index < projects.length - 1) {
                y += 3.6;
            } else {
                y += 2.4;
            }
        });
        y += 2.4;
    }

    function drawResearchSection(items) {
        if (!items.length) {
            setTextStyle(9.2, 'normal', colors.muted);
            doc.text('No research entries listed.', sectionContentX, y);
            y += 4;
            return;
        }

        items.forEach(item => {
            const titleFont = 10.8;
            const metaFont = 9.2;
            const bodyFont = 9.5;
            const dateWidth = measureTextWidth(item.year, 8.8, 'normal', fonts.heading);
            const titleWidth = sectionContentWidth - dateWidth - 8;
            const titleLines = splitText(item.title, titleWidth, titleFont, 'bold', fonts.heading);
            const metaLine = `${item.role} | ${item.publication}`;
            const descriptionHeight = measureWrappedHeight(item.description, nestedContentWidth, bodyFont, 'normal', 1.44, fonts.body);
            const estimatedHeight =
                (titleLines.length * getLineHeight(titleFont, 1.18)) +
                getLineHeight(metaFont, 1.2) +
                descriptionHeight +
                getLineHeight(8.5, 1.18) +
                5;

            ensureSpace(estimatedHeight);

            setTextStyle(titleFont, 'bold', colors.heading, fonts.heading);
            doc.text(titleLines, sectionContentX, y);

            setTextStyle(8.8, 'normal', colors.muted, fonts.heading);
            doc.text(item.year, page.width - page.marginX - dateWidth, y);
            y += titleLines.length * getLineHeight(titleFont, 1.18);

            setTextStyle(metaFont, 'normal', colors.accent, fonts.heading);
            doc.text(metaLine, nestedContentX, y);
            y += getLineHeight(metaFont, 1.2);

            y = drawWrappedText(item.description, nestedContentX, y, nestedContentWidth, {
                fontSize: bodyFont,
                color: colors.text,
                lineFactor: 1.44,
                fontName: fonts.body
            });
            y += 1.2;

            setTextStyle(8.8, 'normal', colors.accent, fonts.heading);
            doc.textWithLink(item.url.replace(/^https?:\/\//, ''), nestedContentX, y, { url: item.url });
            y += 3.2;
        });
    }

    function drawEducationItem(item) {
        const titleFont = 10.8;
        const bodyFont = 9.5;
        const metaFont = 9.4;
        const dateWidth = measureTextWidth(item.date, 8.8, 'normal', fonts.heading);
        const degreeWidth = sectionContentWidth - dateWidth - 8;
        const degreeLines = splitText(item.degree, degreeWidth, titleFont, 'bold', fonts.heading);
        const bodyHeight = measureWrappedHeight(item.description, nestedContentWidth, bodyFont, 'normal', 1.44, fonts.body);
        const estimatedHeight =
            (degreeLines.length * getLineHeight(titleFont, 1.18)) +
            getLineHeight(metaFont, 1.2) +
            bodyHeight +
            5;

        ensureSpace(estimatedHeight);

        setTextStyle(titleFont, 'bold', colors.heading, fonts.heading);
        doc.text(degreeLines, sectionContentX, y);

        setTextStyle(8.8, 'normal', colors.muted, fonts.heading);
        doc.text(item.date, page.width - page.marginX - dateWidth, y);
        y += degreeLines.length * getLineHeight(titleFont, 1.18);

        setTextStyle(metaFont, 'bold', colors.accent, fonts.heading);
        if (item.institutionUrl) {
            doc.textWithLink(item.institution, nestedContentX, y, { url: item.institutionUrl });
        } else {
            doc.text(item.institution, nestedContentX, y);
        }
        y += getLineHeight(metaFont, 1.2);

        y = drawWrappedText(item.description, nestedContentX, y, nestedContentWidth, {
            fontSize: bodyFont,
            color: colors.text,
            lineFactor: 1.44,
            fontName: fonts.body
        });
        y += 2.8;
    }

    function drawSkillsSection() {
        const groups = [
            ['Frontend', data.skills.frontend],
            ['Backend', data.skills.backend],
            ['AI / ML', data.skills.ai],
            ['Data', data.skills.data],
            ['Tools', data.skills.tools]
        ];

        groups.forEach(([label, items]) => {
            const labelFont = 10;
            const bodyFont = 9.4;
            const text = items.join(', ');
            const bodyHeight = measureWrappedHeight(text, nestedContentWidth, bodyFont, 'normal', 1.4, fonts.body);
            const estimatedHeight = getLineHeight(labelFont, 1.18) + bodyHeight + 3.5;

            ensureSpace(estimatedHeight);

            setTextStyle(labelFont, 'bold', colors.heading, fonts.heading);
            doc.text(label, sectionContentX, y);
            y += getLineHeight(labelFont, 1.24);

            y = drawWrappedText(text, nestedContentX, y, nestedContentWidth, {
                fontSize: bodyFont,
                color: colors.text,
                lineFactor: 1.4,
                fontName: fonts.body
            });
            y += 2.4;
        });
    }

    function drawCertificationItem(cert) {
        const titleFont = 10;
        const metaFont = 9.2;
        const dateWidth = measureTextWidth(cert.date, metaFont, 'normal', fonts.heading);
        const lineWidth = sectionContentWidth - dateWidth - 8;
        const titleLines = splitText(cert.name, lineWidth, titleFont, 'bold', fonts.heading);
        const issuerHeight = measureWrappedHeight(cert.issuer, nestedContentWidth, metaFont, 'normal', 1.34, fonts.body);
        const estimatedHeight =
            (titleLines.length * getLineHeight(titleFont, 1.18)) +
            issuerHeight +
            4;

        ensureSpace(estimatedHeight);

        setTextStyle(titleFont, 'bold', colors.heading, fonts.heading);
        doc.text(titleLines, sectionContentX, y);

        setTextStyle(metaFont, 'normal', colors.muted, fonts.heading);
        doc.text(cert.date, page.width - page.marginX - dateWidth, y);
        y += titleLines.length * getLineHeight(titleFont, 1.18);

        y = drawWrappedText(cert.issuer, nestedContentX, y, nestedContentWidth, {
            fontSize: metaFont,
            color: colors.muted,
            lineFactor: 1.34,
            fontName: fonts.body
        });

        if (cert.url) {
            doc.link(sectionContentX, y - estimatedHeight + 1, sectionContentWidth, estimatedHeight + 1, { url: cert.url });
        }

        y += 2.6;
    }

    function drawFooter() {
        const totalPages = doc.getNumberOfPages();

        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
            doc.setPage(pageNumber);

            doc.setDrawColor(...colors.rule);
            doc.setLineWidth(0.25);
            doc.line(page.marginX, page.height - 9, page.width - page.marginX, page.height - 9);

            setTextStyle(8.2, 'normal', colors.muted);
            doc.text(siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''), page.marginX, page.height - 5.2);

            const pageLabel = `Page ${pageNumber} of ${totalPages}`;
            const pageLabelWidth = doc.getTextWidth(pageLabel);
            doc.text(pageLabel, page.width - page.marginX - pageLabelWidth, page.height - 5.2);
        }
    }

    async function loadCustomTitleFont() {
        if (typeof doc.addFileToVFS !== 'function' || typeof doc.addFont !== 'function') {
            return loadBrowserTitleFont();
        }

        const candidates = [
            'public/resume/Harmony.ttf',
            'public/resume/HARMONY.ttf',
            'public/resume/harmony.ttf',
            'public/resume/Harmony.otf',
            'public/resume/HARMONY.otf',
            'public/resume/harmony.otf'
        ];

        for (const src of candidates) {
            try {
                const response = await fetch(src);
                if (!response.ok) {
                    continue;
                }

                const fontBytes = await response.arrayBuffer();
                const fileName = src.split('/').pop();
                let jsPdfName = null;

                try {
                    doc.addFileToVFS(fileName, arrayBufferToBinaryString(fontBytes));
                    doc.addFont(fileName, 'HarmonyTitle', 'normal');
                    jsPdfName = 'HarmonyTitle';
                } catch (error) {
                    console.warn('CV jsPDF title font registration failed:', src, error);
                }

                const cssFamily = await registerBrowserFont(fontBytes, src);
                return {
                    name: jsPdfName,
                    cssFamily,
                    style: 'normal'
                };
            } catch (error) {
                console.warn('CV title font load failed:', src, error);
            }
        }

        return null;
    }

    function descriptionToBullets(text) {
        return String(text)
            .split('. ')
            .map(sentence => sentence.trim())
            .filter(Boolean)
            .map(sentence => sentence.endsWith('.') ? sentence : `${sentence}.`);
    }

    async function loadImageAsset(src, size) {
        const cacheKey = `${src}:${size}`;
        if (imageCache.has(cacheKey)) {
            return imageCache.get(cacheKey);
        }

        const promise = (async () => {
            try {
                const response = await fetch(src);
                if (!response.ok) {
                    throw new Error(`Failed to load ${src}`);
                }

                const blob = await response.blob();
                return await blobToContainedPng(blob, size);
            } catch (error) {
                console.warn('CV asset load failed:', src, error);
                return null;
            }
        })();

        imageCache.set(cacheKey, promise);
        return promise;
    }

    function blobToContainedPng(blob, size) {
        return new Promise((resolve, reject) => {
            const objectUrl = URL.createObjectURL(blob);
            const image = new Image();

            image.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const padding = size * 0.06;
                    canvas.width = size;
                    canvas.height = size;
                    ctx.clearRect(0, 0, size, size);

                    const scale = Math.min(
                        (size - (padding * 2)) / image.width,
                        (size - (padding * 2)) / image.height
                    );
                    const drawWidth = image.width * scale;
                    const drawHeight = image.height * scale;
                    const drawX = (size - drawWidth) / 2;
                    const drawY = (size - drawHeight) / 2;

                    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
                    URL.revokeObjectURL(objectUrl);
                    resolve(canvas.toDataURL('image/png'));
                } catch (error) {
                    URL.revokeObjectURL(objectUrl);
                    reject(error);
                }
            };

            image.onerror = error => {
                URL.revokeObjectURL(objectUrl);
                reject(error);
            };

            image.src = objectUrl;
        });
    }

    function createEmojiBadge(emoji, size) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.round(size * 0.48)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.fillText(emoji, size / 2, size / 2 + (size * 0.02));

        return canvas.toDataURL('image/png');
    }

    async function createTitleWordmark(text, fontFamily) {
        if (!fontFamily) {
            return null;
        }

        const renderScale = 4;
        const paddingX = 24;
        const paddingY = 18;
        const maxWidthMm = contentWidth - 6;
        const desiredHeightMm = 13.8;
        const probeCanvas = document.createElement('canvas');
        const probeCtx = probeCanvas.getContext('2d');

        if (!probeCtx) {
            return null;
        }

        let fontSizePx = 62;
        let trackingPx = 1.4;

        probeCtx.font = `${fontSizePx}px "${fontFamily}"`;
        let trackedWidth = measureTrackedCanvasText(probeCtx, text, trackingPx);
        const maxWidthPx = maxWidthMm * renderScale;

        if (trackedWidth + (paddingX * 2) > maxWidthPx) {
            const scale = (maxWidthPx - (paddingX * 2)) / trackedWidth;
            fontSizePx *= scale;
            trackingPx *= scale;
            probeCtx.font = `${fontSizePx}px "${fontFamily}"`;
            trackedWidth = measureTrackedCanvasText(probeCtx, text, trackingPx);
        }

        const metrics = probeCtx.measureText(text);
        const ascent = metrics.actualBoundingBoxAscent || (fontSizePx * 0.82);
        const descent = metrics.actualBoundingBoxDescent || (fontSizePx * 0.24);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        canvas.width = Math.ceil(trackedWidth + (paddingX * 2));
        canvas.height = Math.ceil(ascent + descent + (paddingY * 2));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgb(${colors.heading.join(', ')})`;
        ctx.textBaseline = 'alphabetic';
        ctx.font = `${fontSizePx}px "${fontFamily}"`;
        drawTrackedCanvasText(ctx, text, paddingX, paddingY + ascent, trackingPx);

        let widthMm = canvas.width / renderScale;
        let heightMm = desiredHeightMm;
        const aspectRatio = canvas.width / canvas.height;

        widthMm = heightMm * aspectRatio;
        if (widthMm > maxWidthMm) {
            widthMm = maxWidthMm;
            heightMm = widthMm / aspectRatio;
        }

        return {
            dataUrl: canvas.toDataURL('image/png'),
            widthMm,
            heightMm,
            textStartMm: paddingX / renderScale
        };
    }

    function arrayBufferToBinaryString(buffer) {
        const bytes = new Uint8Array(buffer);
        const chunkSize = 0x8000;
        let binary = '';

        for (let index = 0; index < bytes.length; index += chunkSize) {
            const chunk = bytes.subarray(index, index + chunkSize);
            binary += String.fromCharCode(...chunk);
        }

        return binary;
    }

    async function loadBrowserTitleFont() {
        const candidates = [
            'public/resume/Harmony.ttf',
            'public/resume/HARMONY.ttf',
            'public/resume/harmony.ttf',
            'public/resume/Harmony.otf',
            'public/resume/HARMONY.otf',
            'public/resume/harmony.otf'
        ];

        for (const src of candidates) {
            try {
                const response = await fetch(src);
                if (!response.ok) {
                    continue;
                }

                const fontBytes = await response.arrayBuffer();
                const cssFamily = await registerBrowserFont(fontBytes, src);
                return {
                    name: null,
                    cssFamily,
                    style: 'normal'
                };
            } catch (error) {
                console.warn('CV browser title font load failed:', src, error);
            }
        }

        return null;
    }

    async function registerBrowserFont(fontBytes, src) {
        if (typeof FontFace !== 'function' || !document.fonts) {
            return null;
        }

        const cssFamily = 'HarmonyTitleCanvas';
        const fontFace = new FontFace(cssFamily, fontBytes);
        await fontFace.load();
        document.fonts.add(fontFace);
        return cssFamily;
    }

    function measureTrackedCanvasText(ctx, text, tracking) {
        const characters = Array.from(text);
        return characters.reduce((width, character, index) => {
            const nextWidth = width + ctx.measureText(character).width;
            return index < characters.length - 1 ? nextWidth + tracking : nextWidth;
        }, 0);
    }

    function drawTrackedCanvasText(ctx, text, startX, baselineY, tracking) {
        let cursorX = startX;

        Array.from(text).forEach(character => {
            ctx.fillText(character, cursorX, baselineY);
            cursorX += ctx.measureText(character).width + tracking;
        });
    }

    function getLinkedInHandle(linkedinUrl) {
        return linkedinUrl
            .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')
            .replace(/\/$/, '');
    }
}

window.generateResumePDF = generateResumePDF;

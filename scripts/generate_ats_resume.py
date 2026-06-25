import json
import argparse
import subprocess
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "ahmad-yaseen-resume.pdf"
SKILL_LABELS = {
    "ai": "AI",
    "api": "API",
}
PDF_TEMPLATE_PRESETS = {
    "experienced": {
        "order": ["summary", "experience", "projects", "skills", "education", "research", "certifications"],
        "titles": {"summary": "Summary", "experience": "Experience", "projects": "Projects", "skills": "Skills", "education": "Education", "research": "Research", "certifications": "Certifications"},
    },
}


def load_cv_data():
    script = (
        "const { CV_DATA } = require('./js/journey-data.js');"
        "process.stdout.write(JSON.stringify(CV_DATA));"
    )
    result = subprocess.run(
        ["node", "-e", script],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def escape(text):
    return (
        str(text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def link(label, href):
    href = str(href or "").strip()
    if not href:
        return escape(label)
    return f'<link href="{escape(href)}" color="#1f4f93">{escape(label)}</link>'


def paragraph(text, style):
    return Paragraph(escape(text), style)


def linked_line(label, value, href, style):
    visible = f"{label}: {value}"
    return Paragraph(f"<b>{escape(label)}:</b> {link(value, href)}", style), visible


def section_heading(title, styles):
    return Paragraph(escape(title.upper()), styles["section"])


def add_section(story, title, styles):
    story.append(Spacer(1, 7))
    story.append(section_heading(title, styles))
    story.append(Spacer(1, 3))


def item_header(title, date, styles):
    data = [[Paragraph(f"<b>{escape(title)}</b>", styles["item_title"]), Paragraph(escape(date), styles["date"])]]
    table = Table(data, colWidths=[132 * mm, 34 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    return table


def bullet(text, styles):
    return Paragraph(f"- {escape(text)}", styles)


def build_pdf(data, preset_id="experienced"):
    preset = PDF_TEMPLATE_PRESETS.get(preset_id, PDF_TEMPLATE_PRESETS["experienced"])
    styles = getSampleStyleSheet()
    base_font = "Helvetica"
    custom = {
        "name": ParagraphStyle(
            "Name",
            parent=styles["Normal"],
            fontName=base_font,
            fontSize=18,
            leading=21,
            textColor=colors.HexColor("#111827"),
            spaceAfter=2,
        ),
        "title": ParagraphStyle(
            "Title",
            parent=styles["Normal"],
            fontName=base_font,
            fontSize=10.5,
            leading=13,
            textColor=colors.HexColor("#1f4f93"),
            spaceAfter=4,
        ),
        "contact": ParagraphStyle(
            "Contact",
            parent=styles["Normal"],
            fontName=base_font,
            fontSize=8.8,
            leading=11,
            textColor=colors.HexColor("#1f2937"),
        ),
        "section": ParagraphStyle(
            "Section",
            parent=styles["Normal"],
            fontName=base_font,
            fontSize=10,
            leading=12,
            textColor=colors.HexColor("#111827"),
            borderColor=colors.HexColor("#cfd6df"),
            borderWidth=0,
            borderPadding=0,
            spaceBefore=2,
            spaceAfter=2,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontName=base_font,
            fontSize=9.2,
            leading=12,
            textColor=colors.HexColor("#1f2937"),
            spaceAfter=2,
        ),
        "item_title": ParagraphStyle(
            "ItemTitle",
            parent=styles["Normal"],
            fontName=base_font,
            fontSize=9.4,
            leading=11.5,
            textColor=colors.HexColor("#111827"),
        ),
        "date": ParagraphStyle(
            "Date",
            parent=styles["Normal"],
            fontName=base_font,
            fontSize=8.6,
            leading=11,
            textColor=colors.HexColor("#4b5563"),
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=styles["Normal"],
            fontName=base_font,
            fontSize=8.8,
            leading=11,
            textColor=colors.HexColor("#374151"),
            spaceAfter=2,
        ),
    }

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
        title=f"{data['personal']['name']} Resume",
        author=data["personal"]["name"],
        subject="ATS-friendly resume",
    )

    personal = data["personal"]
    site_url = data.get("meta", {}).get("siteUrl", "")
    site_url = personal.get("website") or site_url
    story = [
        Paragraph(f"<b>{escape(personal['name'])}</b>", custom["name"]),
        Paragraph(escape(personal["title"]), custom["title"]),
    ]

    contact_items = [
        ("Email", personal.get("email", ""), f"mailto:{personal.get('email', '')}"),
        ("Location", personal.get("location", ""), ""),
        ("LinkedIn", personal.get("linkedin", ""), personal.get("linkedin", "")),
        ("GitHub", personal.get("github", ""), personal.get("github", "")),
        ("Website", site_url, site_url),
    ]
    contact_lines = []
    for label, value, href in contact_items:
        if not value:
            continue
        contact_lines.append(linked_line(label, value, href, custom["contact"])[0])
    story.extend(contact_lines)
    story.append(Spacer(1, 5))

    def add_summary():
        add_section(story, preset["titles"].get("summary", "Summary"), custom)
        for text in data.get("summary", []):
            story.append(paragraph(text, custom["body"]))

    def add_experience():
        add_section(story, preset["titles"].get("experience", "Experience"), custom)
        for item in data.get("experience", []):
            story.append(item_header(item.get("role", ""), item.get("date", ""), custom))
            company = item.get("company", "")
            company_url = item.get("companyUrl", "")
            story.append(Paragraph(f"<b>{escape(company)}</b>{' - ' + link(company_url, company_url) if company_url else ''}", custom["meta"]))
            for text in item.get("bullets", []):
                story.append(bullet(text, custom["body"]))
            story.append(Spacer(1, 3))

    def add_projects():
        add_section(story, preset["titles"].get("projects", "Projects"), custom)
        for item in data.get("allProjects", [])[:4]:
            story.append(Paragraph(f"<b>{escape(item.get('name', ''))}</b>{' - ' + link(item.get('url', ''), item.get('url', '')) if item.get('url') else ''}", custom["item_title"]))
            if item.get("description"):
                story.append(paragraph(item["description"], custom["body"]))
            for text in item.get("bullets", []):
                story.append(bullet(text, custom["body"]))
            if item.get("tags"):
                story.append(paragraph(f"Tools: {', '.join(item['tags'])}", custom["meta"]))
            story.append(Spacer(1, 2))

    def add_skills():
        add_section(story, preset["titles"].get("skills", "Skills"), custom)
        for name, skills in data.get("skills", {}).items():
            label = SKILL_LABELS.get(name.lower(), name.title())
            story.append(Paragraph(f"<b>{escape(label)}:</b> {escape(', '.join(skills))}", custom["body"]))

    def add_education():
        add_section(story, preset["titles"].get("education", "Education"), custom)
        for item in data.get("education", []):
            story.append(item_header(item.get("degree", ""), item.get("date", ""), custom))
            institution = item.get("institution", "")
            institution_url = item.get("institutionUrl", "")
            story.append(Paragraph(f"<b>{escape(institution)}</b>{' - ' + link(institution_url, institution_url) if institution_url else ''}", custom["meta"]))
            story.append(paragraph(item.get("description", ""), custom["body"]))

    def add_research():
        add_section(story, preset["titles"].get("research", "Research"), custom)
        for item in data.get("research", []):
            story.append(item_header(item.get("title", ""), item.get("year", ""), custom))
            meta = " | ".join(part for part in [item.get("role", ""), item.get("publication", "")] if part)
            if meta:
                story.append(paragraph(meta, custom["meta"]))
            story.append(paragraph(item.get("description", ""), custom["body"]))
            if item.get("url"):
                story.append(Paragraph(f"<b>Research link:</b> {link(item['url'], item['url'])}", custom["meta"]))

    def add_certifications():
        add_section(story, preset["titles"].get("certifications", "Certifications"), custom)
        for item in data.get("certifications", []):
            story.append(item_header(item.get("name", ""), item.get("date", ""), custom))
            issuer = item.get("issuer", "")
            url = item.get("url", "")
            if url:
                story.append(Paragraph(f"{escape(issuer)} - {link(url, url)}", custom["meta"]))
            else:
                story.append(paragraph(issuer, custom["meta"]))

    section_renderers = {
        "summary": add_summary,
        "experience": add_experience,
        "projects": add_projects,
        "skills": add_skills,
        "education": add_education,
        "research": add_research,
        "certifications": add_certifications,
    }

    for section_id in preset["order"]:
        section_renderers[section_id]()

    doc.build(story)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate an ATS-safe resume PDF from CV_DATA.")
    parser.add_argument("--preset", choices=sorted(PDF_TEMPLATE_PRESETS), default="experienced")
    args = parser.parse_args()
    build_pdf(load_cv_data(), args.preset)
    print(OUTPUT)

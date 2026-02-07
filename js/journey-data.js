/*
 * Journey Data - Single Source of Truth
 * This file powers both the homepage, /journey page, and PDF resume export
 */

const JOURNEY_DATA = {
    // ============================================
    // PERSONAL INFORMATION
    // ============================================
    personal: {
        name: "Ahmad Yaseen",
        title: "Full-Stack Developer",
        tagline: "I build MVPs and web apps for startups.",
        description: "Full-stack developer. I turn ideas into shipped products, fast. React, Next.js, Node.js, AI integrations.",
        email: "Ahdfactz@gmail.com",
        location: "Pakistan",
        profileImage: "public/profile.png",
        status: "Currently open for freelance work.",
        github: "https://github.com/ahmadkhattak1",
        githubUsername: "ahmadkhattak1",
        linkedin: "https://www.linkedin.com/in/AhmadYKhattak/",
        twitter: "https://x.com/AhmadYKhattak"
    },

    // ============================================
    // ABOUT SECTION
    // ============================================
    about: {
        short: "I build MVPs and web apps for startups. From idea to deployment, I ship products that real users love.",
        full: [
            "I'm a full-stack developer based in Pakistan, passionate about turning ideas into shipped products. I specialize in building MVPs and web applications for startups, working across the entire stack from frontend to backend to deployment.",
            "I've built and launched real products like Stumbnail (an AI-powered YouTube thumbnail generator) and contributed to tools like ClawPilot. I believe in learning by building, and every project I take on is an opportunity to solve real problems for real users.",
            "When I'm not coding, I'm researching machine learning applications, exploring new technologies, or thinking about the next thing to build. I started a startup, learned from its challenges, and came out of it with a clearer vision of what it takes to ship products that matter."
        ]
    },

    // ============================================
    // SERVICES (Homepage)
    // ============================================
    services: [
        {
            id: "mvp",
            title: "MVP Development",
            description: "Got an idea? I build it into a working product with real users in mind.",
            icon: "rocket"
        },
        {
            id: "webapp",
            title: "Web App Development",
            description: "Full-stack web apps with auth, dashboards, APIs, and clean deployment.",
            icon: "code"
        },
        {
            id: "ai",
            title: "AI Integration",
            description: "Adding AI to your product. Image generation, LLMs, chatbots, automation.",
            icon: "sparkles"
        }
    ],

    // ============================================
    // FEATURED PROJECTS (Homepage - only 2)
    // ============================================
    featuredProjects: [
        {
            id: "stumbnail",
            name: "Stumbnail",
            tagline: "AI-powered YouTube thumbnail generator. Solo-built from idea to deployment.",
            description: "A complete SaaS platform for creating high-converting YouTube thumbnails using AI.",
            url: "https://stumbnail.com",
            screenshot: "public/projects/screenshots/Stumbnail-Hero-Page.png",
            logo: "public/projects/stumbnail.png",
            features: [
                "AI image generation pipeline using external AI APIs",
                "Real-time canvas editor for designing and editing thumbnails",
                "Full user dashboard with analytics",
                "Community feed where users share and browse thumbnails",
                "Complete authentication system",
                "Marketing landing page"
            ],
            tech: ["Next.js", "Node.js", "Express", "Firebase Auth", "Firestore", "Google Storage", "Vercel"]
        },
        {
            id: "clawpilot",
            name: "ClawPilot",
            tagline: "Setup and management tool for OpenClaw, an open-source AI assistant across WhatsApp, Telegram, Slack, and Discord.",
            description: "Web platform and marketing site for OpenClaw's multi-platform AI assistant.",
            url: "https://clawpilot.app",
            screenshot: "public/projects/screenshots/clawpilot-hero-page.png",
            logo: "public/projects/Clawpilot.svg",
            features: [
                "Landing page and product marketing site",
                "Waitlist system for early adopters",
                "Web platform frontend"
            ],
            tech: ["Next.js", "TypeScript", "Tailwind"]
        }
    ],

    // ============================================
    // ALL PROJECTS (Journey page)
    // ============================================
    allProjects: [
        {
            name: "Stumbnail",
            url: "https://stumbnail.com",
            logo: "public/projects/stumbnail.png",
            description: "Commercial AI-powered platform for generating high-CTR YouTube thumbnails.",
            tags: ["AI", "SaaS", "Next.js", "Node.js", "Express", "Firebase", "Vercel"]
        },
        {
            name: "ClawPilot",
            url: "https://clawpilot.app",
            logo: "public/projects/Clawpilot.svg",
            description: "Setup and management tool for OpenClaw, a multi-platform AI assistant.",
            tags: ["Next.js", "TypeScript", "Tailwind"]
        },
        {
            name: "ScreenChat",
            url: "https://ahmadyaseen.com/extensions/screenchat",
            logo: "public/projects/screenchat.png",
            description: "AI agent Chrome extension. Chat with your screen, get help with forms, research, and tasks.",
            tags: ["AI", "Chrome Extension", "Browser Agent"]
        },
        {
            name: "Pixelar",
            url: "https://pixelar.dev",
            description: "Developer toolkit for procedurally generating and animating 2D game sprites.",
            tags: ["GenAI", "GameDev", "Tools"]
        }
    ],

    // ============================================
    // EXPERIENCE
    // ============================================
    experience: [
        {
            role: "Founder & Lead Developer",
            company: "Stumbnail",
            companyUrl: "https://stumbnail.com",
            date: "2024 - Present",
            description: "Built an AI-powered YouTube thumbnail generator from scratch. Developed the full product including AI image generation pipeline, real-time canvas editor, user dashboard with analytics, community feed, and authentication system. Managed the entire product lifecycle from MVP to market."
        },
        {
            role: "Developer",
            company: "Pixelar",
            companyUrl: "https://pixelar.dev",
            date: "2025 - 2026",
            description: "Leading R&D on generative models for 2D animation and sprite synthesis. Building tools that help game developers create assets faster."
        },
        {
            role: "Incubatee",
            company: "National Incubation Center (NIC)",
            companyUrl: null,
            date: "2025",
            description: "Selected for a prestigious startup acceleration program to scale AI ventures. Received mentorship and resources to grow Stumbnail."
        }
    ],

    // ============================================
    // EDUCATION
    // ============================================
    education: [
        {
            degree: "BS Computer Science",
            institution: "IMSciences Peshawar",
            institutionUrl: "https://imsciences.edu.pk",
            date: "2022 - 2026",
            description: "Focus on Artificial Intelligence and Entrepreneurship. Coursework in machine learning, software engineering, and data structures."
        }
    ],

    // ============================================
    // SKILLS
    // ============================================
    skills: {
        frontend: ["React", "Next.js", "HTML/CSS", "Tailwind CSS", "JavaScript", "TypeScript"],
        backend: ["Node.js", "Express", "Python", "MongoDB", "PostgreSQL", "REST APIs"],
        ai: ["AI API Integration", "LLM APIs (OpenAI, Claude)", "Image Generation Pipelines", "Prompt Engineering"],
        data: ["Numpy", "Pandas"],
        tools: ["Git", "GitHub", "Vercel", "AWS", "Firebase"]
    },

    // ============================================
    // RESEARCH
    // ============================================
    research: [
        {
            title: "A review of Software Defect Prediction Models using Machine Learning",
            role: "Author",
            publication: "AM Research Journal",
            year: "2025",
            description: "A comprehensive review of ML models used for predicting software defects, analyzing their effectiveness and accuracy across different methodologies.",
            url: "https://amresearchjournal.com/index.php/Journal/article/view/1416"
        }
    ],

    // ============================================
    // CERTIFICATIONS
    // ============================================
    certifications: [
        {
            name: "HarvardX's CS50P (Python)",
            issuer: "Harvard University (via edX)",
            url: "https://courses.edx.org/certificates/eeb3c6ea512d4b7fb92f7ef0b320ea39",
            date: "2024"
        },
        {
            name: "JavaScript Fundamentals",
            issuer: "Scrimba",
            url: "https://scrimba.com/@Ahmadkhattak1:certs;cert2CsEjr6BTAJVX14Fk3qLQUgjcAeQRirC7E",
            date: "2025"
        },
        {
            name: "HTML & CSS",
            issuer: "Scrimba",
            url: "https://scrimba.com/@Ahmadkhattak1:certs;cert2CsEjr6BTAJVX14Fk3qJvBZT4zue9hco8U",
            date: "2025"
        },
        {
            name: "Intro to UI Design Fundamentals",
            issuer: "Scrimba",
            url: "https://scrimba.com/@Ahmadkhattak1:certs;cert2CsEjr6BTAJVX14Fk3qKAZkLACCSCNouDG",
            date: "2025"
        }
    ],

    // ============================================
    // GITHUB CONFIG
    // ============================================
    github: {
        username: "ahmadkhattak1",
        chartColor: "f97316" // Orange to match accent
    },

    // ============================================
    // META
    // ============================================
    meta: {
        siteUrl: "https://ahmadyaseen.com",
        siteTitle: "Ahmad Yaseen | Full-Stack Developer",
        siteDescription: "Full-stack developer building MVPs and web apps for startups. Creator of Stumbnail. React, Next.js, Node.js, AI integrations.",
        ogImage: "https://ahmadyaseen.com/public/profile.png"
    }
};

// Export for use in other modules (ES6 modules support)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JOURNEY_DATA;
}

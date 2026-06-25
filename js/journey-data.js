/*
 * Journey Data
 * Page-facing content for the homepage and /journey page.
 */

const JOURNEY_DATA = {
    // ============================================
    // PERSONAL INFORMATION
    // ============================================
    personal: {
        name: "Ahmad Yaseen",
        title: "Cloud Engineer & Full-Stack SaaS Builder",
        tagline: "Cloud engineering grounded in shipping and operating SaaS products.",
        description: "Cloud engineer with a full-stack SaaS background, building and operating products across application code, deployment, infrastructure, and production workflows.",
        email: "hi@ahmadyaseen.com",
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
        short: "The work began in full-stack SaaS development and grew into the cloud systems needed to host, secure, deploy, and operate those products.",
        full: [
            "I am focused on cloud engineering, infrastructure, and production operations.",
            "My work has moved from building SaaS products to understanding how real systems are deployed, hosted, secured, and kept reliable. I previously built Stumbnail and ClawPilot, both of which reached paying users and meaningful monthly recurring revenue.",
            "Those products gave me practical exposure to the operational side of software: application hosting, cloud infrastructure, compute provisioning, deployment workflows, access control, payments, runtime management, and production reliability.",
            "ClawPilot became the clearest turning point. It involved managed hosting, user environments, agent runtimes, Hermes Agent support, networking, and infrastructure operations. That work made it clear that cloud engineering is the direction I want to focus on seriously.",
            "I have now stopped actively building ClawPilot and Stumbnail as products. The revenue was real, but scaling further required funding and resources I did not have at this stage.",
            "My focus now is cloud engineering, AWS, infrastructure, deployment systems, security, networking, and reliable production environments. My product background helps me understand what real applications need, but my current direction is cloud-first."
        ]
    },

    // ============================================
    // SERVICES (Homepage)
    // ============================================
    services: [
        {
            id: "mvp",
            title: "SaaS Product Delivery",
            description: "Product work from MVP code through deployment, iteration, and real user operation.",
            icon: "rocket"
        },
        {
            id: "webapp",
            title: "Cloud Setup & Operations",
            description: "Hosting, managed compute, deployment, infrastructure ownership, and production follow-through.",
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
            tagline: "AI-powered YouTube thumbnail generator with paid users. Solo-built from idea to deployment.",
            description: "A complete SaaS platform for creating high-converting YouTube thumbnails using AI, with paid users.",
            url: "https://stumbnail.com",
            screenshot: "public/projects/screenshots/stumbnail.webp",
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
            tagline: "Cloud-native hosting and management platform for OpenClaw and Hermes Agent workflows.",
            description: "Managed AI assistant platform spanning user onboarding, compute provisioning, agent runtimes, deployment, and production operations.",
            url: "https://clawpilot.app",
            screenshot: "public/projects/screenshots/clawpilot-hero-page.png",
            logo: "public/projects/Clawpilot.svg",
            features: [
                "Managed compute provisioning for user agent environments",
                "Hermes Agent hosting merged into the ClawPilot platform",
                "Application deployment, runtime operations, and product onboarding"
            ],
            tech: ["Next.js", "TypeScript", "Node.js", "Supabase", "DigitalOcean"]
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
            description: "Commercial AI-powered YouTube thumbnail generator with paid users.",
            tags: ["AI", "SaaS", "Next.js", "Node.js", "Express", "Firebase", "Vercel"]
        },
        {
            name: "ClawPilot",
            url: "https://clawpilot.app",
            logo: "public/projects/Clawpilot.svg",
            description: "Cloud-native OpenClaw and Hermes Agent platform with managed user machines, agent runtimes, deployment, and production operations.",
            tags: ["Cloud Native", "Agent Runtimes", "Next.js", "Supabase", "DigitalOcean"]
        },
        {
            name: "LiveBoard",
            url: "https://liveboard-zeta.vercel.app/",
            logo: "public/projects/Liveboard.png",
            description: "Collaborative freeform whiteboard for sketching, planning, and working together in real time.",
            tags: ["Collaboration", "Whiteboard", "Realtime"]
        },
        {
            name: "ScreenChat",
            url: "https://screenchat.ahmadyaseen.com",
            logo: "public/projects/screenchat.png",
            description: "AI agent Chrome extension. Chat with your screen, get help with forms, research, and tasks.",
            tags: ["AI", "Chrome Extension", "Browser Agent"]
        },
        {
            name: "Scrapify",
            url: "https://github.com/Ahmadkhattak1/scrapify-extension",
            logoEmoji: "\uD83D\uDDC2\uFE0F",
            description: "Google Business Profile data scraper extension for pulling lead data directly from search results.",
            tags: ["Chrome Extension", "Scraping", "Lead Gen"]
        },
        {
            name: "Pixelar",
            url: "https://pixelar.dev",
            description: "Developer toolkit for procedurally generating and animating 2D game sprites.",
            tags: ["GenAI", "GameDev", "Tools"]
        },
        {
            name: "Ezmoji",
            url: "https://ezmoji.ahmadyaseen.com",
            logo: "public/projects/ezmoji.png",
            description: "Browser extension for inserting emojis fast with aliases, shortcuts, and quick search.",
            tags: ["Browser Extension", "Productivity", "Emoji"]
        }
    ],

    // ============================================
    // EXPERIENCE
    // ============================================
    experience: [
        {
            role: "Cloud Engineering Direction",
            company: "ClawPilot",
            companyUrl: "https://clawpilot.app",
            date: "2026 - Present",
            description: "Merged the Hermes Agent hosting work into ClawPilot and shifted the product toward cloud-native operations: provisioning user machines, managing agent runtimes, deploying services, and keeping production infrastructure available."
        },
        {
            role: "Founder & Full-Stack SaaS Builder",
            company: "Stumbnail",
            companyUrl: "https://stumbnail.com",
            date: "2024 - Present",
            description: "Built an AI-powered YouTube thumbnail SaaS from scratch, covering the product, AI image workflow, canvas editor, dashboard, authentication, deployment, and the work required to serve paying users."
        },
        {
            role: "Founder & Full-Stack SaaS Builder",
            company: "ClawPilot",
            companyUrl: "https://clawpilot.app",
            date: "2025 - Present",
            description: "Built ClawPilot as a SaaS product around managed AI assistant workflows, then expanded the work into cloud setup, hosting, infrastructure decisions, security concerns, uptime, and production operations."
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
        cloud: ["AWS Cloud Fundamentals", "DigitalOcean Droplets", "Compute Provisioning", "Virtual Machine Operations", "Application Hosting", "Deployment Workflows"],
        operations: ["Monitoring Fundamentals", "Availability & Uptime Operations", "Runtime Management", "Backup & Recovery Awareness"],
        security: ["Cloud Security Fundamentals", "Network Access Basics", "Identity & Access Fundamentals", "Infrastructure Security Basics"],
        ai: ["AI API Integration", "LLM APIs (OpenAI, Claude)", "Image Generation Pipelines", "Prompt Engineering"],
        data: ["Numpy", "Pandas"],
        platforms: ["Vercel", "Firebase", "Supabase", "Git", "GitHub"]
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
            name: "AWS Certified Cloud Practitioner",
            issuer: "Amazon Web Services",
            url: "https://www.credly.com/badges/77de5c17-ab36-4ea4-89cc-b3195dfa59a9/public_url",
            date: "2026",
            previewImage: "aws-certified-cloud-practitioner.png"
        },
        {
            name: "AWS Certified Solutions Architect - Associate",
            issuer: "Amazon Web Services",
            url: "#",
            date: "Planned"
        },
        {
            name: "HarvardX's CS50P (Python)",
            issuer: "Harvard University (via edX)",
            url: "https://courses.edx.org/certificates/eeb3c6ea512d4b7fb92f7ef0b320ea39",
            date: "2024",
            previewImage: "HardvardX-cs50p.webp"
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
        siteTitle: "Ahmad Yaseen | Cloud Engineer & Full-Stack SaaS Builder",
        siteDescription: "Cloud engineer with a full-stack SaaS background building and operating products such as Stumbnail and ClawPilot across application code, infrastructure, deployment, and production workflows.",
        ogImage: "https://ahmadyaseen.com/public/profile.png"
    }
};

// ============================================
// CV DATA
// Resume-ready content kept separate from the public journey narrative.
// ============================================

const CV_DATA = {
    personal: {
        name: "Ahmad Yaseen",
        title: "Cloud Engineer & Full-Stack SaaS Builder",
        email: "hi@ahmadyaseen.com",
        location: "Pakistan",
        profileImage: "public/profile.png",
        github: "https://github.com/ahmadkhattak1",
        githubUsername: "ahmadkhattak1",
        linkedin: "https://www.linkedin.com/in/AhmadYKhattak/",
        website: "https://ahmadyaseen.com"
    },
    summary: [
        "Cloud engineer with a full-stack SaaS background building products that span application code, AWS fundamentals, deployment workflows, infrastructure ownership, and production operations.",
        "Built and operated revenue-generating SaaS products including Stumbnail and ClawPilot, with hands-on work across managed compute provisioning, virtual machine operations, agent runtime operations, monitoring, security, web platforms, AI integrations, databases, and user-facing product delivery."
    ],
    experience: [
        {
            role: "Founder & Cloud / Full-Stack Engineer",
            company: "ClawPilot",
            companyUrl: "https://clawpilot.app",
            date: "2025 - Present",
            bullets: [
                "Built and operate a cloud-native SaaS platform for managed OpenClaw and Hermes Agent workflows.",
                "Provision user compute environments automatically and manage virtual machines that run customer agent workloads.",
                "Operate agent runtimes, monitoring routines, and production service availability for users who need persistent hosted access.",
                "Own application deployment, infrastructure decisions, backend services, network access, security considerations, and operational follow-through for the product.",
                "Merged the earlier Hermes Agent hosting work into ClawPilot so the hosting capability is part of the main platform rather than a standalone app."
            ]
        },
        {
            role: "Founder & Full-Stack SaaS Engineer",
            company: "Stumbnail",
            companyUrl: "https://stumbnail.com",
            date: "2024 - Present",
            bullets: [
                "Built an AI-powered YouTube thumbnail SaaS from product concept through launch and paid user operation.",
                "Developed the AI image generation workflow, real-time canvas editor, user dashboard, authentication, storage, and supporting backend services.",
                "Deployed and maintained the application stack while iterating on a product with recurring revenue and real customer usage.",
                "Worked across frontend, backend, data storage, third-party AI APIs, and production delivery as the solo builder."
            ]
        },
        {
            role: "Developer",
            company: "Pixelar",
            companyUrl: "https://pixelar.dev",
            date: "2025 - 2026",
            bullets: [
                "Led R&D work on generative models for 2D animation and sprite synthesis.",
                "Built tooling intended to reduce asset creation friction for game developers."
            ]
        },
        {
            role: "Incubatee",
            company: "National Incubation Center (NIC)",
            companyUrl: null,
            date: "2025",
            bullets: [
                "Selected for a startup acceleration program while growing Stumbnail."
            ]
        }
    ],
    allProjects: [
        {
            name: "ClawPilot",
            url: "https://clawpilot.app",
            description: "Cloud-native managed AI assistant platform with automated user machine provisioning and hosted agent runtime operations.",
            bullets: [
                "Provision and manage compute for hosted customer workloads.",
                "Operate Hermes Agent hosting as part of the ClawPilot platform.",
                "Built with Next.js, TypeScript, Node.js, Supabase, and DigitalOcean."
            ],
            tags: ["Cloud Native", "Agent Runtimes", "Next.js", "TypeScript", "Supabase", "DigitalOcean"]
        },
        {
            name: "Stumbnail",
            url: "https://stumbnail.com",
            description: "Revenue-generating AI thumbnail SaaS built end to end for paid users.",
            bullets: [
                "Built AI generation, editing, dashboard, authentication, and product workflows.",
                "Operated the deployed product across frontend, backend, storage, and external AI services."
            ],
            tags: ["SaaS", "AI", "Next.js", "Node.js", "Firebase", "Vercel"]
        },
        {
            name: "ScreenChat",
            url: "https://screenchat.ahmadyaseen.com",
            description: "Browser extension that lets users chat with the current page for forms, research, and repetitive tasks.",
            tags: ["Browser Agent", "Chrome Extension", "AI"]
        },
        {
            name: "LiveBoard",
            url: "https://liveboard-zeta.vercel.app/",
            description: "Collaborative freeform whiteboard for real-time planning, sketching, and visual work.",
            tags: ["Collaboration", "Realtime", "Web App"]
        },
        {
            name: "Scrapify",
            url: "https://github.com/Ahmadkhattak1/scrapify-extension",
            description: "Google Business Profile data scraper extension for lead collection from search results.",
            tags: ["Chrome Extension", "Scraping", "Lead Gen"]
        },
        {
            name: "Ezmoji",
            url: "https://ezmoji.ahmadyaseen.com",
            description: "Browser extension for quick emoji insertion with aliases, shortcuts, and search.",
            tags: ["Browser Extension", "Productivity"]
        }
    ],
    skills: {
        cloud: ["AWS Cloud Fundamentals", "DigitalOcean Droplets", "Compute Provisioning", "Virtual Machine Operations", "Application Hosting", "Deployment Workflows"],
        operations: ["Monitoring Fundamentals", "Availability & Uptime Operations", "Runtime Management", "Backup & Recovery Awareness"],
        security: ["Cloud Security Fundamentals", "Network Access Basics", "Identity & Access Fundamentals", "Infrastructure Security Basics"],
        frontend: ["React", "Next.js", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS"],
        backend: ["Node.js", "Express", "Python", "REST APIs", "PostgreSQL", "MongoDB"],
        ai: ["LLM API Integration", "Agent Runtimes", "AI API Integration", "Image Generation Pipelines", "Prompt Engineering"],
        platforms: ["Supabase", "Firebase", "Vercel", "Git", "GitHub"]
    },
    education: [
        {
            degree: "BS Computer Science",
            institution: "IMSciences Peshawar",
            institutionUrl: "https://imsciences.edu.pk",
            date: "2022 - 2026",
            description: "Focus on Artificial Intelligence and Entrepreneurship. Coursework in machine learning, software engineering, and data structures."
        }
    ],
    research: [
        {
            title: "A review of Software Defect Prediction Models using Machine Learning",
            role: "Author",
            publication: "AM Research Journal",
            year: "2025",
            description: "Reviewed machine learning approaches for software defect prediction and compared effectiveness across common methodologies.",
            url: "https://amresearchjournal.com/index.php/Journal/article/view/1416"
        }
    ],
    certifications: [
        {
            name: "AWS Certified Cloud Practitioner",
            issuer: "Amazon Web Services",
            url: "https://www.credly.com/badges/77de5c17-ab36-4ea4-89cc-b3195dfa59a9/public_url",
            date: "2026",
            previewImage: "aws-certified-cloud-practitioner.png"
        },
        {
            name: "AWS Certified Solutions Architect - Associate",
            issuer: "Amazon Web Services",
            url: "",
            date: "Planned"
        },
        {
            name: "HarvardX's CS50P (Python)",
            issuer: "Harvard University (via edX)",
            url: "https://courses.edx.org/certificates/eeb3c6ea512d4b7fb92f7ef0b320ea39",
            date: "2024",
            previewImage: "HardvardX-cs50p.webp"
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
    meta: {
        siteUrl: "https://ahmadyaseen.com",
        siteTitle: "Ahmad Yaseen | Cloud Engineer & Full-Stack SaaS Builder",
        siteDescription: "Cloud engineer with a full-stack SaaS background building and operating products across application code, infrastructure, deployment, and production workflows."
    }
};

// Export for use in other modules (ES6 modules support)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JOURNEY_DATA, CV_DATA };
}

/*
 * Personal Site Configuration
 * Edit this file to customize the website with your own details
 */

const CONFIG = {
    // Section Visibility Control
    showSection: {
        about: true,
        research: true, // New Section
        projects: true,
        skills: true,
        experience: true,
        education: true,
        certifications: true,
        github: true,
        customSections: true
    },

    // Personal Information
    personal: {
        name: "Ahmad Yaseen",
        title: "Cloud Engineer & Full-Stack SaaS Builder",
        profileImage: "public/profile.png",
        profileImageAlt: "Profile Picture",
        currently: "Building SaaS products and moving deeper into cloud engineering"
    },

    // Social Links
    social: {
  email: "hi@ahmadyaseen.com",
        github: "https://github.com/ahmadkhattak1",
        linkedin: "https://www.linkedin.com/in/AhmadYKhattak/",
        twitter: "https://x.com/AhmadYKhattak"
    },

    // Research Interests (displayed as a summary above research items)
    researchInterests: "Applied machine learning, with emphasis on software quality assurance and fairness in AI systems.",

    // About Me Section
    about: "Computer Science researcher and founder building at the intersection of AI and creative tools. Currently developing scalable AI systems — from generative models for game assets to automated content pipelines. I turn research into products.",

    // Research Section
    research: [
        {
            title: "A review of Software Defect Prediction Models using Machine Learning",
            role: "Author",
            institution: "AM Research Journal",
            year: "Published",
            description: "A comprehensive review of ML models used for predicting software defects, analyzing their effectiveness and accuracy.",
            url: "https://amresearchjournal.com/index.php/Journal/article/view/1416"
        },
        {
            title: "Evaluating Group-Wise Bias and Robustness in Pretrained Toxicity Classifiers",
            role: "Primary Researcher",
            institution: "Ongoing Research",
            year: "In Progress",
            description: "Investigating performance disparities across demographic groups in commercial toxicity detection models to identify and mitigate algorithmic bias.",
            url: "#"
        }
    ],

    // Skills Section
    skills: [
        "AWS Cloud Fundamentals",
        {
            text: "Programming & Frameworks",
            subItems: ["Python (PyTorch, TensorFlow)", "JavaScript/TypeScript (React, Next.js, Node.js)", "C++ for Performance"]
        },
        "Compute Provisioning & Virtual Machine Operations",
        "Full Stack Web Development",
        "Application Hosting & Deployment Workflows",
        "Monitoring, Uptime & Runtime Operations",
        "Cloud Security, Network Access & IAM Fundamentals"
    ],

    // Projects Section
    projects: [
        {
            name: "Stumbnail",
            url: "https://stumbnail.com",
            logo: "public/projects/stumbnail.png",
            description: "Commercial AI-powered YouTube thumbnail generator with paid users.",
            tags: ["AI", "SaaS", "React"]
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
            description: "Collaborative freeform whiteboard built for shared planning and visual thinking.",
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
            description: "Google Business Profile data scraper extension for collecting business leads faster.",
            tags: ["Chrome Extension", "Scraping", "Lead Gen"]
        },
        {
            name: "Pixelar",
            url: "https://pixelar.dev",
            description: "Developer toolkit for procedurally generating and animating 2D game sprites.",
            tags: ["GenAI", "GameDev", "Tools"]
        },
        {
            name: "Open Source Contributions",
            url: "https://github.com/ahmadkhattak1",
            description: "Various experiments in reinforcement learning and UI design.",
            tags: ["Open Source"]
        },
        {
            name: "Ezmoji",
            url: "https://ezmoji.ahmadyaseen.com",
            logo: "public/projects/ezmoji.png",
            description: "Browser extension for inserting emojis fast with aliases, shortcuts, and quick search.",
            tags: ["Browser Extension", "Productivity", "Emoji"]
        }
    ],

    // Certifications Section
    certifications: [
        {
            name: "AWS Certified Cloud Practitioner",
            url: "https://www.credly.com/badges/77de5c17-ab36-4ea4-89cc-b3195dfa59a9/public_url",
            previewImage: "aws-certified-cloud-practitioner.png"
        },
        {
            name: "HarvardX's CS50P (Python)",
            url: "https://courses.edx.org/certificates/eeb3c6ea512d4b7fb92f7ef0b320ea39",
            previewImage: "HardvardX-cs50p.webp"
        },
        {
            name: "Scrimba's JavaScript",
            url: "https://scrimba.com/@Ahmadkhattak1:certs;cert2CsEjr6BTAJVX14Fk3qLQUgjcAeQRirC7E",
            previewImage: "LearnJavascript-Scrimba.webp"
        },
        {
            name: "Scrimba's HTML & CSS",
            url: "https://scrimba.com/@Ahmadkhattak1:certs;cert2CsEjr6BTAJVX14Fk3qJvBZT4zue9hco8U",
            previewImage: "html-css-scrimba.webp"
        },
        {
            name: "Scrimba's Intro to UI Design Fundamentals",
            url: "https://scrimba.com/@Ahmadkhattak1:certs;cert2CsEjr6BTAJVX14Fk3qKAZkLACCSCNouDG",
            previewImage: "intro-to-design-fundamentals-scrimba.webp"
        }
    ],

    // Education Section
    education: [
        {
            degree: "BS Computer Science",
            institution: "IMSciences Peshawar",
            institutionUrl: "https://imsciences.edu.pk",
            year: "2022 - 2026",
            description: "Focus on Artificial Intelligence and Entrepreneurship."
        }
    ],

    // Experience Section
    experience: [
        {
            role: "Cloud Engineering Direction",
            company: "ClawPilot",
            companyUrl: "https://clawpilot.app",
            year: "2026 - Present",
            description: "Merged Hermes Agent hosting into ClawPilot and expanded the work into managed compute, agent runtime operations, deployment, and production availability."
        },
        {
            role: "Founder & Full-Stack SaaS Builder",
            company: "Stumbnail",
            companyUrl: "https://stumbnail.com",
            year: "2024 - Present",
            description: "Spearheading the development of AI-driven design tools. Managed full product lifecycle from MVP to market."
        },
        {
            role: "AI Architect",
            company: "Pixelar",
            companyUrl: "https://pixelar.dev",
            year: "2025 - Present",
            description: "Leading R&D on generative models for 2D animation and sprite synthesis."
        },
        {
            role: "Incubatee",
            company: "National Incubation Center (NIC)",
            companyUrl: null,
            year: "2025",
            description: "Selected for prestigious startup acceleration program to scale AI ventures."
        }
    ],

    // GitHub Activity
    github: {
        username: "ahmadkhattak1",
        chartColor: "4ade80" // Green for modern feel
    },

    // ============================================
    // TEMPLATE ATTRIBUTION
    // ============================================
    _meta: {
        author: "Ahmad Yaseen",
        github: "https://github.com/ahmadkhattak1",
        template: "personal-portfolio-pro",
        license: "Made with <3 by Ahmad Yaseen"
    }
};

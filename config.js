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
        title: "Founder | AI Engineer | Researcher",
        profileImage: "public/profile.png",
        profileImageAlt: "Profile Picture",
        currently: "Exploring Machine Learning & building Stumbnail"
    },

    // Social Links
    social: {
        email: "Ahdfactz@gmail.com",
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
        "Machine Learning & AI Architecture",
        {
            text: "Programming & Frameworks",
            subItems: ["Python (PyTorch, TensorFlow)", "JavaScript/TypeScript (React, Next.js, Node.js)", "C++ for Performance"]
        },
        "Computer Vision & NLP",
        "Full Stack Web Development",
        "Cloud Infrastructure (Firebase, GCP)",
        "Product Strategy & Execution"
    ],

    // Projects Section
    projects: [
        {
            name: "Stumbnail",
            url: "https://stumbnail.com",
            description: "Commercial AI-powered platform for generating high-CTR YouTube thumbnails.",
            tags: ["AI", "SaaS", "React"]
        },
        {
            name: "ScreenChat",
            url: "https://ahmadyaseen.com/extensions/screenchat",
            description: "AI agent Chrome extension. Chat with your screen, get help with forms, research, and tasks.",
            tags: ["AI", "Chrome Extension", "Browser Agent"]
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
        }
    ],

    // Certifications Section
    certifications: [
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
            role: "Founder & Lead Engineer",
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
        author: "Ahmad Y. Khattak",
        github: "https://github.com/ahmadkhattak1",
        template: "personal-portfolio-pro",
        license: "Made with <3 by Ahmad Y. Khattak"
    }
};

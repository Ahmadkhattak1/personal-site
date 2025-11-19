/*
 * Personal Site Configuration
 * Edit this file to customize the website with your own details
 *
 * To remove any section from the webpage:
 * - Set showSection.sectionName to false, OR
 * - Delete the entire section object from the config
 *
 * Required sections: personal, social
 * Optional sections: about, skills, projects, certifications, education, experience, github, customSections
 */

const CONFIG = {
    // Section Visibility Control
    // Set to false to hide a section completely
    showSection: {
        about: true,
        skills: true,
        projects: true,
        certifications: true,
        education: true,
        experience: true,
        github: true,
        customSections: true
    },

    // Personal Information
    personal: {
        name: "Ahmad Yaseen",
        title: "Computer Science | AI | Entrepreneurship",
        profileImage: "public/profile.png",
        profileImageAlt: "Profile Picture"
    },

    // Social Links
    social: {
        email: "Ahdfactz@gmail.com",
        github: "https://github.com/ahmadkhattak1",
        linkedin: "https://www.linkedin.com/in/AhmadYKhattak/",
        twitter: "https://x.com/AhmadYKhattak"
    },

    // About Me Section
    about: "Final year CS student building real products. I work across the stack, design systems that scale, and enjoy shipping fast. I’m currently building Stumbnail (AI thumbnail generator) and Pixelar (AI tools for 2D game assets). I like solving problems that sit at the intersection of AI, design, and product.",

    // Skills Section
    skills: [
        "Strong foundation in Computer Science",
        {
            text: "Programming",
            subItems: ["Python, C++, C", "Web: HTML, CSS, Javascript, React, Nextjs", "Data Science: Numpy, Pandas"]
        },
        "Strong problem solving",
        "AI driven image generation workflows",
        "Frontend and backend development",
        "UI design fundamentals"

    ],

    // Projects Section
    projects: [
        {
            name: "Stumbnail",
            url: "https://stumbnail.com",
            description: "AI-powered thumbnail generator"
        },
        {
            name: "Pixelar",
            url: "https://pixelar.dev",
            description: "Toolkit for indie game developers to generate and animate 2D assets using AI."
        },
        {
            name: "View more on github",
            url: "https://github.com/ahmadkhattak1",
            description: "Small tools and experiments in React, Python, and UI design on GitHub."
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
            degree: "Bachelor's of Computer Science",
            institution: "IMSciences Peshawar",
            institutionUrl: null,
            year: "2022-2026",
            description: "Specializing in Computer Science and AI"
        }
    ],

    // Experience Section
    experience: [
        {
            role: "Founder & Developer",
            company: "Stumbnail",
            companyUrl: "https://stumbnail.com",
            year: "2024",
            description: "Built AI-powered thumbnail generator. Led product development from ideation to launch."
        },
        {
            role: "Startup Incubation",
            company: "NIC Peshawar",
            companyUrl: null,
            year: "2025",
            description: "Selected for National Incubation Center program to develop Stumbnail."
        },
        {
            role: "Developer",
            company: "Asset generator and animator for indie devs",
            companyUrl: null,
            year: "2025",
            description: "Currently building as FYP"
        }
    ],

    // GitHub Activity
    // Enter your github username.
    github: {
        username: "ahmadkhattak1",
        chartColor: "DC143C" // Red color for contribution chart
    },

    // ============================================
    // TEMPLATE ATTRIBUTION - DO NOT MODIFY
    // Required for template to function properly
    // Keeps template free for everyone!
    // ============================================
    _meta: {
        author: "Ahmad Y. Khattak",
        github: "https://github.com/ahmadkhattak1",
        template: "personal-portfolio-v1",
        license: "Made with <3 by Ahmad Y. Khattak"
    }
    // ============================================
};

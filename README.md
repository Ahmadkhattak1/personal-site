# Personal Portfolio Site

A simple, clean portfolio website with a minimalist design. Perfect for developers, students, and anyone who wants a professional online presence.

**[View Live Demo →](https://ahmadyaseen.com)**

## Quick Summary (TL;DR)

1. Edit `config.js` with your info
2. Add your photo to the `public` folder
3. Deploy to [Netlify](https://netlify.com) (free, drag and drop)
4. Done! Your site is live with a working contact form

## How to Use This Template

### Step 1: Get Your Copy
1. Download or clone this repository to your computer
2. Open the folder in your code editor

### Step 2: Add Your Information
Open the `config.js` file and replace my information with yours. This one file controls everything on the website - your name, links, projects, skills, etc.

### Step 3: Add Your Photos
- Put your profile picture in the `public` folder (name it `profile.png` or update the path in config.js)
- If you have certificates, put their images in the `public/certs` folder

### Step 4: Deploy (see detailed steps below)

## Editing Your Information

Everything you need to change is in `config.js`. Open it and you'll see clearly marked sections:

### What You Can Edit

**Your Name and Title**
Change your name and what you do (like "Computer Science Student" or "Full Stack Developer")

**Social Links**
Add your email, GitHub, LinkedIn, and X (Twitter) links

**About Me**
Write a short paragraph about yourself

**Skills**
List your skills - programming languages, tools, whatever you want to show

**Projects**
Add your projects with links and descriptions

**Certifications**
Add your certificates or courses you've completed

**Experience**
Add your work experience, internships, or any relevant experience

**GitHub Activity**
Shows your GitHub contribution chart (just add your GitHub username)

**Custom Sections**
Want to add something else? Like hobbies or achievements? You can add custom sections too!

### Hiding Sections You Don't Want

Don't have certifications yet? No problem! You can hide any section:

**Option 1:** In config.js, find `showSection` and set the section to `false`:
```javascript
showSection: {
    certifications: false,  // This section won't show up
    experience: false       // This one too
}
```

**Option 2:** Just delete that section's data from config.js

Note: You must keep `personal` (your name) and `social` (your links). Everything else is optional!

## Cool Features

- Works on phones, tablets, and computers
- Hover over certificates to see a preview image
- Click your profile picture to see it bigger
- Contact form that actually works (sends messages to your email)
- Shows your GitHub activity automatically

## Contact Form Setup

The contact form is already set up! When you deploy to Netlify (see below), it will automatically work. Here's what happens:

1. Someone fills out the form on your site
2. Netlify captures the submission
3. You get notified via email
4. You can see all submissions in your Netlify dashboard

**No coding required!** Just deploy to Netlify and the form works.

To check your form submissions:
1. Log into Netlify
2. Go to your site
3. Click "Forms" in the menu
4. See all messages people sent you

## How to Deploy to Netlify (Free)

Netlify is free and super easy. Here's how:

### Method 1: Drag and Drop (Easiest)
1. Go to [netlify.com](https://netlify.com) and sign up (it's free)
2. After logging in, you'll see a box that says "Drag and drop your site folder here"
3. Drag your entire project folder into that box
4. Wait a few seconds
5. Done! Netlify gives you a link like `your-site-name.netlify.app`

### Method 2: Connect GitHub (Better for updates)
1. Push your code to GitHub first
2. Go to [netlify.com](https://netlify.com) and log in
3. Click "Add new site" → "Import an existing project"
4. Choose "GitHub" and give Netlify permission
5. Select your repository
6. Click "Deploy site"
7. Done! Now whenever you push to GitHub, your site updates automatically

### After Deploying
- Your site will be live at `something.netlify.app`
- You can change the name in Site Settings
- The contact form will work automatically (no extra setup needed!)

### Custom Domain (Optional)
Want your own domain like `yourname.com`?
1. Buy a domain from any provider (Namecheap, GoDaddy, etc.)
2. In Netlify, go to Site Settings → Domain Management
3. Click "Add custom domain"
4. Follow the instructions to connect it

## Other Deployment Options

You can also use:
- **Vercel**: Similar to Netlify, connect your GitHub repo
- **GitHub Pages**: Free, but contact form won't work (needs a backend)
- **Cloudflare Pages**: Similar to Netlify

## Important: Keep the Attribution

This template is **completely free** to use! The only thing I ask is that you keep the small "template by Ahmad Y. Khattak" link in the footer.

Why? It helps other people find this template too!

What you need to keep:
- The small footer link (it's subtle, don't worry)
- The `_meta` section in config.js (just don't delete it)
- The comments at the top of the code files

That's it! Everything else is yours to customize.

## Common Questions

**Q: The contact form isn't working!**
A: Make sure you deployed to Netlify. The form only works when deployed, not when you open index.html locally on your computer.

**Q: My profile picture isn't showing**
A: Check that the image is in the `public` folder and the filename in config.js matches exactly (including the extension like .png or .jpg)

**Q: Can I use this for my business/client?**
A: Yes! It's completely free for personal and commercial use. Just keep the small attribution in the footer.

**Q: I don't have GitHub activity/certifications/experience yet**
A: No problem! Just hide those sections in the config.js file by setting them to false in the `showSection` part.

**Q: How do I test it before deploying?**
A: Just open index.html in your browser. Everything will work except the contact form (that needs Netlify).

**Q: Can I remove the footer attribution?**
A: Please don't! It's a small link that helps others discover the template. It keeps the template free for everyone.

## Credits

Made with <3 by Ahmad Y. Khattak

- GitHub: [github.com/ahmadkhattak1](https://github.com/ahmadkhattak1)
- LinkedIn: [linkedin.com/in/AhmadYKhattak](https://www.linkedin.com/in/AhmadYKhattak/)
- X: [@AhmadYKhattak](https://x.com/AhmadYKhattak)

Feel free to use this template for your own portfolio!

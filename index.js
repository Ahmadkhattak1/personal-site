// Profile Picture Lightbox
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

// Contact Form Toggle
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

form.addEventListener('submit', function(e) {
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

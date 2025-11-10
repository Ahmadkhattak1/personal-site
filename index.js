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

form.addEventListener('submit', (e) => {
    originalText = submitBtn.textContent;
    submitBtn.textContent = 'sending...';
    submitBtn.disabled = true;
});

// Handle form success
form.addEventListener('submit', function(e) {
    fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
    }).then(() => {
        submitBtn.textContent = 'sent! ✓';
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            form.reset();
            contactForm.classList.add('hidden');
        }, 2000);
    }).catch(error => {
        submitBtn.textContent = 'error';
        submitBtn.disabled = false;
        console.error('Error:', error);
    });
});

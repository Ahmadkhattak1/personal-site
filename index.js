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

// Form Submission
const form = document.querySelector('.contact-form form');
const submitBtn = document.querySelector('.submit-btn');

form.addEventListener('submit', (e) => {
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'sending...';
    submitBtn.disabled = true;
});

// Success message
form.addEventListener('reset', () => {
    setTimeout(() => {
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.textContent = originalText || 'send >';
        submitBtn.disabled = false;
    }, 500);
});

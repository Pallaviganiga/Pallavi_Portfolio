// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', function(e){
    const href = this.getAttribute('href');
    if (href.length > 1) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
      // close mobile nav after click
      if (nav.classList.contains('open')) nav.classList.remove('open');
    }
  });
});

// Contact form: submit via Web3Forms and show inline status
const form = document.getElementById('contact-form');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const statusEl = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  if (statusEl) statusEl.textContent = 'Sending…';
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
  const nameRaw = document.getElementById('name').value.trim();
  const emailRaw = document.getElementById('email').value.trim();
  const messageRaw = document.getElementById('message').value.trim();
  
  // Basic client-side validation
  if (!nameRaw || !emailRaw || !messageRaw) {
    if (statusEl) statusEl.textContent = 'Please fill in all fields.';
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
    return;
  }

  // Require Web3Forms access key in hidden input
  const accessKeyInput = document.getElementById('w3f-key');
  const accessKey = accessKeyInput ? String(accessKeyInput.value || '') : '';
  if (!accessKey || /REPLACE_WITH_WEB3FORMS_KEY/i.test(accessKey)) {
    if (statusEl) statusEl.textContent = 'Form not configured. Add your Web3Forms access key.';
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
    return;
  }

  // Build form data for Web3Forms
  const fd = new FormData(form);
  fd.set('name', nameRaw);
  fd.set('email', emailRaw);
  fd.set('message', messageRaw);

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: fd
    });
    const data = await res.json();
    if (data && data.success) {
      if (statusEl) statusEl.textContent = 'Message sent successfully!';
      showToast('Message sent');
      form.reset();
    } else {
      if (statusEl) statusEl.textContent = (data && data.message) ? data.message : 'Something went wrong. Please try again.';
    }
  } catch (err) {
    if (statusEl) statusEl.textContent = 'Network error. Please try again.';
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
  }
});

// Project card flip functionality
document.querySelectorAll('.project-card').forEach(card => {
  const cardInner = card.querySelector('.card-inner');
  let isFlipped = false;
  
  // Click to flip
  card.addEventListener('click', (e) => {
    // Don't flip if clicking on links
    if (e.target.closest('a')) return;
    
    isFlipped = !isFlipped;
    if (isFlipped) {
      cardInner.style.transform = 'rotateY(180deg)';
    } else {
      cardInner.style.transform = 'rotateY(0deg)';
    }
  });
  
  // Add hover effect for better UX
  card.addEventListener('mouseenter', () => {
    if (!isFlipped) {
      cardInner.style.transform = 'rotateY(5deg) scale(1.02)';
    }
  });
  
  card.addEventListener('mouseleave', () => {
    if (!isFlipped) {
      cardInner.style.transform = 'rotateY(0deg) scale(1)';
    }
  });
});

// Simple appear animation using intersection observer
const appearEls = document.querySelectorAll('.project-card, .skill, .stat, .hero-card, .about-text');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.transform = 'translateY(0)';
      entry.target.style.opacity = '1';
      io.unobserve(entry.target);
    }
  });
}, {threshold: 0.12});

appearEls.forEach(el=>{
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'all 600ms cubic-bezier(.2,.9,.3,1)';
  io.observe(el);
});

// Copy-to-clipboard for About card
function copyTextFromSelector(selector){
  const el = document.querySelector(selector);
  if(!el) return;
  const text = el.textContent.trim();
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(()=>showToast('Copied'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast('Copied'); } catch(e) {}
    document.body.removeChild(ta);
  }
}

document.querySelectorAll('.copy-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const target = btn.getAttribute('data-copy');
    if (target) copyTextFromSelector(target);
  })
});

// Email links: prefer opening Gmail compose with prefilled "to"
document.querySelectorAll('a.email-link').forEach(link => {
  link.addEventListener('click', (e) => {
    const email = link.getAttribute('data-email') || link.getAttribute('href').replace('mailto:', '');
    if (!email) return;
    const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(email);
    // Try opening Gmail; if blocked, the default link is mailto fallback
    e.preventDefault();
    const win = window.open(gmailUrl, '_blank');
    if (!win) {
      window.location.href = 'mailto:' + email;
    }
  });
});

// Tiny toast
let toastEl;
function showToast(message){
  if(!toastEl){
    toastEl = document.createElement('div');
    toastEl.style.position='fixed'; toastEl.style.bottom='20px'; toastEl.style.left='50%'; toastEl.style.transform='translateX(-50%)';
    toastEl.style.background='#111827'; toastEl.style.color='#fff'; toastEl.style.padding='8px 12px'; toastEl.style.borderRadius='10px'; toastEl.style.boxShadow='var(--shadow)'; toastEl.style.zIndex='1000'; toastEl.style.transition='opacity .3s ease';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.style.opacity='1';
  clearTimeout(showToast._t); showToast._t = setTimeout(()=>{ toastEl.style.opacity='0'; }, 1200);
}

// CV button: direct download only. Ensure the file exists at assets/pallavi_resume.pdf
// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT MENU - Right Click Handler
// ═══════════════════════════════════════════════════════════════════════════

let contextMenu = null;

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  showContextMenu(e.clientX, e.clientY);
});

function showContextMenu(x, y) {
  // Remove existing menu if any
  if (contextMenu) {
    contextMenu.remove();
  }

  // Create menu element
  contextMenu = document.createElement('div');
  contextMenu.id = 'context-menu';
  contextMenu.className = 'context-menu';
  contextMenu.style.left = (x + 10) + 'px';
  contextMenu.style.top = (y + 10) + 'px';
  contextMenu.innerHTML = 'Need help? Contact us at <a href="mailto:rae@byraeform.com">rae@byraeform.com</a>';
  
  document.body.appendChild(contextMenu);

  // Animation: fade in & scale
  contextMenu.style.animation = 'contextMenuIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';

  // Close menu on click anywhere
  document.addEventListener('click', closeContextMenu);
  document.addEventListener('contextmenu', closeContextMenu);
}

function closeContextMenu() {
  if (contextMenu) {
    contextMenu.style.animation = 'contextMenuOut 0.25s ease forwards';
    setTimeout(() => {
      contextMenu?.remove();
      contextMenu = null;
    }, 250);
  }
  document.removeEventListener('click', closeContextMenu);
  document.removeEventListener('contextmenu', closeContextMenu);
}

// ═══════════════════════════════════════════════════════════════════════════
// CURSOR TRACKING
// ═══════════════════════════════════════════════════════════════════════════

const cur = document.getElementById('cur');
const curR = document.getElementById('cur-r');

document.addEventListener('mousemove', (e) => {
  if (cur && curR) {
    cur.style.left = e.clientX + 'px';
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
    curR.style.left = e.clientX + 'px';
    curR.style.top = e.clientY + 'px';
  }
});

document.addEventListener('mouseenter', () => {
  if (cur && curR) {
    cur.style.opacity = '1';
    curR.style.opacity = '1';
  }
});

document.addEventListener('mouseleave', () => {
  if (cur && curR) {
    cur.style.opacity = '0';
    curR.style.opacity = '0';
  }
});

// Hover effect on interactive elements
const hoverElements = document.querySelectorAll('a, button, input, textarea, select');
hoverElements.forEach((el) => {
  el.addEventListener('mouseenter', () => {
    document.body.classList.add('hov');
  });
  el.addEventListener('mouseleave', () => {
    document.body.classList.remove('hov');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

function toggleMob() {
  const mob = document.getElementById('mob');
  if (mob) {
    mob.classList.toggle('open');
  }
}

// Update active nav link
function updateActiveNav() {
  const currentPage = document.body.getAttribute('data-page');
  const navLinks = document.querySelectorAll('.nl');
  
  navLinks.forEach((link) => {
    link.classList.remove('act');
    const href = link.getAttribute('href');
    if (
      (currentPage === 'home' && href === 'index.html') ||
      (currentPage === 'about' && href === 'about.html') ||
      (currentPage === 'services' && href === 'services.html') ||
      (currentPage === 'contact' && href === 'contact.html')
    ) {
      link.classList.add('act');
    }
  });
}

updateActiveNav();

// Close mobile menu on nav link click
document.querySelectorAll('.mob-menu .nl').forEach((link) => {
  link.addEventListener('click', () => {
    const mob = document.getElementById('mob');
    if (mob) {
      mob.classList.remove('open');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL NAV BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 42) {
      nav.classList.add('sc');
    } else {
      nav.classList.remove('sc');
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICES PAGE - Accordion
// ═══════════════════════════════════════════════════════════════════════════

const svcItems = document.querySelectorAll('.svc-item');
svcItems.forEach((item) => {
  item.addEventListener('click', () => {
    // Close other items
    svcItems.forEach((other) => {
      if (other !== item) {
        other.classList.remove('open');
      }
    });
    // Toggle current item
    item.classList.toggle('open');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTIMONIALS - Carousel
// ═══════════════════════════════════════════════════════════════════════════

let currentSlide = 0;

function updateTestimonials() {
  const slides = document.querySelectorAll('.ts-slide');
  const dots = document.querySelectorAll('.t-dot');

  slides.forEach((slide, idx) => {
    slide.style.display = idx === currentSlide ? 'block' : 'none';
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('on', idx === currentSlide);
  });

  const track = document.querySelector('.ts-slides');
  if (track) {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
}

document.querySelectorAll('.t-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const slides = document.querySelectorAll('.ts-slide');
    const isNext = btn.textContent.includes('→');

    if (isNext) {
      currentSlide = (currentSlide + 1) % slides.length;
    } else {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    }

    updateTestimonials();
  });
});

document.querySelectorAll('.t-dot').forEach((dot, idx) => {
  dot.addEventListener('click', () => {
    currentSlide = idx;
    updateTestimonials();
  });
});

updateTestimonials();

// ═══════════════════════════════════════════════════════════════════════════
// POPUPS
// ═══════════════════════════════════════════════════════════════════════════

function openPop(id) {
  const overlay = document.getElementById(`${id}-overlay`);
  if (overlay) {
    overlay.classList.add('on');
  }
}

function closePop(id) {
  const overlay = document.getElementById(`${id}-overlay`);
  if (overlay) {
    overlay.classList.remove('on');
  }
}

// Close popup on overlay click
document.querySelectorAll('.overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('on');
    }
  });

  // Close on X button click
  const closeBtn = overlay.querySelector('.pop-x');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('on');
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FORM SUBMISSION
// ═══════════════════════════════════════════════════════════════════════════

const contactForm = document.querySelector('form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    try {
      // Replace with your actual form submission endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showToast('Message sent! We'll get back to you soon.', 'success');
        contactForm.reset();
      } else {
        showToast('Something went wrong. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Error sending message. Please try again.', 'error');
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast on';
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  const iconColor = type === 'success' ? 'var(--blue-glow)' : type === 'error' ? '#ff6b6b' : 'var(--muted)';
  
  toast.innerHTML = `
    <div class="t-ico" style="color: ${iconColor};">${icon}</div>
    <div class="t-msg">${message}</div>
  `;
  
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('on');
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

// ═══════════════════════════════════════════════════════════════════════════
// REVEAL ON SCROLL
// ═══════════════════════════════════════════════════════════════════════════

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('vis');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.rv').forEach((el) => {
  observer.observe(el);
});

// ═══════════════════════════════════════════════════════════════════════════
// MARQUEE ANIMATION
// ═══════════════════════════════════════════════════════════════════════════

const marqueeInner = document.querySelector('.marq-inner');
if (marqueeInner) {
  // Clone content for seamless loop
  const clone = marqueeInner.innerHTML;
  marqueeInner.innerHTML += clone;
}

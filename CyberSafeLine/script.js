/* ============================================================
   CYBERSAFELINE — script.js
   Firebase + Cursor + Scroll + Parallax + Reviews Mejorado
   ============================================================ */

// ── 1. IMPORTACIONES DE FIREBASE ────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAsfBWdl9eLDjXCALrkrhnwclgKaoujLjs",
    authDomain: "cybersafeline-7e039.firebaseapp.com",
    projectId: "cybersafeline-7e039",
    storageBucket: "cybersafeline-7e039.firebasestorage.app",
    messagingSenderId: "783490416124",
    appId: "1:783490416124:web:a7e0b96e5ea347876b8679",
    measurementId: "G-JL651J4PPD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ── THEME SYSTEM ─────────────────────────────────────────────
(function initTheme() {
  const html = document.documentElement;
  const saved = localStorage.getItem('csl_theme');
  const firstVisit = !localStorage.getItem('csl_theme_chosen');

  if (saved) html.dataset.theme = saved;

  document.addEventListener('DOMContentLoaded', () => {
    const modal       = document.getElementById('themeModal');
    const chooseDark  = document.getElementById('chooseDark');
    const chooseLight = document.getElementById('chooseLight');
    const toggle      = document.getElementById('themeToggle');

    function setTheme(theme, save = true) {
      html.dataset.theme = theme;
      if (save) {
        localStorage.setItem('csl_theme', theme);
        localStorage.setItem('csl_theme_chosen', '1');
      }
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.add('hidden');
      setTimeout(() => { modal.style.display = 'none'; }, 380);
    }

    if (firstVisit && modal) {
      modal.style.display = 'flex';
      if (chooseDark)  chooseDark.addEventListener('click',  () => { setTheme('dark');  closeModal(); });
      if (chooseLight) chooseLight.addEventListener('click', () => { setTheme('light'); closeModal(); });
    } else {
      if (modal) modal.style.display = 'none';
    }

    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = html.dataset.theme === 'light' ? 'light' : 'dark';
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  });
})();

// ── 2. CUSTOM CURSOR ────────────────────────────────────────
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (window.matchMedia('(pointer: fine)').matches && cursorDot) {
  cursorDot.style.display = 'block';
  cursorOutline.style.display = 'block';

  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 250, fill: "forwards" });
  });

  const interactables = document.querySelectorAll('a, button, input, select, textarea, .service-card, .mvv-card, .pricing-card, .sede-item, .poland-mini, .cursos-card, .guias-card');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorOutline.classList.add('hover');
      cursorDot.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursorOutline.classList.remove('hover');
      cursorDot.classList.remove('hover');
    });
  });
}

// ── 3. NAVBAR & MOBILE MENU ─────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if(navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
});

const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if(navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        navToggle.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
        });
    });
}

// ── 4. SCROLL REVEAL ────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const siblings = entry.target.parentElement.querySelectorAll('[data-reveal]');
      let delay = 0;
      siblings.forEach((el, idx) => {
        if (el === entry.target) delay = idx * 100;
      });
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ── 5. ANIMATED COUNTERS ────────────────────────────────────
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter[data-target]').forEach(el => counterObserver.observe(el));

// ── 6. CONTACT FORM (Formspree nativo) ──────────────────────
// El formulario envía directamente a Formspree con action y method POST

// ── 7. ACTIVE NAV LINK ON SCROLL ───────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === `#${id}`) a.style.color = 'var(--teal)';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ── 8. HEX GRID PARALLAX ────────────────────────────────────
const hexBg = document.querySelector('.hex-bg');
let mouseX = 0, mouseY = 0;
let currentX = 0, currentY = 0;

window.addEventListener('mousemove', (e) => {
  if (!hexBg) return;
  mouseX = (e.clientX / window.innerWidth - 0.5) * 30;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 30;
});

function animateParallax() {
  if (hexBg) {
    currentX += (mouseX - currentX) * 0.1;
    currentY += (mouseY - currentY) * 0.1;
    hexBg.style.transform = `translate(${currentX}px, ${currentY}px)`;
  }
  requestAnimationFrame(animateParallax);
}
animateParallax();

// ── 9. LÓGICA DE VALORACIONES (FIREBASE FIRESTORE) ──────────
document.addEventListener('DOMContentLoaded', () => {

  const sidebar = document.getElementById('reviewsSidebar');
  const tab = document.getElementById('reviewsTab');
  const close = document.getElementById('closeReviews');

  if(tab) tab.onclick = () => sidebar.classList.toggle('open');
  if(close) close.onclick = () => sidebar.classList.remove('open');

  // ── Star Rating Selector ──────────────────────────────────
  const starSelector = document.querySelectorAll('.star-select');
  const revStarsHidden = document.getElementById('revStars');
  const starRatingText = document.getElementById('starRatingText');

  const ratingLabels = ['', 'Malo', 'Regular', 'Correcto', 'Muy bueno', 'Excelente'];

  function updateStars(value) {
    starSelector.forEach((s, i) => {
      s.textContent = i < value ? '★' : '☆';
      s.classList.toggle('active', i < value);
    });
    revStarsHidden.value = value;
    if (starRatingText) {
      starRatingText.textContent = value > 0 ? ratingLabels[value] : 'Selecciona';
    }
  }

  starSelector.forEach(star => {
    star.addEventListener('click', () => {
      updateStars(parseInt(star.dataset.value));
    });
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.value);
      starSelector.forEach((s, i) => {
        s.textContent = i < val ? '★' : '☆';
      });
    });
    star.addEventListener('mouseleave', () => {
      const selected = parseInt(revStarsHidden.value) || 0;
      updateStars(selected);
    });
  });

  // ── Character Counter ────────────────────────────────────
  const revText = document.getElementById('revText');
  const charCount = document.getElementById('charCount');
  if (revText && charCount) {
    revText.addEventListener('input', () => {
      const len = revText.value.length;
      charCount.textContent = len;
      if (len >= 480) charCount.style.color = '#e74c3c';
      else charCount.style.color = '';
    });
  }

  // ── Update display rating ─────────────────────────────────
  function updateRatingDisplay(reviews) {
    const avgEl = document.getElementById('reviewsAvg');
    const starsDisplay = document.getElementById('reviewsStarsDisplay');
    const countEl = document.getElementById('reviewsCount');

    if (!avgEl || !starsDisplay || !countEl) return;

    const total = reviews.length;
    if (total === 0) {
      avgEl.textContent = '0.0';
      countEl.textContent = '0 valoraciones';
      starsDisplay.querySelectorAll('.star').forEach(s => {
        s.textContent = '☆';
        s.className = 'star empty';
      });
      return;
    }

    const sum = reviews.reduce((acc, r) => acc + (r.estrellas || 0), 0);
    const avg = (sum / total).toFixed(1);
    avgEl.textContent = avg;

    const rounded = Math.round(parseFloat(avg));
    starsDisplay.querySelectorAll('.star').forEach((s, i) => {
      s.textContent = i < rounded ? '★' : '☆';
      s.className = i < rounded ? 'star filled' : 'star empty';
    });

    countEl.textContent = `${total} valoración${total !== 1 ? 'es' : ''}`;
  }

  // ── Format Firestore Timestamp ────────────────────────────
  function formatTimestamp(ts) {
    if (!ts) return '';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000*60*60*24));
      if (days === 0) return 'Hoy';
      if (days === 1) return 'Ayer';
      if (days < 7) return `Hace ${days} días`;
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch(e) {
      return '';
    }
  }

  // ── Render Reviews from Firestore ─────────────────────────
  const list = document.getElementById('reviewsList');
  let allReviews = [];

  if (list) {
    const q = query(collection(db, "valoraciones"), orderBy("fecha", "desc"));
    onSnapshot(q, (snap) => {
      allReviews = [];
      list.innerHTML = '';
      if (snap.empty) {
        list.innerHTML = `
          <div class="empty-reviews">
            <div class="empty-reviews-icon">💬</div>
            <span>No hay valoraciones aún.</span>
            <span style="font-size:.75rem;opacity:.6">¡Sé el primero en dejar tu huella!</span>
          </div>`;
        updateRatingDisplay([]);
        return;
      }
      snap.forEach(doc => {
        const d = doc.data();
        allReviews.push(d);
        const stars = d.estrellas || 0;
        const fecha = formatTimestamp(d.fecha);
        list.innerHTML += `
          <div class="rev-card">
            <div class="rev-card-header">
              <span class="rev-card-name">${escHtml(d.nombre)}</span>
              <span class="rev-card-date">${fecha}</span>
            </div>
            <div class="rev-card-stars">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</div>
            <p class="rev-card-text">"${escHtml(d.comentario)}"</p>
          </div>`;
      });
      updateRatingDisplay(allReviews);
    });
  }

  function escHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Submit Review ─────────────────────────────────────────
  const reviewForm = document.getElementById('reviewForm');
  const formMsg = document.getElementById('reviewFormMsg');

  if (reviewForm) {
    reviewForm.onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      const btnText = btn.querySelector('.btn-text');
      const btnSpinner = btn.querySelector('.btn-spinner');
      const name = document.getElementById('revName').value.trim();
      const stars = parseInt(document.getElementById('revStars').value);
      const comment = document.getElementById('revText').value.trim();

      // Validation
      if (!name) {
        showFormMsg('Por favor, introduce tu nombre o empresa.', 'error');
        return;
      }
      if (!stars || stars < 1) {
        showFormMsg('Por favor, selecciona una puntuación.', 'error');
        return;
      }
      if (!comment || comment.length < 5) {
        showFormMsg('El comentario debe tener al menos 5 caracteres.', 'error');
        return;
      }
      if (comment.length > 500) {
        showFormMsg('El comentario no puede superar los 500 caracteres.', 'error');
        return;
      }

      btn.disabled = true;
      if (btnText) btnText.textContent = 'PROCESANDO...';
      if (btnSpinner) btnSpinner.style.display = 'inline-block';

      try {
        await addDoc(collection(db, "valoraciones"), {
          nombre: name,
          estrellas: stars,
          comentario: comment,
          fecha: serverTimestamp()
        });
        reviewForm.reset();
        updateStars(0);
        if (charCount) charCount.textContent = '0';
        showFormMsg('✅ ¡Valoración publicada correctamente!', 'success');
        if (btnText) btnText.textContent = '¡ENVIADO!';
        setTimeout(() => {
          if (btnText) btnText.textContent = 'Publicar valoración';
          btn.disabled = false;
          if (btnSpinner) btnSpinner.style.display = 'none';
          sidebar.classList.remove('open');
          showFormMsg('', '');
        }, 2000);
      } catch (err) {
        console.error("Error:", err);
        showFormMsg('❌ Error al publicar. Inténtalo de nuevo.', 'error');
        if (btnText) btnText.textContent = 'Publicar valoración';
        btn.disabled = false;
        if (btnSpinner) btnSpinner.style.display = 'none';
      }
    };
  }

  function showFormMsg(msg, type) {
    if (!formMsg) return;
    formMsg.textContent = msg;
    formMsg.className = 'form-msg';
    if (msg && type) formMsg.classList.add(type);
  }
});



console.log('%cCyberSafeLine 🛡️ — Sistema Integrado Correctamente', 'color:#00c8b4;font-size:14px;font-weight:bold;');
(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     PASSWORD PROTECTION — Obfuscated
     ═══════════════════════════════════════════ */
  const _0x4f2a = [49,50,51,52];
  const _0x8b1c = _0x4f2a.map(function(c){return String.fromCharCode(c);}).join('');

  const projects = [
    {
      name: 'Curriculum',
      path: 'Curriculum/curriculum.html',
      icon: '📄',
      desc: 'Mi currículum vitae con experiencia, formación y habilidades profesionales.',
      tags: ['html', 'css', 'js'],
    },
    {
      name: 'CyberSafeLine',
      path: 'CyberSafeLine/index.html',
      icon: '🛡️',
      desc: 'Servicios de ciberseguridad profesional: pentesting, formación y consultoría.',
      tags: ['html', 'css', 'js'],
    },
    {
      name: 'Tarjetas Gráficas JM',
      path: 'TarjetasGraficas-JM/public/index.html',
      icon: '🎮',
      desc: 'Comparativa y análisis de tarjetas gráficas con ranking, favoritos y foro.',
      tags: ['html', 'css', 'js'],
    },
    {
      name: 'Ultimate Calculadora',
      path: 'ultimatecalculadora/index.html',
      icon: '🧮',
      desc: 'Calculadora científica completa con trigonometría, logaritmos, factorial y más.',
      tags: ['html', 'css', 'js'],
    },
    {
      name: 'Zombie Strike',
      path: 'shooter/index.html',
      icon: '🧟',
      desc: 'Shooter zombie FPS: 14 tipos de zombies, 10 armas, oleadas infinitas, 5 biomas, jefes, clima dinámico, logros.',
      tags: ['html', 'css', 'js', 'threejs', 'webgl'],
    },
    {
      name: 'X0GPT',
      path: 'X0GPT/index.html',
      icon: '⚡',
      desc: 'X0GPT: Asistente IA de supervivencia con acceso a internet, base de conocimientos y manual completo offline.',
      tags: ['html', 'css', 'js', 'ai', 'survival'],
    },
    {
      name: 'Otros Proyectos',
      path: 'proyectosocultos/',
      icon: '🔐',
      desc: 'Proyectos privados protegidos con contraseña. Solo accesible con autorización.',
      tags: ['privado'],
      locked: true,
    },
  ];

  /* ---- Canvas particles ---- */

  /* ---- Canvas particles ---- */
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = -1000;
  let mouseY = -1000;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        this.x -= dx * 0.005;
        this.y -= dy * 0.005;
      }
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 200, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(150, 150, 220, ${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  /* ---- Avatar toggle ---- */
  const avatar = document.getElementById('avatar');
  avatar.addEventListener('click', () => {
    avatar.classList.toggle('flipped');
  });

  /* ---- Render projects ---- */
  const container = document.getElementById('projects');
  const searchInput = document.getElementById('searchInput');
  const projectCount = document.getElementById('projectCount');

  function renderProjects(filter) {
    container.innerHTML = '';
    const filtered = filter
      ? projects.filter((p) =>
          p.name.toLowerCase().includes(filter) || p.desc.toLowerCase().includes(filter)
        )
      : projects;

    projectCount.textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = '<div class="no-results">No se encontraron proyectos</div>';
      return;
    }

    filtered.forEach((p) => {
      const card = document.createElement('a');
      card.href = p.locked ? '#' : p.path;
      card.className = 'project-card' + (p.locked ? ' locked' : '');
      card.innerHTML = `
        <div class="card-top">
          <span class="card-icon">${p.icon}</span>
          <span class="card-arrow">${p.locked ? '' : '→'}</span>
        </div>
        <h2>${p.name}</h2>
        <p>${p.desc}</p>
        <div class="card-tags">
          ${p.tags.map((t) => `<span class="tag ${p.locked ? 'lock-badge' : 'tag-' + t}">${t}</span>`).join('')}
        </div>
      `;

      if (p.locked) {
        card.addEventListener('click', function(e) {
          e.preventDefault();
          openPasswordModal(p.path);
        });
      } else {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
          card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
        });
      }

      container.appendChild(card);
    });
  }

  renderProjects('');

  searchInput.addEventListener('input', (e) => {
    renderProjects(e.target.value.toLowerCase().trim());
  });

  /* ---- Password Modal ---- */
  const modal = document.getElementById('passwordModal');
  const passwordInput = document.getElementById('passwordInput');
  const modalError = document.getElementById('modalError');
  const modalConfirm = document.getElementById('modalConfirm');
  const modalCancel = document.getElementById('modalCancel');
  const togglePassword = document.getElementById('togglePassword');
  let pendingRedirect = null;

  function openPasswordModal(targetPath) {
    pendingRedirect = targetPath;
    passwordInput.value = '';
    modalError.classList.remove('visible');
    modal.classList.add('active');
    setTimeout(function() { passwordInput.focus(); }, 100);
  }

  function closePasswordModal() {
    modal.classList.remove('active');
    pendingRedirect = null;
    passwordInput.value = '';
    modalError.classList.remove('visible');
  }

  function attemptAccess() {
    if (passwordInput.value === _0x8b1c) {
      window.location.href = pendingRedirect;
    } else {
      modalError.classList.add('visible');
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  if (modalConfirm) {
    modalConfirm.addEventListener('click', attemptAccess);
  }

  if (modalCancel) {
    modalCancel.addEventListener('click', closePasswordModal);
  }

  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closePasswordModal();
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') attemptAccess();
      if (e.key === 'Escape') closePasswordModal();
    });
  }

  if (togglePassword) {
    togglePassword.addEventListener('click', function() {
      var isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePassword.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closePasswordModal();
    }
  });
})();

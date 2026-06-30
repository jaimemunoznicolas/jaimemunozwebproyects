(function () {
  'use strict';

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
      card.href = p.path;
      card.className = 'project-card';
      card.innerHTML = `
        <div class="card-top">
          <span class="card-icon">${p.icon}</span>
          <span class="card-arrow">→</span>
        </div>
        <h2>${p.name}</h2>
        <p>${p.desc}</p>
        <div class="card-tags">
          ${p.tags.map((t) => `<span class="tag tag-${t}">${t}</span>`).join('')}
        </div>
      `;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
      container.appendChild(card);
    });
  }

  renderProjects('');

  searchInput.addEventListener('input', (e) => {
    renderProjects(e.target.value.toLowerCase().trim());
  });
})();

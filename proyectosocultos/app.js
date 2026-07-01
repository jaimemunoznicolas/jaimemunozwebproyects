(function () {
  'use strict';

  const projects = [
    {
      name: 'Geometry Kirk',
      path: 'GeometryKirk/index.html',
      icon: '🔺',
      desc: 'Juego arcade frenético: salta, esquiva obstáculos y enfrenta jefes en un mundo lleno de ritmo y velocidad.',
      tags: ['python', 'game'],
    },
  ];

  /* ---- Canvas particles (red theme) ---- */
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
      ctx.fillStyle = 'rgba(239, 100, 100, ' + this.opacity + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < 100; i++) particles.push(new Particle());

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
          ctx.strokeStyle = 'rgba(200, 100, 100, ' + (0.15 * (1 - dist / 120)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p) { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  /* ---- Avatar toggle ---- */
  var avatar = document.getElementById('avatar');
  avatar.addEventListener('click', function () {
    avatar.classList.toggle('flipped');
  });

  /* ---- Render projects ---- */
  var container = document.getElementById('projects');
  var searchInput = document.getElementById('searchInput');
  var projectCount = document.getElementById('projectCount');

  function renderProjects(filter) {
    container.innerHTML = '';
    var filtered = filter
      ? projects.filter(function (p) {
          return p.name.toLowerCase().includes(filter) || p.desc.toLowerCase().includes(filter);
        })
      : projects;

    projectCount.textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = '<div class="no-results">No se encontraron proyectos</div>';
      return;
    }

    filtered.forEach(function (p) {
      var card = document.createElement('a');
      card.href = p.path;
      card.className = 'project-card';
      card.innerHTML =
        '<div class="card-top">' +
          '<span class="card-icon">' + p.icon + '</span>' +
          '<span class="card-arrow">→</span>' +
        '</div>' +
        '<h2>' + p.name + '</h2>' +
        '<p>' + p.desc + '</p>' +
        '<div class="card-tags">' +
          p.tags.map(function (t) { return '<span class="tag tag-' + t + '">' + t + '</span>'; }).join('') +
        '</div>';
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
      container.appendChild(card);
    });
  }

  renderProjects('');

  searchInput.addEventListener('input', function (e) {
    renderProjects(e.target.value.toLowerCase().trim());
  });
})();

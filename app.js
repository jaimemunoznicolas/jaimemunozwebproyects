const projects = [
  {
    name: 'Curriculum',
    path: 'Curriculum/curriculum.html',
    icon: '📄',
    desc: 'Mi currículum vitae con experiencia, formación y habilidades profesionales.',
    tag: 'html',
  },
  {
    name: 'CyberSafeLine',
    path: 'CyberSafeLine/index.html',
    icon: '🛡️',
    desc: 'Servicios de ciberseguridad profesional: pentesting, formación y consultoría.',
    tag: 'html',
  },
  {
    name: 'Tarjetas Gráficas JM',
    path: 'TarjetasGraficas-JM/public/index.html',
    icon: '🎮',
    desc: 'Comparativa y análisis de tarjetas gráficas con ranking, favoritos y foro.',
    tag: 'html',
  },
];

const container = document.getElementById('projects');

projects.forEach((p) => {
  const card = document.createElement('a');
  card.href = p.path;
  card.className = 'project-card';
  card.innerHTML = `
    <div class="icon">${p.icon}</div>
    <h2>${p.name}</h2>
    <p>${p.desc}</p>
    <span class="tag tag-${p.tag}">${p.tag}</span>
  `;
  container.appendChild(card);
});

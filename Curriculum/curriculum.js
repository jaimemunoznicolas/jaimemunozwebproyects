document.addEventListener('DOMContentLoaded', function () {
    var cv = document.querySelector('.cv-container');
    var allAnimated = document.querySelectorAll('.exp-item, .edu-item, .objective-text, .section-title, .skills-list li, .contact-item, .language-item, .photo-container, .name');
    var skillItems = document.querySelectorAll('.skills-list li');
    var contactItems = document.querySelectorAll('.contact-item');
    var expItems = document.querySelectorAll('.exp-item');
    var eduItems = document.querySelectorAll('.edu-item');

    allAnimated.forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    function animateIn(elements, baseDelay, stagger) {
        elements.forEach(function (el, i) {
            setTimeout(function () {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, baseDelay + i * stagger);
        });
    }

    setTimeout(function () {
        animateIn([document.querySelector('.photo-container'), document.querySelector('.name')], 0, 0);
    }, 100);

    setTimeout(function () {
        var titles = document.querySelectorAll('.sidebar .section-title');
        animateIn(Array.from(titles), 0, 120);
        animateIn(Array.from(contactItems), titles.length * 120 + 80, 60);
    }, 300);

    setTimeout(function () {
        animateIn(Array.from(skillItems), 0, 40);
    }, 500);

    setTimeout(function () {
        var langItem = document.querySelector('.language-item');
        if (langItem) {
            langItem.style.opacity = '1';
            langItem.style.transform = 'translateY(0)';
        }
    }, 520);

    setTimeout(function () {
        var mainTitles = document.querySelectorAll('.main-content .section-title');
        animateIn(Array.from(mainTitles), 0, 100);
    }, 400);

    setTimeout(function () {
        var obj = document.querySelector('.objective-text');
        if (obj) { obj.style.opacity = '1'; obj.style.transform = 'translateY(0)'; }
    }, 550);

    setTimeout(function () { animateIn(Array.from(expItems), 0, 100); }, 650);
    setTimeout(function () { animateIn(Array.from(eduItems), 0, 80); }, 1000);

    var dots = document.querySelectorAll('.dot');
    dots.forEach(function (dot, i) {
        dot.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) ' + (1.2 + i * 0.1) + 's, opacity 0.3s ease ' + (1.2 + i * 0.1) + 's';
        dot.style.opacity = '0'; dot.style.transform = 'scale(0)';
        setTimeout(function () { dot.style.opacity = '1'; dot.style.transform = 'scale(1)'; }, 1200);
    });

    expItems.forEach(function (item) {
        item.addEventListener('mouseenter', function () { this.style.transform = 'translateX(6px)'; this.style.borderLeftColor = '#4caf50'; });
        item.addEventListener('mouseleave', function () { this.style.transform = 'translateX(0)'; this.style.borderLeftColor = '#2e7d32'; });
    });
    eduItems.forEach(function (item) {
        item.addEventListener('mouseenter', function () { this.style.transform = 'translateX(6px)'; this.style.borderLeftColor = '#4caf50'; });
        item.addEventListener('mouseleave', function () { this.style.transform = 'translateX(0)'; this.style.borderLeftColor = '#2e7d32'; });
    });
    contactItems.forEach(function (item) {
        item.addEventListener('mouseenter', function () { var icon = this.querySelector('.contact-icon'); if (icon) { icon.style.transform = 'scale(1.25)'; icon.style.transition = 'transform 0.2s ease'; } });
        item.addEventListener('mouseleave', function () { var icon = this.querySelector('.contact-icon'); if (icon) { icon.style.transform = 'scale(1)'; } });
    });
    skillItems.forEach(function (item) {
        item.addEventListener('mouseenter', function () { this.style.color = '#4caf50'; this.style.transition = 'color 0.2s ease'; });
        item.addEventListener('mouseleave', function () { this.style.color = ''; });
    });

    function showOverlay(html) {
        var o = document.createElement('div');
        o.id = 'pdf-overlay';
        o.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.45);z-index:9998;display:flex;align-items:center;justify-content:center;';
        var b = document.createElement('div');
        b.style.cssText = 'background:#fff;border-radius:12px;padding:30px 40px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,0.2);max-width:380px;';
        b.innerHTML = html;
        o.appendChild(b);
        document.body.appendChild(o);
        return o;
    }

    function generatePDF() {
        allAnimated.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; el.style.transition = 'none'; });
        cv.style.opacity = '1'; cv.style.transform = 'none'; cv.style.transition = 'none';

        var backBtn = document.querySelector('.menu-back-btn');
        if (backBtn) backBtn.style.display = 'none';

        if (!document.getElementById('pspin')) {
            var st = document.createElement('style');
            st.id = 'pspin';
            st.textContent = '@keyframes pspin{to{transform:rotate(360deg)}}';
            document.head.appendChild(st);
        }
        var loader = showOverlay('<div style="width:40px;height:40px;border:4px solid #e0e0e0;border-top-color:#4a9eff;border-radius:50%;animation:pspin 0.8s linear infinite;margin:0 auto 16px;"></div><p style="font-family:Segoe UI,sans-serif;font-size:15px;color:#333;margin:0;">Generando PDF...</p>');

        setTimeout(function () {
            var opt = {
                margin: [8, 8, 8, 8],
                filename: 'Curriculum-JaimeMunozNicolas.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: cv.scrollWidth,
                    height: cv.scrollHeight,
                    windowHeight: cv.scrollHeight,
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'] }
            };
            html2pdf().set(opt).from(cv).save().then(function () {
                loader.remove();
                if (backBtn) backBtn.style.display = '';
            }).catch(function () {
                loader.remove();
                if (backBtn) backBtn.style.display = '';
                window.print();
            });
        }, 300);
    }

    var btn = document.createElement('button');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Descargar PDF';
    btn.setAttribute('aria-label', 'Descargar currículum en PDF');
    btn.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1f2a3a;color:#fff;border:none;border-radius:8px;padding:12px 22px;font-size:14px;font-family:inherit;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.2);z-index:100;transition:all 0.3s ease;opacity:0;transform:translateY(10px);display:flex;align-items:center;gap:8px;';
    document.body.appendChild(btn);

    setTimeout(function () { btn.style.opacity = '1'; btn.style.transform = 'translateY(0)'; }, 1500);

    btn.addEventListener('mouseenter', function () { this.style.background = '#4a9eff'; this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 6px 20px rgba(74,158,255,0.4)'; });
    btn.addEventListener('mouseleave', function () { this.style.background = '#1f2a3a'; this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'; });
    btn.addEventListener('click', function () { btn.disabled = true; btn.style.opacity = '0.6'; generatePDF(); });

    cv.style.opacity = '0'; cv.style.transition = 'opacity 0.5s ease';
    setTimeout(function () { cv.style.opacity = '1'; }, 50);
});

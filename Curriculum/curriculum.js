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
        // Reset animations for clean capture
        allAnimated.forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.transition = 'none';
        });
        cv.style.opacity = '1';
        cv.style.transform = 'none';
        cv.style.transition = 'none';

        // Hide back button
        var backBtn = document.querySelector('.menu-back-btn');
        if (backBtn) backBtn.style.display = 'none';

        // Temporarily make the CV fill A4 width exactly (remove flex centering)
        document.body.style.cssText += ';display:block !important;padding:0 !important;min-height:auto !important;align-items:normal !important;';
        cv.style.cssText += ';max-width:794px !important;width:794px !important;margin:0 auto !important;box-shadow:none !important;border-radius:0 !important;';

        // Show loading overlay
        if (!document.getElementById('pspin')) {
            var st = document.createElement('style');
            st.id = 'pspin';
            st.textContent = '@keyframes pspin{to{transform:rotate(360deg)}}';
            document.head.appendChild(st);
        }
        var loader = showOverlay('<div style="width:40px;height:40px;border:4px solid #e0e0e0;border-top-color:#4a9eff;border-radius:50%;animation:pspin 0.8s linear infinite;margin:0 auto 16px;"></div><p style="font-family:Segoe UI,sans-serif;font-size:15px;color:#333;margin:0;">Generando PDF...</p>');

        // Wait for layout to settle
        setTimeout(function () {
            // Capture with html2canvas
            html2canvas(cv, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 794,
                windowWidth: 794,
            }).then(function (canvas) {
                // Restore original CV and body styles
                cv.style.maxWidth = '';
                cv.style.width = '';
                cv.style.margin = '';
                cv.style.boxShadow = '';
                cv.style.borderRadius = '';
                document.body.style.cssText = '';

                // Create PDF with jsPDF
                var pdf = new jspdf.jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                    compress: true,
                });

                var pageWidth = pdf.internal.pageSize.getWidth();
                var pageHeight = pdf.internal.pageSize.getHeight();
                var margin = 6;
                var usableWidth = pageWidth - margin * 2;
                var usableHeight = pageHeight - margin * 2 - 7;

                // Image dimensions to fit width (with margins)
                var imgWidth = usableWidth;
                var imgHeight = (canvas.height / canvas.width) * imgWidth;

                if (imgHeight <= usableHeight) {
                    var yOffset = margin + (usableHeight - imgHeight) / 2;
                    pdf.addImage(canvas, 'JPEG', margin, yOffset, imgWidth, imgHeight);
                } else {
                    var ratio = canvas.width / imgWidth;
                    var sliceHeightPx = usableHeight * ratio;
                    var y = 0;
                    var pageNum = 0;

                    while (y < canvas.height) {
                        if (pageNum > 0) pdf.addPage();
                        var h = Math.min(sliceHeightPx, canvas.height - y);
                        var destH = h / ratio;

                        var slice = document.createElement('canvas');
                        slice.width = canvas.width;
                        slice.height = h;
                        var sliceCtx = slice.getContext('2d');
                        sliceCtx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);

                        pdf.addImage(slice, 'JPEG', margin, margin, imgWidth, destH);
                        y += h;
                        pageNum++;
                    }
                }

                // Add clickable Linktree link on each page
                var pages = pdf.internal.getNumberOfPages();
                for (var pi = 1; pi <= pages; pi++) {
                    pdf.setPage(pi);
                    pdf.setFontSize(7);
                    var linkY = pageHeight - margin - 1;
                    var linkText = '🔗 linktr.ee/jaimemunoznicolas';
                    var textWidth = pdf.getTextWidth(linkText);
                    var linkX = (pageWidth - textWidth) / 2;
                    pdf.setTextColor(80, 80, 120);
                    pdf.textWithLink(linkText, linkX, linkY, { url: 'https://linktr.ee/jaimemunoznicolas' });
                }

                pdf.save('Curriculum-JaimeMunozNicolas.pdf');
                loader.remove();
                if (backBtn) backBtn.style.display = '';
            }).catch(function () {
                // Restore and fallback to browser print
                cv.style.maxWidth = '';
                cv.style.width = '';
                cv.style.margin = '';
                cv.style.boxShadow = '';
                cv.style.borderRadius = '';
                document.body.style.cssText = '';
                loader.remove();
                if (backBtn) backBtn.style.display = '';
                window.print();
            });
        }, 200);
    }

    // Floating button: PDF download (right)
    var pdfBtn = document.createElement('button');
    pdfBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Descargar PDF';
    pdfBtn.setAttribute('aria-label', 'Descargar currículum en PDF');
    pdfBtn.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1f2a3a;color:#fff;border:none;border-radius:8px;padding:12px 22px;font-size:14px;font-family:inherit;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.2);z-index:100;transition:all 0.3s ease;opacity:0;transform:translateY(10px);display:flex;align-items:center;gap:8px;';
    document.body.appendChild(pdfBtn);

    setTimeout(function () { pdfBtn.style.opacity = '1'; pdfBtn.style.transform = 'translateY(0)'; }, 1500);

    pdfBtn.addEventListener('mouseenter', function () { this.style.background = '#4a9eff'; this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 6px 20px rgba(74,158,255,0.4)'; });
    pdfBtn.addEventListener('mouseleave', function () { this.style.background = '#1f2a3a'; this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'; });
    pdfBtn.addEventListener('click', function () { pdfBtn.disabled = true; pdfBtn.style.opacity = '0.6'; generatePDF(); });

    cv.style.opacity = '0'; cv.style.transition = 'opacity 0.5s ease';
    setTimeout(function () { cv.style.opacity = '1'; }, 50);
});

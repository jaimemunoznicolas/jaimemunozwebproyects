// matrix.js — Fondo Matrix funcional y estable

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas");
    canvas.id = "matrixCanvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "-1";
    canvas.style.pointerEvents = "none";
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    let fontSize = 18;
    let columns = 0;
    let drops = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = Math.floor(canvas.width / fontSize);
        drops = Array(columns).fill(1);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const chars = "01[]{}<>/\\=+-|";

    function draw() {
        ctx.fillStyle = "rgba(2, 6, 23, 0.25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#00ff6a");
        gradient.addColorStop(0.5, "#27e2ff");
        gradient.addColorStop(1, "#00ff6a");

        ctx.fillStyle = gradient;
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < columns; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            ctx.fillText(char, x, y);

            if (y > canvas.height && Math.random() > 0.965) {
                drops[i] = 0;
            }

            drops[i] += 0.75;
        }

        requestAnimationFrame(draw);
    }

    draw();
});
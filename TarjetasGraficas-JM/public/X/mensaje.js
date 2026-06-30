document.addEventListener("DOMContentLoaded", () => {
  const progressEl = document.getElementById("bsodProgress");
  const soundEl = document.getElementById("bsodSound");

  // Verificar si ya se ejecutó
  if (localStorage.getItem("bsodShown") === "true") {
    window.location.href = "menusecreto.html";
    return;
  }

  // Reproducir sonido
  try {
    soundEl.volume = 1.0;
    soundEl.play().catch(() => {});
  } catch (err) {
    console.warn("No se pudo reproducir el sonido:", err);
  }

  let progress = 0;
  const totalTimeMs = 11000;
  const stepMs = 110;

  const interval = setInterval(() => {
    progress++;
    progressEl.textContent = progress;

    if (progress >= 100) {
      clearInterval(interval);
      localStorage.setItem("bsodShown", "true");
      setTimeout(() => {
        window.location.href = "menusecreto.html";
      }, 400);
    }
  }, stepMs);
});





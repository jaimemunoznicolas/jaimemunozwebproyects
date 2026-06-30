const rankingType = document.getElementById("ranking-type");
const rankingList = document.getElementById("ranking-list");

function parseVRAM(vram) {
  const match = vram.match(/(\d+)\s*GB/i);
  return match ? parseInt(match[1]) : 0;
}

function valueScore(gpu) {
  return gpu.performanceScore && gpu.price ? gpu.performanceScore / gpu.price : 0;
}

function renderRanking() {
  const type = rankingType.value;
  let gpus = [...gpuData];

  switch (type) {
    case "performance":
      gpus.sort((a, b) => b.performanceScore - a.performanceScore);
      break;
    case "price":
      gpus.sort((a, b) => a.price - b.price);
      break;
    case "value":
      gpus.sort((a, b) => valueScore(b) - valueScore(a));
      break;
    case "vram":
      gpus.sort((a, b) => parseVRAM(b.vram) - parseVRAM(a.vram));
      break;
    case "power":
      gpus.sort((a, b) => a.powerWatts - b.powerWatts);
      break;
    case "psu":
      gpus.sort((a, b) => a.recommendedPSU - b.recommendedPSU);
      break;
  }

  rankingList.innerHTML = gpus.map((gpu, i) => `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 d-flex flex-column justify-content-between fade-in">

        <div class="gpu-image-wrapper">
          <img src="${gpu.image}" alt="${gpu.name}" class="gpu-image">
        </div>

        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 class="gpu-card-title">${i + 1}. ${gpu.name}</h5>
            <ul class="list-unstyled gpu-meta mb-3">
              <li><strong>VRAM:</strong> ${gpu.vram}</li>
              <li><strong>Rendimiento:</strong> ${gpu.performanceScore}</li>
              <li><strong>Precio:</strong> ${gpu.price} €</li>
              <li><strong>Consumo:</strong> ${gpu.powerWatts} W</li>
              <li><strong>Fuente recomendada:</strong> ${gpu.recommendedPSU ?? "N/A"} W</li>
            </ul>
          </div>
          <div class="d-grid gap-2 mt-auto">
            <a href="gpu.html?id=${gpu.id}" class="btn btn-primary btn-sm">Ver detalles</a>
            <button class="btn btn-secondary btn-sm">Favorito</button>
            <button class="btn btn-secondary btn-sm">Comparar</button>
          </div>
        </div>

      </div>
    </div>
  `).join("");
}

rankingType.addEventListener("change", renderRanking);
renderRanking();
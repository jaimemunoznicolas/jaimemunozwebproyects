// search.js — Buscador avanzado del catálogo de GPUs
// Filtra por nombre, VRAM, rendimiento, consumo, PSU y precio.
// Envía los resultados a gpus.js mediante un evento personalizado.

document.addEventListener("DOMContentLoaded", () => {

    // ============================
    //   REFERENCIAS
    // ============================

    const searchInput = document.getElementById("searchInput");

    if (!searchInput) return;

    // ============================
    //   FUNCIÓN PRINCIPAL DE BÚSQUEDA
    // ============================

    function filtrarGpus(texto) {
        const query = texto.trim().toLowerCase();

        // Si no hay texto, devolvemos todas las GPUs
        if (query === "") {
            return gpuData;
        }

        return gpuData.filter(gpu => {
            const name = gpu.name.toLowerCase();
            const vram = gpu.vram.toLowerCase();
            const perf = gpu.performanceScore.toString();
            const watts = gpu.powerWatts.toString();
            const psu = gpu.recommendedPsu.toString();
            const price = gpu.price.toString();

            return (
                name.includes(query) ||
                vram.includes(query) ||
                perf.includes(query) ||
                watts.includes(query) ||
                psu.includes(query) ||
                price.includes(query)
            );
        });
    }

    // ============================
    //   EMITIR RESULTADOS
    // ============================

    function emitirResultados(lista) {
        const evento = new CustomEvent("gpuSearchResults", {
            detail: { resultados: lista }
        });
        document.dispatchEvent(evento);
    }

    // ============================
    //   EVENTO DE INPUT
    // ============================

    searchInput.addEventListener("input", () => {
        const texto = searchInput.value;
        const resultados = filtrarGpus(texto);
        emitirResultados(resultados);
    });

    // ============================
    //   INICIO
    // ============================

    emitirResultados(gpuData);
});
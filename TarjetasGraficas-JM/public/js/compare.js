// compare.js — Comparador avanzado de GPUs en compare.html
// Muestra una tabla comparativa de las GPUs añadidas al comparador.
// Permite eliminar modelos, limpiar la lista y navegar a la ficha individual.

document.addEventListener("DOMContentLoaded", () => {

    // ============================
    //   REFERENCIAS A ELEMENTOS
    // ============================

    const compareTableBody = document.getElementById("compareTableBody");
    const clearCompareBtn  = document.getElementById("clearCompareBtn");
    const emptyMessage     = document.getElementById("emptyCompareMessage");

    // ============================
    //   UTILIDADES
    // ============================

    function getCompareList() {
        return JSON.parse(localStorage.getItem("compareList")) || [];
    }

    function setCompareList(list) {
        localStorage.setItem("compareList", JSON.stringify(list));
    }

    function removeFromCompare(id) {
        let list = getCompareList();
        list = list.filter(item => item !== id);
        setCompareList(list);
        renderComparador();
    }

    function mostrarMensajeFlotante(texto, tipo = "success") {
        const mensaje = document.createElement("div");
        mensaje.textContent = texto;
        mensaje.className = `alert alert-${tipo} fade-in`;
        mensaje.style.position = "fixed";
        mensaje.style.bottom = "20px";
        mensaje.style.right = "20px";
        mensaje.style.zIndex = "9999";
        mensaje.style.minWidth = "240px";

        document.body.appendChild(mensaje);

        setTimeout(() => mensaje.remove(), 2500);
    }

    // ============================
    //   RENDERIZAR COMPARADOR
    // ============================

    function renderComparador() {
        const list = getCompareList();
        compareTableBody.innerHTML = "";

        if (list.length === 0) {
            emptyMessage.style.display = "block";
            return;
        }

        emptyMessage.style.display = "none";

        list.forEach(id => {
            const gpu = getGpuById(id);
            if (!gpu) return;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <img 
                            src="${gpu.image}" 
                            alt="${gpu.name}" 
                            class="img-fluid"
                            style="max-width: 80px; cursor: pointer;"
                            data-open-id="${gpu.id}"
                        />
                        <strong style="cursor: pointer;" data-open-id="${gpu.id}">
                            ${gpu.name}
                        </strong>
                    </div>
                </td>

                <td>${gpu.vram}</td>
                <td>${gpu.performanceScore}/100</td>
                <td>${gpu.powerWatts} W</td>
                <td>${gpu.recommendedPsu} W</td>
                <td>${gpu.price} €</td>

                <td>
                    <button 
                        class="btn btn-danger btn-sm"
                        data-remove-id="${gpu.id}"
                    >
                        Quitar
                    </button>
                </td>
            `;

            compareTableBody.appendChild(row);
        });

        activarEventos();
    }

    // ============================
    //   EVENTOS
    // ============================

    function activarEventos() {
        // Abrir ficha de GPU
        const openButtons = document.querySelectorAll("[data-open-id]");
        openButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-open-id");
                window.location.href = `gpu.html?id=${encodeURIComponent(id)}`;
            });
        });

        // Quitar GPU del comparador
        const removeButtons = document.querySelectorAll("[data-remove-id]");
        removeButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-remove-id");
                removeFromCompare(id);
                mostrarMensajeFlotante("GPU eliminada del comparador.");
            });
        });
    }

    // ============================
    //   LIMPIAR COMPARADOR
    // ============================

    if (clearCompareBtn) {
        clearCompareBtn.addEventListener("click", () => {
            const list = getCompareList();
            if (list.length === 0) {
                mostrarMensajeFlotante("No hay GPUs en el comparador.", "danger");
                return;
            }

            setCompareList([]);
            renderComparador();
            mostrarMensajeFlotante("Comparador limpiado.");
        });
    }

    // ============================
    //   INICIO
    // ============================

    renderComparador();
});
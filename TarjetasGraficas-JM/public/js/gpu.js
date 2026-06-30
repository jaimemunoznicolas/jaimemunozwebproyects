// gpu.js — Página de detalle de una GPU concreta en gpu.html
// Ahora integra Firebase para favoritos por usuario.

import { auth, db } from "./firebase.js";
import { onUserChange } from "./auth.js";
import {
    ref,
    get,
    set
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {

    // ============================
    //   REFERENCIAS A ELEMENTOS
    // ============================

    const gpuTitle       = document.getElementById("gpuTitle");
    const gpuImage       = document.getElementById("gpuImage");
    const gpuName        = document.getElementById("gpuName");
    const gpuVram        = document.getElementById("gpuVram");
    const gpuPerf        = document.getElementById("gpuPerformance");
    const gpuPrice       = document.getElementById("gpuPrice");
    const gpuPower       = document.getElementById("gpuPower");
    const gpuPsu         = document.getElementById("gpuPsu");
    const gpuExtraSpecs  = document.getElementById("gpuExtraSpecs");

    const addFavBtn      = document.getElementById("addToFavoritesBtn");
    const addCompareBtn  = document.getElementById("addToCompareBtn");
    const backToListBtn  = document.getElementById("backToListBtn");

    let currentUser = null;

    // ============================
    //   UTILIDADES
    // ============================

    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
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

    // Comparador sigue siendo local
    function getCompareList() {
        return JSON.parse(localStorage.getItem("compareList")) || [];
    }

    function setCompareList(list) {
        localStorage.setItem("compareList", JSON.stringify(list));
    }

    // ============================
    //   FAVORITOS (Firebase)
    // ============================

    async function addToFavorites(gpuId) {
        if (!currentUser) {
            mostrarMensajeFlotante("Debes iniciar sesión para guardar favoritos.", "danger");
            return;
        }

        const favRef = ref(db, `usuarios/${currentUser.uid}/favoritos`);
        const snap = await get(favRef);
        let favs = snap.val() || [];

        if (favs.includes(gpuId)) {
            mostrarMensajeFlotante("Esta GPU ya está en tus favoritos.");
            return;
        }

        favs.push(gpuId);
        await set(favRef, favs);

        mostrarMensajeFlotante("GPU añadida a favoritos.");
    }

    // ============================
    //   INICIALIZACIÓN
    // ============================

    function init() {
        if (!Array.isArray(gpuData)) {
            console.error("gpuData no está definido o no es un array.");
            return;
        }

        const id = getQueryParam("id");
        if (!id) {
            mostrarError("No se ha especificado ninguna GPU.");
            return;
        }

        const gpu = getGpuById(id);
        if (!gpu) {
            mostrarError("No se ha encontrado la GPU solicitada.");
            return;
        }

        rellenarFicha(gpu);
        configurarEventos(gpu);
    }

    // ============================
    //   RELLENAR FICHA
    // ============================

    function rellenarFicha(gpu) {
        gpuTitle.textContent = gpu.name;
        gpuName.textContent = gpu.name;
        gpuVram.textContent = gpu.vram;
        gpuPerf.textContent = gpu.performanceScore + "/100";
        gpuPrice.textContent = gpu.price + " €";
        gpuPower.textContent = gpu.powerWatts + " W";
        gpuPsu.textContent = gpu.recommendedPsu + " W o más";

        gpuImage.src = gpu.image;
        gpuImage.alt = gpu.name;

        gpuExtraSpecs.innerHTML = `
            <p class="gpu-meta mb-1">ID interno: ${gpu.id}</p>
            <p class="gpu-meta mb-1">VRAM: ${gpu.vram}</p>
            <p class="gpu-meta mb-1">Consumo estimado: ${gpu.powerWatts} W</p>
            <p class="gpu-meta mb-1">PSU recomendada: ${gpu.recommendedPsu} W</p>
            <p class="text-muted-custom mb-0">
                Puedes ampliar esta ficha con más datos cuando quieras.
            </p>
        `;
    }

    // ============================
    //   CONFIGURAR EVENTOS
    // ============================

    function configurarEventos(gpu) {

        // FAVORITOS (Firebase)
        if (addFavBtn) {
            addFavBtn.addEventListener("click", () => {
                addToFavorites(gpu.id);
            });
        }

        // COMPARADOR (localStorage)
        if (addCompareBtn) {
            addCompareBtn.addEventListener("click", () => {
                let compareList = getCompareList();
                if (!compareList.includes(gpu.id)) {
                    compareList.push(gpu.id);
                    setCompareList(compareList);
                    mostrarMensajeFlotante("GPU añadida al comparador.");
                } else {
                    mostrarMensajeFlotante("Esta GPU ya está en el comparador.");
                }
            });
        }

        // VOLVER
        if (backToListBtn) {
            backToListBtn.addEventListener("click", () => {
                window.location.href = "gpus.html";
            });
        }
    }

    // ============================
    //   ERRORES
    // ============================

    function mostrarError(msg) {
        gpuTitle.textContent = "Error";
        gpuName.textContent = msg;
        mostrarMensajeFlotante(msg, "danger");
    }

    // ============================
    //   SESIÓN
    // ============================

    onUserChange((user) => {
        currentUser = user;
    });

    // ============================
    //   INICIO
    // ============================

    init();
});
// js/profile.js — Perfil sin avatar

import { auth, db } from "./firebase.js";
import { onUserChange } from "./auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const usernameEl = document.getElementById("profileUsername");
    const emailEl = document.getElementById("profileEmail");

    onUserChange(async (user) => {
        if (!user) {
            if (usernameEl) usernameEl.textContent = "Debes iniciar sesión.";
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
            return;
        }

        if (emailEl) emailEl.textContent = user.email || "(Sin email)";

        try {
            const snap = await get(ref(db, "usuarios/" + user.uid));
            const data = snap.val();

            if (usernameEl) {
                usernameEl.textContent = data?.nombre || "(Sin nombre)";
            }
        } catch (err) {
            console.error("Error al cargar perfil:", err);
            if (usernameEl) usernameEl.textContent = "Error al cargar perfil";
        }
    });
});
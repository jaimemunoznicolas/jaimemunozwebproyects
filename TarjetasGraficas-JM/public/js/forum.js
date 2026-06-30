// js/forum.js — Foro simple sin imágenes ni avatar

import { auth, db } from "./firebase.js";
import { onUserChange } from "./auth.js";
import {
    ref,
    push,
    set,
    onValue,
    get
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const newThreadForm = document.getElementById("newThreadForm");
    const threadsList = document.getElementById("threadsList");
    const threadMessage = document.getElementById("threadMessage");

    let currentUser = null;

    onUserChange((user) => {
        currentUser = user;
    });

    function mostrarError(texto) {
        if (!threadMessage) return;
        threadMessage.textContent = texto;
        threadMessage.style.display = texto ? "block" : "none";
    }

    function limpiarError() {
        mostrarError("");
    }

    function formatDate(ts) {
        if (!ts) return "";
        return new Date(ts).toLocaleString("es-ES", {
            dateStyle: "short",
            timeStyle: "short"
        });
    }

    /* CREAR HILO */
    if (newThreadForm) {
        newThreadForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            limpiarError();

            if (!currentUser) {
                mostrarError("Debes iniciar sesión para publicar un hilo.");
                return;
            }

            const title = document.getElementById("threadTitle").value.trim();
            const content = document.getElementById("threadContent").value.trim();

            if (!title || !content) {
                mostrarError("Debes completar todos los campos.");
                return;
            }

            try {
                const userSnap = await get(ref(db, "usuarios/" + currentUser.uid));
                const userData = userSnap.val() || {};

                await push(ref(db, "hilos"), {
                    title,
                    content,
                    authorUid: currentUser.uid,
                    authorEmail: currentUser.email,
                    authorName: userData.nombre || null,
                    createdAt: Date.now()
                });

                newThreadForm.reset();
            } catch (err) {
                console.error(err);
                mostrarError("Error al crear el hilo.");
            }
        });
    }

    /* ESCUCHAR HILOS */
    onValue(ref(db, "hilos"), (snapshot) => {
        const data = snapshot.val();
        renderThreads(data);
    });

    function renderThreads(hilos) {
        if (!threadsList) return;
        threadsList.innerHTML = "";

        if (!hilos) {
            const empty = document.createElement("div");
            empty.className = "card p-4 text-center";
            empty.innerHTML = `
                <h2 class="mb-2">No hay hilos aún</h2>
                <p class="text-muted-custom mb-0">
                    Sé el primero en crear un hilo usando el formulario superior.
                </p>
            `;
            threadsList.appendChild(empty);
            return;
        }

        const entries = Object.entries(hilos);
        entries.sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));

        entries.forEach(([id, thread]) => {
            const div = document.createElement("div");
            div.className = "card p-4";

            const createdAtText = formatDate(thread.createdAt);
            const authorLabel = thread.authorName
                ? `${thread.authorName} (${thread.authorEmail || "Desconocido"})`
                : (thread.authorEmail || "Desconocido");

            div.innerHTML = `
                <h3 class="mb-2">${thread.title}</h3>
                <p class="gpu-meta mb-3">${thread.content}</p>

                <p class="text-muted-custom mb-2" style="font-size: 0.85rem;">
                    Publicado por <strong>${authorLabel}</strong> · ${createdAtText}
                </p>

                <hr class="mt-3" />

                <h4 class="mb-2">Respuestas</h4>
                <div class="d-flex flex-column gap-2 mb-3" id="replies-${id}">
                    <!-- Respuestas se inyectan aquí -->
                </div>

                <form class="replyForm" data-thread-id="${id}">
                    <textarea
                        class="form-control mb-2"
                        rows="2"
                        placeholder="Escribe una respuesta..."
                        required
                    ></textarea>
                    <button class="btn btn-secondary btn-sm">Responder</button>
                </form>
            `;

            threadsList.appendChild(div);
            listenToReplies(id);
        });

        activarFormulariosRespuesta();
    }

    function listenToReplies(threadId) {
        const repliesContainer = document.getElementById(`replies-${threadId}`);
        if (!repliesContainer) return;

        onValue(ref(db, `hilos/${threadId}/replies`), (snap) => {
            const replies = snap.val();
            repliesContainer.innerHTML = "";

            if (!replies) {
                repliesContainer.innerHTML = `
                    <p class="text-muted-custom mb-0">No hay respuestas aún.</p>
                `;
                return;
            }

            const list = Object.values(replies);
            list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

            list.forEach((r) => {
                const p = document.createElement("div");
                p.className = "card p-2";
                p.innerHTML = `
                    <p class="mb-1">${r.content}</p>
                    <p class="text-muted-custom mb-0" style="font-size: 0.75rem;">
                        ${r.authorEmail} · ${formatDate(r.createdAt)}
                    </p>
                `;
                repliesContainer.appendChild(p);
            });
        });
    }

    function activarFormulariosRespuesta() {
        const forms = document.querySelectorAll(".replyForm");
        forms.forEach((form) => {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                if (!currentUser) {
                    alert("Debes iniciar sesión para responder.");
                    return;
                }

                const threadId = form.getAttribute("data-thread-id");
                const textarea = form.querySelector("textarea");
                const content = textarea.value.trim();
                if (!content) return;

                try {
                    await push(ref(db, `hilos/${threadId}/replies`), {
                        content,
                        authorUid: currentUser.uid,
                        authorEmail: currentUser.email,
                        createdAt: Date.now()
                    });
                    textarea.value = "";
                } catch (err) {
                    console.error("Error al enviar respuesta:", err);
                    alert("Error al enviar la respuesta.");
                }
            });
        });
    }
});
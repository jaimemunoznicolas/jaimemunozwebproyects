// js/auth.js
import { auth, db } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

/* REGISTRO */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("regUsername").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const messageBox = document.getElementById("registerMessage");

        if (messageBox) {
            messageBox.style.display = "none";
            messageBox.textContent = "";
        }

        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const user = cred.user;

            // Avatar fijo para todos
            const avatarPath = "img/randomprofilephoto/avatar.png";

            await set(ref(db, "usuarios/" + user.uid), {
                nombre: username,
                email: user.email,
                avatar: avatarPath,
                fechaRegistro: Date.now()
            });

            alert("Cuenta creada correctamente");
            window.location.href = "login.html";

        } catch (err) {
            console.error(err);
            if (messageBox) {
                messageBox.textContent = err.message;
                messageBox.style.display = "block";
            } else {
                alert("Error: " + err.message);
            }
        }
    });
}

/* LOGIN */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const messageBox = document.getElementById("loginMessage");

        if (messageBox) {
            messageBox.style.display = "none";
            messageBox.textContent = "";
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Sesión iniciada");
            window.location.href = "forum.html";
        } catch (err) {
            console.error(err);
            if (messageBox) {
                messageBox.textContent = err.message;
                messageBox.style.display = "block";
            } else {
                alert("Error: " + err.message);
            }
        }
    });
}

/* LOGOUT */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "index.html";
    });
}

/* OBSERVADOR */
export function onUserChange(callback) {
    onAuthStateChanged(auth, callback);
}
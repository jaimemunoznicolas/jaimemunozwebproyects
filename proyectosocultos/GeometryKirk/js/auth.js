// js/auth.js
import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const path = window.location.pathname;

onAuthStateChanged(auth, (user) => {
  // Descarga Windows
  if (path.includes("descarga-windows")) {
    const msg = document.getElementById("windows-msg");
    const link = document.getElementById("windows-link");
    const authBox = document.getElementById("auth-box");
    if (user) {
      msg.textContent = "Sesión iniciada como: " + user.email;
      msg.className = "msg success";
      if (link) link.style.display = "inline-block";
      if (authBox) authBox.style.display = "none";
    } else {
      msg.textContent = "Debes iniciar sesión para descargar.";
      msg.className = "msg error";
      if (link) link.style.display = "none";
      if (authBox) authBox.style.display = "block";
    }
  }

  // Descarga Android
  if (path.includes("descarga-android")) {
    const msg = document.getElementById("android-msg");
    const link = document.getElementById("android-link");
    const authBox = document.getElementById("auth-box");
    if (user) {
      msg.textContent = "Sesión iniciada como: " + user.email;
      msg.className = "msg success";
      if (link) link.style.display = "inline-block";
      if (authBox) authBox.style.display = "none";
    } else {
      msg.textContent = "Debes iniciar sesión para descargar.";
      msg.className = "msg error";
      if (link) link.style.display = "none";
      if (authBox) authBox.style.display = "block";
    }
  }
});

// Formularios de auth inline (en páginas de descarga)
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginMsg = document.getElementById("login-msg");
const registerMsg = document.getElementById("register-msg");
const showRegister = document.getElementById("show-register");
const showLogin = document.getElementById("show-login");
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");

if (showRegister) {
  showRegister.addEventListener("click", () => {
    loginSection.style.display = "none";
    registerSection.style.display = "block";
  });
}

if (showLogin) {
  showLogin.addEventListener("click", () => {
    registerSection.style.display = "none";
    loginSection.style.display = "block";
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginMsg.textContent = "";
    loginMsg.className = "msg";
    const email = document.getElementById("login-email").value;
    const pass = document.getElementById("login-password").value;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      loginMsg.textContent = "Sesión iniciada correctamente.";
      loginMsg.className = "msg success";
    } catch (err) {
      loginMsg.textContent = "Error: " + err.message;
      loginMsg.className = "msg error";
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerMsg.textContent = "";
    registerMsg.className = "msg";
    const email = document.getElementById("register-email").value;
    const pass = document.getElementById("register-password").value;
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      registerMsg.textContent = "Cuenta creada. Ya puedes iniciar sesión.";
      registerMsg.className = "msg success";
    } catch (err) {
      registerMsg.textContent = "Error: " + err.message;
      registerMsg.className = "msg error";
    }
  });
}

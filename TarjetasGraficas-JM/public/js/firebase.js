// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAVM1YK0CVoDtGRmWA1DTYr-YiB3JmtLoU",
    authDomain: "tarjetasgraficas-jm.firebaseapp.com",
    databaseURL: "https://tarjetasgraficas-jm-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tarjetasgraficas-jm",
    storageBucket: "tarjetasgraficas-jm.appspot.com",
    messagingSenderId: "408748376696",
    appId: "1:408748376696:web:c64a7b46fe012c3645a38d",
    measurementId: "G-PJX25SCVL3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
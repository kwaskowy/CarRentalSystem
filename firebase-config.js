import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtqylOxpWDmyDZoEt0a7yWC9eA6r_H8mM",
  authDomain: "car-rental-app-d3e67.firebaseapp.com",
  projectId: "car-rental-app-d3e67",
  storageBucket: "car-rental-app-d3e67.firebasestorage.app",
  messagingSenderId: "309950924942",
  appId: "1:309950924942:android:16043f3b30e32f39e621df"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

window.auth = auth;
window.db = db;

// Google Login
window.signInGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    navigator.vibrate?.([100, 50, 100]);
    location.hash = 'rentals';
  } catch (error) {
    alert(error.message);
  }
};

// E-mail login
window.signInEmail = async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    navigator.vibrate?.([100]);
    location.hash = 'rentals';
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      if (confirm("User not found. Create new account?")) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          alert("Account created!");
          location.hash = 'rentals';
        } catch (e) {
          alert(e.message);
        }
      }
    } else {
      alert(error.message);
    }
  }
};

// Automatyczne ładowanie strony po zalogowaniu/wylogowaniu
onAuthStateChanged(auth, () => {
  if (typeof window.loadPage === 'function') window.loadPage();
});

window.logout = async () => {
  await auth.signOut();
  location.hash = '#start';
};

onAuthStateChanged(auth, (user) => {
  const nav = document.getElementById('mainNav');
  if (user) {
    nav.classList.remove('d-none');
    window.loadPage?.();
  } else {
    nav.classList.add('d-none');
    location.hash = '#start';
  }
});

onAuthStateChanged(auth, (user) => {
  const nav = document.getElementById('mainNav');
  const hash = location.hash.split('?')[0];

  if (user) {
    nav.classList.remove('d-none');
    if (hash === '#start' || hash === '' || hash === '#') {
      location.hash = '#rentals';
    } else {
      window.loadPage?.();
    }
  } else {
    nav.classList.add('d-none');
    location.hash = '#start';
  }
});
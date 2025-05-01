import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
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
window.signInGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  alert(`Welcome, ${result.user.displayName}!`);
  navigator.vibrate?.([100, 50, 100]);
  location.hash = '#rentals';
};

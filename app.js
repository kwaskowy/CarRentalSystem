window.addEventListener('DOMContentLoaded', () => {
  // Ładujemy pierwszy widok po załadowaniu strony
  window.loadPage();
});

// Wywołuj loadPage za każdym razem, gdy zmienia się zakładka
window.addEventListener('hashchange', () => {
  window.loadPage();
});

function loadPage() {
  playFeedback(); 
  const view = (location.hash.split('?')[0] || '#start').slice(1);

  fetch(`views/${view}.html`)
    .then(res => res.text())
    .then(async html => {
      document.getElementById('app').innerHTML = html;

      // Dynamiczne importy tylko dla wybranych widoków
      const module = await import('./js/fetchData.js');
      if (view === 'vehicles') module.loadVehicles();
      if (view === 'vehicle-details') module.loadVehicleDetails();
      if (view === 'rentals') module.loadRentals();
      if (view === 'contact') module.loadContact();
    });
}
function showLogin() {
  document.getElementById('loginPanel')?.classList.add('show');
  navigator.vibrate?.([50]);
}

const popSound = new Audio('/sounds/pop.wav');

function playFeedback() {
  navigator.vibrate?.([30]);      // krótka wibracja
  popSound.currentTime = 0;       // zresetuj dźwięk
  popSound.play().catch(() => {}); // nie rzucaj błędów jeśli zablokowane
}

// Udostępnij globalnie
window.loadPage = loadPage;
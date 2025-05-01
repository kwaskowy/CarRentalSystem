function loadPage() {
  const view = (location.hash.split('?')[0] || '#start').slice(1);

  if (window.auth.currentUser && (view === 'start' || view === '')) {
    location.hash = '#rentals';
    return;
  }

  if (!window.auth.currentUser && view !== 'start' && view !== 'login') {
    location.hash = '#start';
    return;
  }

  fetch(`views/${view}.html`)
    .then(res => res.text())
    .then(async html => {
      document.getElementById('app').innerHTML = html;

      const module = await import('./js/fetchData.js');
      if (view === 'vehicles') module.loadVehicles();
      if (view === 'vehicle-details') module.loadVehicleDetails();
    });
}

function showLogin() {
  document.getElementById('loginPanel')?.classList.add('show');
  navigator.vibrate?.([50]);
}

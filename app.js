window.addEventListener('hashchange', loadPage);
window.addEventListener('DOMContentLoaded', loadPage);

function loadPage() {
  const view = (location.hash.split('?')[0] || '#rentals').slice(1);
  fetch(`views/${view}.html`)
    .then(res => res.text())
    .then(async html => {
      document.getElementById('app').innerHTML = html;
      const module = await import('./js/fetchData.js');
      if (view === 'vehicles') module.loadVehicles();
      if (view === 'vehicle-details') module.loadVehicleDetails();
    });
}

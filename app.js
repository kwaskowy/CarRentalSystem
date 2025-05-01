window.addEventListener('hashchange', loadPage);
window.addEventListener('DOMContentLoaded', loadPage);

function loadPage() {
  const view = (location.hash.split('?')[0] || '#start').slice(1);

  if (!window.auth.currentUser && view !== 'start') {
    location.hash = '#start';
    return;
  }

  fetch(`views/${view}.html`)
    .then(res => res.text())
    .then(async html => {
      document.getElementById('app').innerHTML = html;

      // dynamiczne importy dla widoków
      const module = await import('./js/fetchData.js');
      if (view === 'vehicles') module.loadVehicles();
      if (view === 'vehicle-details') module.loadVehicleDetails();
    });
}

// udostępnij globalnie, aby firebase-config.js mógł z tego korzystać
window.loadPage = loadPage;

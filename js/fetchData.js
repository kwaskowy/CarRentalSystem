import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


export async function loadVehicles() {
  const querySnapshot = await getDocs(collection(window.db, "Vehicles"));
  const container = document.getElementById('vehicles-list');
  container.innerHTML = '';

  querySnapshot.forEach((docItem) => {
    const car = docItem.data();
    const id = docItem.id;

    const div = document.createElement('div');
    div.className = 'col-6 col-sm-6 col-lg-4 mb-4';
    div.innerHTML = `
      <div class="card h-100 p-2 text-center" style="cursor:pointer;" onclick="location.hash='vehicle-details?id=${id}'">
  <img
    src="${car.imagePath}"
    alt="car"
    class="img-fluid rounded"
    style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover;"
  >
  <div class="card-body">
    <strong>${car.brand} ${car.model}</strong><br>
    <small>${car.year}</small>
  </div>
</div>
    `;
    container.appendChild(div);
  });
}

export async function loadVehicleDetails() {
  const params = new URLSearchParams(location.hash.split('?')[1]);
  const id = params.get('id');

  if (!id) {
    document.getElementById('vehicle-detail').innerHTML = '<p>Vehicle not found.</p>';
    return;
  }

  const vehicleDoc = await getDoc(doc(window.db, "Vehicles", id));
  const vehicle = vehicleDoc.data();

  if (vehicle) {
    document.getElementById('vehicle-detail').innerHTML = `
      <h5>${vehicle.brand} ${vehicle.model} (${vehicle.year})</h5>
      <div class="text-center">
        <img src="${vehicle.imagePath}" alt="car" class="img-fluid rounded shadow-sm" style="max-width: 100%; aspect-ratio: 1 / 1; object-fit: cover;">
      </div>
      <ul class="list-group">
        <li class="list-group-item"><strong>Engine:</strong> ${vehicle.engine}</li>
        <li class="list-group-item"><strong>Transmission:</strong> ${vehicle.transmission}</li>
        <li class="list-group-item"><strong>Seats:</strong> ${vehicle.seats}</li>
        <li class="list-group-item"><strong>Price:</strong> ${vehicle.price} £/day</li>
      </ul>
      <button class="btn btn-secondary mt-3" onclick="history.back()">Back</button>
    `;
  } else {
    document.getElementById('vehicle-detail').innerHTML = '<p>Vehicle not found.</p>';
  }
}
export async function loadRentals() {
  const user = window.auth.currentUser;
  if (!user) return;

  const container = document.getElementById('rentals-list');
  container.innerHTML = '';

  const q = query(
    collection(window.db, "Rentals"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  // opcje doLocale…
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };

  // mapa statusów → klas Bootstrap
  const statusMap = {
    cancelled:  'bg-danger',   // czerwony      – anulowany
    pending:    'bg-warning',  // żółty         – w oczekiwaniu
    confirmed:  'bg-primary',  // niebieski     – potwierdzony
    completed:  'bg-success'   // zielony       – zakończony
  };

  snapshot.forEach(doc => {
    const data = doc.data();

    // Timestamp → Date
    const startDate = data.startDate.toDate();
    const endDate   = data.endDate.toDate();

    // formatowanie daty i czasu
    const startStr = startDate.toLocaleDateString('pl-PL', dateOptions)
                   + ' ' + startDate.toLocaleTimeString('pl-PL', timeOptions);
    const endStr   = endDate.toLocaleDateString('pl-PL', dateOptions)
                   + ' ' + endDate.toLocaleTimeString('pl-PL', timeOptions);

    // dobieramy klasę badge; jeśli status nieznany → szary
    const statusClass = statusMap[data.status] || 'bg-secondary';

    const div = document.createElement('div');
    div.className = 'card mb-3';
    div.innerHTML = `
      <div class="card-body">
        <strong>${data.carId}</strong><br>
        <small>${startStr} → ${endStr}</small><br>
        <span class="badge ${statusClass} text-uppercase">
          ${data.status}
        </span>
        <div class="mt-2 text-muted small">
          Price: ${data.price} PLN
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}


import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  Timestamp,
  addDoc,
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
        <img src="${vehicle.imagePath}" alt="car" class="img-fluid rounded shadow-sm" style="max-width: 90%; aspect-ratio: 1 / 1; object-fit: cover;">
      </div>
      <ul class="list-group my-3">
        <li class="list-group-item"><strong>Engine:</strong> ${vehicle.engine}</li>
        <li class="list-group-item"><strong>Transmission:</strong> ${vehicle.transmission}</li>
        <li class="list-group-item"><strong>Seats:</strong> ${vehicle.seats}</li>
        <li class="list-group-item"><strong>Price:</strong> ${vehicle.price} £/day</li>
      </ul>
      <div class="d-flex justify-content-center gap-3 mt-3">
        <button class="btn btn-secondary px-4" onclick="location.hash='rentals'">Back</button>
        <button class="btn btn-dark px-4" onclick="location.hash='order?id=${id}'">Rent</button>
      </div>
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

export async function loadContact() {
  const container = document.getElementById('locations-list');
  container.innerHTML = '';

  const snapshot = await getDocs(collection(window.db, "Locations"));
  
  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement('div');
    div.className = 'col-12 col-md-6';
    const mapEmbed = data.mapUrl
      ? `<div class="ratio ratio-4x3 mt-3"><iframe src="${data.mapUrl}" style="border:0;" loading="lazy" allowfullscreen></iframe></div>`
      : '';

    div.innerHTML = `
      <div class="card h-100 shadow-sm p-3">
        <h6 class="text-primary">${data.city}</h6>
        <p class="mb-1"><strong>Adres:</strong> ${data.address}</p>
        <p class="mb-1"><strong>Telefon:</strong> ${data.phone}</p>
        <p class="mb-1"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p class="mb-1"><strong>Godziny otwarcia:</strong> ${data.hours}</p>
        ${mapEmbed}
      </div>
    `;
    container.appendChild(div);
  });
}
export async function loadOrder() {
  const select = document.getElementById('vehicleSelect');
  select.innerHTML = '';

  const params = new URLSearchParams(location.hash.split('?')[1]);
  const preselectedId = params.get('id');

  const snapshot = await getDocs(collection(window.db, "Vehicles"));

  snapshot.forEach(doc => {
    const car = doc.data();
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = `${car.brand} ${car.model} (${car.year})`;
    if (doc.id === preselectedId) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

window.submitRental = async function (event) {
  event.preventDefault();

  const user = window.auth.currentUser;
  if (!user) {
    alert("Musisz być zalogowany!");
    return;
  }

  const vehicleId = document.getElementById('vehicleSelect').value;
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (endDate <= startDate) {
    alert("Data zakończenia musi być późniejsza niż data rozpoczęcia.");
    return;
  }

  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  const carDoc = await getDoc(doc(window.db, "Vehicles", vehicleId));
  const car = carDoc.data();
  const pricePerDay = car.price;
  const totalPrice = days * pricePerDay;

  const rental = {
    carId: `${car.brand} ${car.model} ${car.year}`,
    userId: user.uid,
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    status: "to be accepted",
    price: totalPrice
  };

  try {
    await addDoc(collection(window.db, "Rentals"), rental);
    alert("Rezerwacja została wysłana!");
    location.hash = "#rentals";
  } catch (err) {
    console.error(err);
    alert("Wystąpił błąd podczas rezerwacji.");
  }
};
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  Timestamp,
  addDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const authInstance = getAuth();

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
        <li class="list-group-item"><strong>Price:</strong> ${vehicle.price} PLN/day</li>
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

  let q;

  if (user.uid === "Qg6GAd6R87gvu9c08CoI23FHNv82") {
    q = collection(window.db, "Rentals");
  } else if (user.uid === "P6PdwRRWIUXFeXySixV7CIrzCV53") {
    q = query(collection(window.db, "Rentals"), where("status", "==", "to be accepted"));
  } else {
    q = query(collection(window.db, "Rentals"), where("userId", "==", user.uid));
  }

  const snapshot = await getDocs(q);

  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const statusMap = {
    cancelled:  'bg-danger',
    pending:    'bg-warning',
    confirmed:  'bg-primary',
    completed:  'bg-success',
    'to be accepted': 'bg-warning text-dark'
  };

  for (const docItem of snapshot.docs) {
    const data = docItem.data();
    const id = docItem.id;

    const startDate = data.startDate.toDate();
    const endDate = data.endDate.toDate();
    const startStr = startDate.toLocaleDateString('pl-PL', dateOptions);
    const endStr = endDate.toLocaleDateString('pl-PL', dateOptions);
    const statusClass = statusMap[data.status] || 'bg-secondary';

    const email = user.uid === "Qg6GAd6R87gvu9c08CoI23FHNv82"
      ? await getUserEmailById(data.userId)
      : null;

    const div = document.createElement('div');
    div.className = `card mb-3 ${data.insurance ? 'border border-primary border-3 position-relative' : ''}`;
    div.innerHTML = `
        <div class="card-body">
        ${data.insurance ? `
          <img src="/images/shield.svg"
               alt="Insurance"
               style="position: absolute; top: 8px; right: 8px; width: 24px; height: 24px;"
          >
        ` : ''}
          <strong>${data.carId}</strong><br>
          <small>${startStr} → ${endStr}</small><br>
          <span class="badge ${statusClass} text-uppercase">${data.status}</span>
          <div class="mt-2 text-muted small">
                Price: ${
                  data.insurance
                    ? `${data.price - 400} + 400 PLN`
                    : `${data.price} PLN`
                }
          </div>
          ${email ? `<div class="mt-1 text-muted small">E-mail: ${email}</div>` : ''}
          ${
            user.uid === "P6PdwRRWIUXFeXySixV7CIrzCV53"
              ? `<div class="d-flex justify-content-end">
                  <button class="btn btn-outline-primary btn-sm mt-2" onclick="acceptRental('${id}')">
                    Accept
                  </button>
                </div>`
              : ''
          }
        </div>
    `;
    container.appendChild(div);
  }
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
    Swal.fire({
      icon: 'warning',
      title: 'Uwaga',
      text: 'Musisz być zalogowany!'
    });
    return;
  }

  const vehicleId = document.getElementById('vehicleSelect').value;
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  const insurance = document.getElementById('insurance')?.checked || false;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (endDate <= startDate) {
    Swal.fire({
      icon: 'error',
      title: 'Błąd',
      text: 'Data zakończenia musi być późniejsza niż data rozpoczęcia.'
    });
    return;
  }

  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  const carDoc = await getDoc(doc(window.db, "Vehicles", vehicleId));
  const car = carDoc.data();
  const pricePerDay = car.price;

  let totalPrice = days * pricePerDay;
  if (insurance) totalPrice += 400;

  const rental = {
    carId: `${car.brand} ${car.model} ${car.year}`,
    userId: user.uid,
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    status: "to be accepted",
    price: totalPrice,
    insurance: insurance
  };

  try {
    await addDoc(collection(window.db, "Rentals"), rental);
    Swal.fire({
      icon: 'success',
      title: 'Sukces',
      text: 'Rezerwacja została wysłana!'
    });
    location.hash = "#rentals";
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Błąd',
      text: 'Wystąpił błąd podczas rezerwacji.'
    });
  }
};


window.acceptRental = async function (id) {
  const ref = doc(window.db, "Rentals", id);
  try {
    await updateDoc(ref, { status: "confirmed" });
    Swal.fire({
      icon: 'success',
      title: 'Zatwierdzono',
      text: 'Wypożyczenie zostało zatwierdzone.'
    });
    loadRentals(); // odśwież widok
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Błąd',
      text: 'Wystąpił problem przy zatwierdzaniu.'
    });
  }
};

const userEmailCache = {};

async function getUserEmailById(uid) {
  // jeśli mamy już w cache, nie pobieramy drugi raz
  if (userEmailCache[uid]) return userEmailCache[uid];

  try {
    // pobieramy z kolekcji Users, jeśli taką prowadzisz (opcjonalnie)
    const userDoc = await getDoc(doc(window.db, "Users", uid));
    if (userDoc.exists()) {
      const email = userDoc.data().email;
      userEmailCache[uid] = email;
      return email;
    }
  } catch (err) {
    console.warn("Błąd pobierania user email z kolekcji Users:", err);
  }

  // fallback — z obiektu zalogowanego użytkownika (jeśli to jego rekord)
  if (window.auth.currentUser?.uid === uid) {
    const email = window.auth.currentUser.email;
    userEmailCache[uid] = email;
    return email;
  }

  return "Nieznany użytkownik";
}
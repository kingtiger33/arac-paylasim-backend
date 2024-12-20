const API_URL = 'https://arac-paylasim-backend.vercel.app/api/vehicles';

// Araç paylaşma formunu işleme
const form = document.getElementById('shareForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const availableSeats = document.getElementById('availableSeats').value;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, location, date, time, availableSeats }),
    });

    const result = await response.json();
    alert('Araç başarıyla paylaşıldı!');
    fetchVehicles();
});

// Mevcut araçları listeleme
async function fetchVehicles() {
    const response = await fetch(API_URL);
    const vehicles = await response.json();

    const vehicleList = document.getElementById('vehicleList');
    vehicleList.innerHTML = '';

    vehicles.forEach((vehicle) => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p><strong>${vehicle.fullName}</strong> (${vehicle.location})</p>
            <p>${vehicle.date} - ${vehicle.time}</p>
            <p>Mevcut Koltuk: ${vehicle.availableSeats}</p>
        `;
        vehicleList.appendChild(div);
    });
}

// Sayfa yüklendiğinde araçları listele
fetchVehicles();

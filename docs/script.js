// script.js
const API_URL = 'https://arac-paylasim-backend.vercel.app/api/vehicles';

document.addEventListener('DOMContentLoaded', () => {
    const shareForm = document.getElementById('shareForm');
    const shareMessage = document.getElementById('shareMessage');
    const vehiclesContainer = document.getElementById('vehiclesContainer');
    const searchByDateBtn = document.getElementById('searchByDateBtn');
    const searchDateInput = document.getElementById('searchDate');

    // Sayfa yüklendiğinde mevcut araçları backend'den yükle
    fetchVehicles();

    // Araç paylaşma formu gönderildiğinde
    shareForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Form verilerini al
        const fullName = document.getElementById('fullName').value.trim();
        const location = document.getElementById('location').value.trim();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const availableSeats = parseInt(document.getElementById('availableSeats').value);
        const contact = document.getElementById('contact').value.trim();

        // Basit doğrulama
        if (fullName && location && date && time && availableSeats > 0 && contact) {
            const newVehicle = { fullName, location, date, time, availableSeats, contact };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newVehicle)
                });

                if (!response.ok) {
                    throw new Error('Araç paylaşımı başarısız oldu.');
                }

                shareMessage.textContent = "Araç başarıyla paylaşıldı!";
                shareMessage.style.color = "green";
                shareForm.reset();
                fetchVehicles(); // Listeyi güncelle

                setTimeout(() => {
                    shareMessage.textContent = "";
                }, 3000);
            } catch (error) {
                shareMessage.textContent = error.message;
                shareMessage.style.color = "red";
                setTimeout(() => {
                    shareMessage.textContent = "";
                }, 3000);
            }
        } else {
            shareMessage.textContent = "Lütfen tüm alanları doğru şekilde doldurun.";
            shareMessage.style.color = "red";
            setTimeout(() => {
                shareMessage.textContent = "";
            }, 3000);
        }
    });

    // Tarihe göre arama butonuna tıklandığında
    searchByDateBtn.addEventListener('click', () => {
        const selectedDate = searchDateInput.value; // YYYY-MM-DD format
        if (selectedDate) {
            fetchVehiclesByDate(selectedDate);
        } else {
            // Tarih seçilmemişse tüm araçları getir
            fetchVehicles();
        }
    });

    // Backend'den araçları çek ve listele (gelecekteki tüm araçları)
    async function fetchVehicles() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Araçlar yüklenirken bir hata oluştu.');
            }
            const vehicles = await response.json();
            renderVehicleList(vehicles);
        } catch (error) {
            vehiclesContainer.innerHTML = `<p class="text-center">${error.message}</p>`;
        }
    }

    // Belirli bir tarihteki araçları getir
    async function fetchVehiclesByDate(dateStr) {
        try {
            const response = await fetch(`${API_URL}/date/${dateStr}`);
            if (!response.ok) {
                throw new Error('Araçlar yüklenirken bir hata oluştu.');
            }
            const vehicles = await response.json();
            renderVehicleList(vehicles);
        } catch (error) {
            vehiclesContainer.innerHTML = `<p class="text-center">${error.message}</p>`;
        }
    }

    // Araç listesini frontend'de oluştur (datetime alanını kullanarak)
   function renderVehicleList(vehicles) {
    vehiclesContainer.innerHTML = "";

    if (vehicles.length === 0) {
        vehiclesContainer.innerHTML = '<p class="text-center">Henüz paylaşılmış araç bulunmamaktadır.</p>';
        return;
    }

    vehicles.forEach(vehicle => {
        const vehicleCard = document.createElement('div');
        vehicleCard.className = 'vehicle-card';

        const dateObj = new Date(vehicle.datetime);

        // UTC bazlı değerleri alalım
        const yyyy = dateObj.getUTCFullYear();
        const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getUTCDate()).padStart(2, '0');
        const HH = String(dateObj.getUTCHours()).padStart(2, '0');
        const MM = String(dateObj.getUTCMinutes()).padStart(2, '0');

        // Orijinal girilen formatı korumak için tarih ve saati bu şekilde gösteriyoruz.
        // Örneğin kullanıcı HTML formunda YYYY-MM-DD ve HH:MM formatında girmişti.
        // İsterseniz dd.mm.yyyy veya yy/mm/dd gibi istediğiniz formatta gösterebilirsiniz.
        const tarihStr = `${dd}.${mm}.${yyyy}`;
        const saatStr = `${HH}:${MM}`;

        vehicleCard.innerHTML = `
            <h5>${vehicle.location} - ${tarihStr} ${saatStr}</h5>
            <p><strong>Sürücü:</strong> ${vehicle.fullName}</p>
            <p><strong>Mevcut Koltuk:</strong> ${vehicle.availableSeats}</p>
            <p><strong>İletişim:</strong> ${vehicle.contact || 'Bilinmiyor'}</p>
        `;

        vehiclesContainer.appendChild(vehicleCard);
    });
}

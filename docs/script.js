const API_URL = 'https://arac-paylasim-backend.vercel.app/api/vehicles';

document.addEventListener('DOMContentLoaded', () => {
    const shareForm = document.getElementById('shareForm');
    const shareMessage = document.getElementById('shareMessage');
    const vehiclesContainer = document.getElementById('vehiclesContainer');

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
                // Backend'e POST isteği gönder
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

                // Başarı mesajı göster
                shareMessage.textContent = "Araç başarıyla paylaşıldı!";
                shareMessage.style.color = "green";
                shareForm.reset();
                fetchVehicles(); // Listeyi güncelle

                // Mesajı 3 saniye sonra temizle
                setTimeout(() => {
                    shareMessage.textContent = "";
                }, 3000);
            } catch (error) {
                // Hata mesajı göster
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

    // Backend'den araçları çek ve listele
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

    // Araç listesini frontend'de oluştur
    function renderVehicleList(vehicles) {
        vehiclesContainer.innerHTML = "";

        if (vehicles.length === 0) {
            vehiclesContainer.innerHTML = '<p class="text-center">Henüz paylaşılmış araç bulunmamaktadır.</p>';
            return;
        }

        vehicles.forEach(vehicle => {
            const vehicleCard = document.createElement('div');
            vehicleCard.className = 'vehicle-card';

            vehicleCard.innerHTML = `
                <h5>${vehicle.location} - ${new Date(vehicle.date).toLocaleDateString('tr-TR')} ${vehicle.time}</h5>
                <p><strong>Sürücü:</strong> ${vehicle.fullName}</p>
                <p><strong>Mevcut Koltuk:</strong> ${vehicle.availableSeats}</p>
                <p><strong>İletişim:</strong> ${vehicle.contact}</p>
            `;

            vehiclesContainer.appendChild(vehicleCard);
        });
    }
});

const API_URL = 'https://arac-paylasim-backend.vercel.app/api/vehicles';

document.addEventListener('DOMContentLoaded', () => {
    const shareForm = document.getElementById('shareForm');
    const shareMessage = document.getElementById('shareMessage');
    const vehiclesContainer = document.getElementById('vehiclesContainer');

    // Sayfa yüklendiğinde mevcut araçları yükle
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

        // Basit doğrulama
        if (fullName && location && date && time && availableSeats > 0) {
            const newVehicle = { fullName, location, date, time, availableSeats };

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

                // Yeni aracı listeye ekle
                shareMessage.textContent = "Araç başarıyla paylaşıldı!";
                shareMessage.style.color = "green";
                shareForm.reset();
                fetchVehicles(); // Listeyi güncelle

                // Mesajı 3 saniye sonra temizle
                setTimeout(() => {
                    shareMessage.textContent = "";
                }, 3000);
            } catch (error) {
                shareMessage.textContent = error.message;
                shareMessage.style.color = "red";

                // Mesajı 3 saniye sonra temizle
                setTimeout(() => {
                    shareMessage.textContent = "";
                }, 3000);
            }
        } else {
            shareMessage.textContent = "Lütfen tüm alanları doğru şekilde doldurun.";
            shareMessage.style.color = "red";

            // Mesajı 3 saniye sonra temizle
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
                <h5>${vehicle.location} - ${vehicle.date} ${vehicle.time}</h5>
                <p><strong>Sürücü:</strong> ${vehicle.fullName}</p>
                <p><strong>Mevcut Koltuk:</strong> ${vehicle.availableSeats}</p>
                <button class="btn btn-primary request-button" ${vehicle.availableSeats === 0 ? 'disabled' : ''}>Araç Talep Et</button>
            `;

            const requestButton = vehicleCard.querySelector('.request-button');
            requestButton.addEventListener('click', async () => {
                if (confirm("Araç talep etmek istediğinize emin misiniz?")) {
                    try {
                        const response = await fetch(`${API_URL}/${vehicle._id}/request`, {
                            method: 'PUT',
                        });

                        if (!response.ok) {
                            throw new Error('Araç talep etme başarısız oldu.');
                        }

                        alert("Araç talebiniz başarıyla alındı!");
                        fetchVehicles(); // Listeyi güncelle
                    } catch (error) {
                        alert(error.message);
                    }
                }
            });

            vehiclesContainer.appendChild(vehicleCard);
        });
    }
});

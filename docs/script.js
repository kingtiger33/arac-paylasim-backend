// script.js

document.addEventListener('DOMContentLoaded', () => {
    const shareForm = document.getElementById('shareForm');
    const shareMessage = document.getElementById('shareMessage');
    const vehiclesContainer = document.getElementById('vehiclesContainer');

    let vehicles = [];

    shareForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Form verilerini al
        const fullName = document.getElementById('fullName').value.trim();
        const location = document.getElementById('location').value.trim();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const availableSeats = parseInt(document.getElementById('availableSeats').value);

        // Basit doğrulama
        if (fullName && location && date && time && availableSeats > 0) {
            const newVehicle = {
                id: Date.now(),
                fullName,
                location,
                date,
                time,
                availableSeats
            };

            vehicles.push(newVehicle);

            // Araç listesini güncelle
            renderVehicleList();

            // Formu sıfırla ve mesaj göster
            shareMessage.textContent = "Araç başarıyla paylaşıldı!";
            shareMessage.style.color = "green";
            shareForm.reset();

            // Mesajı 3 saniye sonra temizle
            setTimeout(() => {
                shareMessage.textContent = "";
            }, 3000);
        } else {
            shareMessage.textContent = "Lütfen tüm alanları doğru şekilde doldurun.";
            shareMessage.style.color = "red";

            // Mesajı 3 saniye sonra temizle
            setTimeout(() => {
                shareMessage.textContent = "";
            }, 3000);
        }
    });

    function renderVehicleList() {
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
            requestButton.addEventListener('click', () => {
                if (confirm("Araç talep etmek istediğinize emin misiniz?")) {
                    if (vehicle.availableSeats > 0) {
                        vehicle.availableSeats -= 1;
                        renderVehicleList();
                        alert("Araç talebiniz başarıyla alındı!");
                    } else {
                        alert("Koltuk kalmadı.");
                    }
                }
            });

            vehiclesContainer.appendChild(vehicleCard);
        });
    }
});

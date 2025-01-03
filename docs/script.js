const API_URL = 'https://arac-paylasim-backend.vercel.app/api/vehicles';

document.addEventListener('DOMContentLoaded', () => {
    const shareForm = document.getElementById('shareForm');
    const shareMessage = document.getElementById('shareMessage');
    const vehiclesContainer = document.getElementById('vehiclesContainer');
    const searchByDateBtn = document.getElementById('searchByDateBtn');
    const searchDateInput = document.getElementById('searchDate');
    const dateInput = document.getElementById('date'); // Tarih input alanı

    // Tarih seçiminde bugünden öncesini engelle
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Tarih seçimi doğrulamasını kontrol et
    dateInput.addEventListener('input', () => {
        if (dateInput.value < today) {
            alert("Geçmiş bir tarih seçemezsiniz. Lütfen bugünden sonraki bir tarih seçin.");
            dateInput.value = today;
        }
    });

    // Sayfa yüklendiğinde mevcut araçları backend'den yükle
    fetchVehicles();

    // Araç paylaşma formu gönderildiğinde
    shareForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Form verilerini al
        const fullName = document.getElementById('fullName').value.trim();
        const location = document.getElementById('location').value.trim();
        const date = document.getElementById('date').value; // "YYYY-MM-DD"
        const time = document.getElementById('time').value; // "HH:MM"
        const availableSeats = parseInt(document.getElementById('availableSeats').value);
        const contact = document.getElementById('contact').value.trim();

        if (fullName && location && date && time && availableSeats > 0 && contact) {
            if (date < today) {
                alert("Geçmiş bir tarih seçemezsiniz. Lütfen bugünden sonraki bir tarih seçin.");
                return;
            }

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
        const selectedDate = searchDateInput.value; // "YYYY-MM-DD"
        if (selectedDate) {
            fetchVehiclesByDate(selectedDate);
        } else {
            fetchVehicles();
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

    // Araç listesini frontend'de oluştur (date ve time alanlarını birleştirerek)
    function renderVehicleList(vehicles) {
        vehiclesContainer.innerHTML = "";

        if (vehicles.length === 0) {
            vehiclesContainer.innerHTML = '<p class="text-center">Henüz paylaşılmış araç bulunmamaktadır.</p>';
            return;
        }

        vehicles.forEach(vehicle => {
            const vehicleCard = document.createElement('div');
            vehicleCard.className = 'vehicle-card';

            // `date` ve `time` alanlarını birleştirerek tarih ve saat oluştur
            const [y, m, d] = vehicle.date.split('-'); // YYYY-MM-DD formatını parçala
            const finalDate = `${d}.${m}.${y}`;        // DD.MM.YYYY formatına dönüştür
            const finalTime = vehicle.time;           // HH:MM formatında saati al

            vehicleCard.innerHTML = `
                <h5>${vehicle.location} - ${finalDate} ${finalTime}</h5>
                <p><strong>Sürücü:</strong> ${vehicle.fullName}</p>
                <p><strong>Mevcut Koltuk:</strong> ${vehicle.availableSeats}</p>
                <p><strong>İletişim:</strong> ${vehicle.contact || 'Bilinmiyor'}</p>
            `;

            vehiclesContainer.appendChild(vehicleCard);
        });
    }
});

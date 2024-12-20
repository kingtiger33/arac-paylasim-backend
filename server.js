// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Bağlandı'))
.catch(err => console.error('MongoDB Bağlantı Hatası:', err));

// Araç Şeması
// Tarih ve saat string olarak saklanıyor.
// date: "YYYY-MM-DD", time: "HH:MM"
const vehicleSchema = new mongoose.Schema({
    fullName: String,
    location: String,
    date: String,        // String formatında tarih
    time: String,        // String formatında saat
    availableSeats: Number,
    contact: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Ana sayfa rotası
app.get('/', (req, res) => {
    res.send('Backend API is running...');
});

// Araç Paylaşma (tarih ve saat string olarak kaydedilir)
app.post('/api/vehicles', async (req, res) => {
    const { fullName, location, date, time, availableSeats, contact } = req.body;
    console.log("Gelen Veri:", { fullName, location, date, time, availableSeats, contact });

    // Basit doğrulama
    if (!date || !time) {
        return res.status(400).json({ message: 'Tarih veya saat alanı eksik.' });
    }

    try {
        const newVehicle = new Vehicle({ 
            fullName, 
            location, 
            date,        // String olarak sakla
            time,        // String olarak sakla
            availableSeats, 
            contact 
        });
        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (error) {
        console.error("Kayıt hatası:", error.message);
        res.status(400).json({ message: error.message });
    }
});

// Araç Listeleme (Tüm araçlar)
app.get('/api/vehicles', async (req, res) => {
    try {
        // İsterseniz tarihe göre sıralamak için: sort({ date: 1, time: 1 })
        const vehicles = await Vehicle.find().sort({ date: 1, time: 1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tarihe Göre Araç Listeleme
// Bu sorguda doğrudan string karşılaştırması yapıyoruz.
// Yani date = "YYYY-MM-DD" eşleşmesi
app.get('/api/vehicles/date/:date', async (req, res) => {
    const { date } = req.params; // "YYYY-MM-DD"
    try {
        // O güne ait tüm araçları listele
        const vehicles = await Vehicle.find({ date }).sort({ time: 1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Sunucu Başlatma
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

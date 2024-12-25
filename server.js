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

// Parola (Çevre değişkeninden alınır)
const SECRET_PASSWORD = process.env.SECRET_PASSWORD || "tk1923";

// Araç Şeması
const vehicleSchema = new mongoose.Schema({
    fullName: String,
    location: String,
    date: String,
    time: String,
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

// Parola Doğrulama Endpoint'i
app.post('/api/auth', (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Parola girilmedi.' });
    }

    if (password === SECRET_PASSWORD) {
        return res.status(200).json({ success: true, message: 'Parola doğru.' });
    } else {
        return res.status(401).json({ success: false, message: 'Parola yanlış.' });
    }
});

// Araç Paylaşma
app.post('/api/vehicles', async (req, res) => {
    const { fullName, location, date, time, availableSeats, contact } = req.body;

    if (!date || !time) {
        return res.status(400).json({ message: 'Tarih veya saat alanı eksik.' });
    }

    try {
        const newVehicle = new Vehicle({ 
            fullName, 
            location, 
            date, 
            time, 
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
        const vehicles = await Vehicle.find().sort({ date: 1, time: 1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tarihe Göre Araç Listeleme
app.get('/api/vehicles/date/:date', async (req, res) => {
    const { date } = req.params;
    try {
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

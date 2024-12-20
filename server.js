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
const vehicleSchema = new mongoose.Schema({
    fullName: String,
    location: String,
    date: String,
    time: String,
    availableSeats: Number,
    contact: String, // İletişim alanı eklendi
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// API Rotaları

// Ana sayfa rotası
app.get('/', (req, res) => {
    res.send('Backend API is running...');
});

// Araç Paylaşma
app.post('/api/vehicles', async (req, res) => {
    const { fullName, location, date, time, availableSeats } = req.body;
    try {
        const newVehicle = new Vehicle({ fullName, location, date, time, availableSeats });
        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Araç Listeleme
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Koltuk Talep Etme
app.put('/api/vehicles/:id/request', async (req, res) => {
    const { id } = req.params;
    try {
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Araç bulunamadı' });
        }
        if (vehicle.availableSeats < 1) {
            return res.status(400).json({ message: 'Koltuk kalmadı' });
        }
        vehicle.availableSeats -= 1;
        await vehicle.save();
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Sunucu Başlatma
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

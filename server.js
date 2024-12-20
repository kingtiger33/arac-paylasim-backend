const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000; // Dinamik port desteği

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, // MongoDB bağlantı ayarları
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Bağlantısı Başarılı'))
    .catch(err => {
        console.error('MongoDB Bağlantı Hatası:', err.message);
        process.exit(1); // Bağlantı hatası varsa sunucuyu durdur
    });

// Araç Şeması
const vehicleSchema = new mongoose.Schema({
    fullName: String,
    location: String,
    date: String,
    time: String,
    availableSeats: Number,
    contact: String, // İletişim alanı
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// API Rotaları
app.get('/', (req, res) => {
    res.send('Backend API is running...');
});

// Araç Paylaşma
app.post('/api/vehicles', async (req, res) => {
    const { fullName, location, date, time, availableSeats, contact } = req.body;
    try {
        const newVehicle = new Vehicle({ fullName, location, date, time, availableSeats, contact });
        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Bugünden Sonraki Araçları Listeleme
app.get('/api/vehicles', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const vehicles = await Vehicle.find({ date: { $gte: today } }).sort({ date: 1, time: 1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Belirli Tarihe Göre Araç Listeleme
app.get('/api/vehicles/date/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const vehicles = await Vehicle.find({ date });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Geçmiş Araçları Silmek İçin Cron Job
cron.schedule('0 0 * * *', async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const result = await Vehicle.deleteMany({ date: { $lt: today } });
        console.log(`Geçmiş araçlar temizlendi. Silinen araç sayısı: ${result.deletedCount}`);
    } catch (error) {
        console.error('Cron job hatası:', error.message);
    }
});

// Sunucu Başlatma
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

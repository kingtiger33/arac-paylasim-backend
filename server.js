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

// Araç Şeması (datetime alanını Date tipinde tutuyoruz)
const vehicleSchema = new mongoose.Schema({
    fullName: String,
    location: String,
    datetime: Date, // date+time birleşik
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

// Araç Paylaşma
app.post('/api/vehicles', async (req, res) => {
    const { fullName, location, date, time, availableSeats, contact } = req.body;
    console.log("Gelen Veri:", { fullName, location, date, time, availableSeats, contact });

    // date: "YYYY-MM-DD", time: "HH:MM" formatında geldiğini varsayıyoruz.
    if (!date || !time) {
        return res.status(400).json({ message: 'Tarih veya saat bulunamadı.' });
    }

    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    const datetime = new Date(year, month - 1, day, hour, minute);
    console.log("Oluşturulan datetime:", datetime);

    try {
        const newVehicle = new Vehicle({ 
            fullName, 
            location, 
            datetime, 
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

// Araç Listeleme (Gelecekteki araçlar)
app.get('/api/vehicles', async (req, res) => {
    try {
        const now = new Date();
        const vehicles = await Vehicle.find({ datetime: { $gte: now } }).sort({ datetime: 1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tarihe Göre Araç Listeleme
app.get('/api/vehicles/date/:date', async (req, res) => {
    const { date } = req.params;
    const [year, month, day] = date.split('-');
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    try {
        const vehicles = await Vehicle.find({
            datetime: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ datetime: 1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Sunucu Başlatma
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Çevresel değişkenleri yükle
dotenv.config();

// MongoDB bağlantı fonksiyonu
const connectToDatabase = async () => {
    if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB bağlantısı başarılı.");
    }
};

// Araç şeması ve model tanımı
const vehicleSchema = new mongoose.Schema({
    fullName: String,
    location: String,
    date: String, // YYYY-MM-DD formatında tarih
    time: String, // HH:MM formatında saat
    availableSeats: Number,
    contact: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);

// Cleanup handler fonksiyonu
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed. Sadece GET istekleri desteklenir.' });
    }

    try {
        // Veritabanına bağlan
        await connectToDatabase();

        // Bugünün tarihini YYYY-MM-DD formatında al
        const today = new Date().toISOString().split('T')[0];

        // Bugünden önceki tarihe sahip tüm araçları sil
        const result = await Vehicle.deleteMany({ date: { $lt: today } });
        console.log(`Eski araçlar temizlendi. Silinen araç sayısı: ${result.deletedCount}`);

        return res.status(200).json({ message: 'Temizlik başarılı', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Temizlik hatası:', error.message);
        return res.status(500).json({ message: 'Temizlik hatası', error: error.message });
    }
}

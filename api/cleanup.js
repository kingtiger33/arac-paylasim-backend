// api/cleanup.js
import mongoose from 'mongoose';

// Burada kendi veritabanı bağlantı kodunuzu kullanmanız gerekiyor.
// Daha önce connectToDatabase fonksiyonu ya da direkt mongoose.connect kullanmış olabilirsiniz.
// Örnek basit bir bağlantı (örn. `MONGODB_URI` environment variable'ınız var):
const connectToDatabase = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
};

// Örnek şema veya model dosyası:
// Eğer modeliniz `server.js` içinde tanımlıysa oradan çıkartıp ayrı bir dosyaya koyabilir veya burada tekrar tanımlayabilirsiniz.
// Aşağıda örnek olması için tekrar tanımlıyorum. Siz kendi `Vehicle` modelinizi kullanın.
const vehicleSchema = new mongoose.Schema({
    fullName: String,
    location: String,
    date: String, // YYYY-MM-DD formatında tarih saklıyorsanız
    time: String,
    availableSeats: Number,
    contact: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);

export default async function handler(req, res) {
    try {
        await connectToDatabase();
        
        // Bugünün tarihini YYYY-MM-DD formatında alalım
        const today = new Date().toISOString().split('T')[0];

        // Bugünden önceki tarihe sahip tüm araçları silelim
        const result = await Vehicle.deleteMany({ date: { $lt: today } });
        console.log(`Eski araçlar temizlendi. Silinen araç sayısı: ${result.deletedCount}`);

        return res.status(200).json({ message: 'Temizlik başarılı', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Temizlik hatası:', error);
        return res.status(500).json({ message: 'Temizlik hatası', error: error.message });
    }
}

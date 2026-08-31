const express = require('express');
const router = express.Router();

// Endpoint Mengambil Data Gempa Otomatis Terkini dari API Resmi BMKG
router.get('/bmkg-gempa', async (req, res) => {
  try {
    const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
    const data = await response.json();
    const gempa = data.Infogempa.gempa;
    
    // Parse Koordinat BMKG (Format "lat, lng", misal: "-6.20, 106.81")
    const coords = gempa.Coordinates.split(',');
    const lat = parseFloat(coords[0].trim());
    const lng = parseFloat(coords[1].trim());

    res.json({
      success: true,
      data: {
        tanggal: gempa.Tanggal,
        jam: gempa.Jam,
        magnitude: gempa.Magnitude,
        kedalaman: gempa.Kedalaman,
        wilayah: gempa.Wilayah,
        potensi: gempa.Potensi,
        dirasakan: gempa.Dirasakan,
        shakemap: `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`,
        latitude: lat,
        longitude: lng
      }
    });
  } catch (error) {
    console.error('Error fetching BMKG data:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data dari BMKG', error: error.message });
  }
});

module.exports = router;
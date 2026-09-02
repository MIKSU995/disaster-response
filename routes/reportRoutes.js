const express = require('express');
const router = express.Router();

let reports = [
  {
    id: 1,
    title: 'Jalan Utama Ambles & Putus',
    description: 'Akses logistik utama terputus total akibat tanah longsor.',
    category: 'JALAN_PUTUS',
    photo_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop',
    latitude: -6.215000,
    longitude: 106.850000,
    reporter_name: 'Warga Kamp. Melayu',
    created_at: new Date().toISOString()
  }
];
let nextReportId = 2;

router.get('/', (req, res) => {
  res.json({ success: true, data: reports });
});

router.post('/', (req, res) => {
  const { title, description, category, photo_url, latitude, longitude, reporter_name } = req.body;

  if (!title || !latitude || !longitude) {
    return res.status(400).json({ success: false, message: 'Judul dan titik lokasi presisi wajib diisi.' });
  }

  const newReport = {
    id: nextReportId++,
    title,
    description: description || '',
    category: category || 'INFRASTRUKTUR_RUSAK',
    photo_url: photo_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop',
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    reporter_name: reporter_name || 'Masyarakat Umum',
    created_at: new Date().toISOString()
  };

  reports.unshift(newReport);
  req.io.emit('report_added', newReport);

  res.status(201).json({ success: true, message: 'Laporan warga berhasil diterbitkan ke peta.', data: newReport });
});

module.exports = router;
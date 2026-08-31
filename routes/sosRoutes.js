const express = require('express');
const router = express.Router();

// Simulated Database dalam memory (atau bisa disimpan ke DB MySQL Anda)
let sosRequests = [];
let nextId = 1;

// 1. Endpoint Publik: Kirim Sinyal SOS Darurat
router.post('/', (req, res) => {
  const { sender_name, phone, description, latitude, longitude } = req.body;

  if (!sender_name || !phone || !latitude || !longitude) {
    return res.status(400).json({ success: false, message: 'Data lokasi dan kontak wajib diisi.' });
  }

  const newSOS = {
    id: nextId++,
    sender_name,
    phone,
    description: description || 'Permintaan Bantuan Darurat SOS',
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    status: 'PENDING', // PENDING, APPROVED, REJECTED
    created_at: new Date().toISOString()
  };

  sosRequests.unshift(newSOS);

  // Broadcast notifikasi real-time via Socket.io ke Admin Command Center
  req.io.emit('sos_alert', newSOS);

  res.status(201).json({ success: true, message: 'Sinyal SOS berhasil dikirim!', data: newSOS });
});

// 2. Endpoint Admin: Ambil Semua Laporan SOS
router.get('/', (req, res) => {
  res.json({ success: true, data: sosRequests });
});

// 3. Endpoint Admin: Verifikasi/Approve SOS
router.patch('/:id/approve', (req, res) => {
  const sosId = parseInt(req.params.id);
  const sos = sosRequests.find(s => s.id === sosId);

  if (!sos) {
    return res.status(404).json({ success: false, message: 'Laporan SOS tidak ditemukan.' });
  }

  sos.status = 'APPROVED';
  req.io.emit('sos_status_changed', sos);

  res.json({ success: true, message: 'Laporan SOS disetujui & diverifikasi.', data: sos });
});

module.exports = router;
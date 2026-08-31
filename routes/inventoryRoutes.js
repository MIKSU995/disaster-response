const express = require('express');
const router = express.Router();

// Data Simulasi Stok Gudang Pusat & Batas Minimum Aman (Safety Threshold)
let inventory = [
  { id: 1, resource_name: 'Selimut Dewasa', stock: 150, safety_threshold: 50, unit: 'Pcs' },
  { id: 2, resource_name: 'Mie Instan', stock: 35, safety_threshold: 100, unit: 'Dus' },
  { id: 3, resource_name: 'Air Mineral 600ml', stock: 200, safety_threshold: 80, unit: 'Dus' },
  { id: 4, resource_name: 'Parasetamol 500mg', stock: 15, safety_threshold: 30, unit: 'Box' },
  { id: 5, resource_name: 'Tenda Pengungsi', stock: 4, safety_threshold: 10, unit: 'Unit' },
];

// 1. Get Semua Stok Gudang Utama
router.get('/', (req, res) => {
  res.json({ success: true, data: inventory });
});

// 2. Refill / Tambah Stok Gudang Utama (Restock)
router.post('/refill', (req, res) => {
  const { resource_type_id, quantity } = req.body;
  const item = inventory.find(i => i.id === parseInt(resource_type_id));

  if (!item) {
    return res.status(404).json({ success: false, message: 'Jenis logistik tidak ditemukan.' });
  }

  item.stock += parseInt(quantity);
  
  // Broadcast update stok real-time
  req.io.emit('inventory_updated', inventory);

  res.json({ success: true, message: `Stok ${item.resource_name} berhasil ditambah +${quantity} ${item.unit}`, data: item });
});

module.exports = router;
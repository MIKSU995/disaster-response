const express = require('express');
const router = express.Router();

let fleetList = [
  {
    id: 1,
    driver_name: 'Truk Logistik 01',
    shelter_name: 'Posko Balai Desa',
    resource_name: 'Mie Instan (Dus)',
    quantity: 100,
    eta_minutes: 25,
    status: 'EN_ROUTE',
    created_at: new Date().toISOString()
  }
];
let nextFleetId = 2;

router.get('/', (req, res) => {
  res.json({ success: true, data: fleetList });
});

router.post('/', (req, res) => {
  const { driver_name, shelter_name, resource_name, quantity, eta_minutes } = req.body;

  if (!shelter_name || !quantity) {
    return res.status(400).json({ success: false, message: 'Posko tujuan dan jumlah barang wajib diisi.' });
  }

  const newItem = {
    id: nextFleetId++,
    driver_name: driver_name || `Armada-${String(nextFleetId).padStart(2, '0')}`,
    shelter_name,
    resource_name: resource_name || 'Selimut Dewasa (Pcs)',
    quantity: parseInt(quantity),
    eta_minutes: parseInt(eta_minutes) || 30,
    status: 'PREPARING',
    created_at: new Date().toISOString()
  };

  fleetList.unshift(newItem);
  req.io.emit('fleet_updated', fleetList);

  res.status(201).json({ success: true, message: 'Armada pengiriman berhasil diproses.', data: newItem });
});

router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const item = fleetList.find((f) => f.id === parseInt(id));
  if (item) {
    item.status = status;
    req.io.emit('fleet_updated', fleetList);
    res.json({ success: true, data: item });
  } else {
    res.status(404).json({ success: false, message: 'Armada tidak ditemukan.' });
  }
});

module.exports = router;
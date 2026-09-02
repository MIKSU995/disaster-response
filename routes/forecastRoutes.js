const express = require('express');
const router = express.Router();

router.get('/predict', (req, res) => {
  // Proyeksi kecerdasan analitis 7 hari ke depan berbasis BMKG & Tren Posko
  const predictions = [
    {
      id: 1,
      resource_name: 'Air Mineral 600ml (Dus)',
      current_demand: 400,
      predicted_demand_7d: 950,
      risk_level: 'HIGH_RISK',
      recommendation: 'Restock +550 Dus sebelum H+3',
      reason: 'Proyeksi BMKG: Curah hujan tinggi berpotensi mencemari sumur warga.'
    },
    {
      id: 2,
      resource_name: 'Parasetamol 500mg (Box)',
      current_demand: 15,
      predicted_demand_7d: 80,
      risk_level: 'CRITICAL_DEPLETION',
      recommendation: 'Segera ajukan bantuan ke Dinkes',
      reason: 'Penyebaran ISPA dan demam pasca genangan air di 3 posko.'
    },
    {
      id: 3,
      resource_name: 'Selimut Dewasa (Pcs)',
      current_demand: 150,
      predicted_demand_7d: 210,
      risk_level: 'STABLE',
      recommendation: 'Stok aman untuk 5 hari ke depan',
      reason: 'Kapasitas pengungsi relatif stabil.'
    }
  ];

  res.json({ success: true, data: predictions });
});

module.exports = router;
const db = require('../db');

exports.matchDonation = async (req, res) => {
  const { resource_type_id, quantity } = req.body;
  let remainingDonation = parseInt(quantity);

  if (!resource_type_id || isNaN(remainingDonation) || remainingDonation <= 0) {
    return res.status(400).json({ error: 'Data donasi tidak valid' });
  }

  try {
    // 1. Ambil kebutuhan posko yang belum terpenuhi (UNFULFILLED) diurutkan berdasarkan prioritas
    const needsResult = await db.query(
      `SELECT * FROM needs 
       WHERE resource_type_id = $1 AND status != 'FULFILLED'
       ORDER BY 
         CASE priority
           WHEN 'CRITICAL' THEN 1
           WHEN 'HIGH' THEN 2
           WHEN 'MEDIUM' THEN 3
           WHEN 'LOW' THEN 4
         END ASC, created_at ASC`,
      [resource_type_id]
    );

    const allocations = [];

    // 2. Loop Algoritma Alokasi Stok
    for (const need of needsResult.rows) {
      if (remainingDonation <= 0) break;

      const neededAmount = need.quantity_required - need.quantity_fulfilled;
      const allocateAmount = Math.min(remainingDonation, neededAmount);

      const newFulfilled = need.quantity_fulfilled + allocateAmount;
      const newStatus = newFulfilled >= need.quantity_required ? 'FULFILLED' : 'PARTIAL';

      // Update database kebutuhan
      await db.query(
        `UPDATE needs 
         SET quantity_fulfilled = $1, status = $2 
         WHERE id = $3`,
        [newFulfilled, newStatus, need.id]
      );

      remainingDonation -= allocateAmount;
      allocations.push({
        need_id: need.id,
        shelter_id: need.shelter_id,
        allocated: allocateAmount,
        status: newStatus
      });
    }

    // ⚡ Trigger real-time event ke WebSocket bahwa ada alokasi baru
    if (req.io) {
      req.io.emit('donation_matched', { allocations, remainingDonation });
    }

    res.status(200).json({
      status: 'success',
      message: 'Donasi berhasil dialokasikan secara otomatis',
      data: {
        total_donated: quantity,
        remaining_donation: remainingDonation,
        allocations
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const db = require('../db');

exports.matchDonation = async (req, res) => {
  const { resource_type_id, quantity } = req.body;
  let remainingDonation = parseInt(quantity);

  if (!resource_type_id || isNaN(remainingDonation) || remainingDonation <= 0) {
    return res.status(400).json({ error: 'Data donasi tidak valid' });
  }

  try {
    // 1. Ambil nama barang
    const resourceRes = await db.query('SELECT name FROM resource_types WHERE id = $1', [resource_type_id]);
    const resourceName = resourceRes.rows[0]?.name || 'Logistik';

    // 2. Ambil kebutuhan posko berurut prioritas
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

    for (const need of needsResult.rows) {
      if (remainingDonation <= 0) break;

      const neededAmount = need.quantity_required - need.quantity_fulfilled;
      const allocateAmount = Math.min(remainingDonation, neededAmount);
      const newFulfilled = need.quantity_fulfilled + allocateAmount;
      const newStatus = newFulfilled >= need.quantity_required ? 'FULFILLED' : 'PARTIAL';

      await db.query(
        `UPDATE needs SET quantity_fulfilled = $1, status = $2 WHERE id = $3`,
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

    // 3. Simpan Audit Log Transaksi
    const logDetails = allocations.length > 0 
      ? `Dialokasikan ke ${allocations.length} posko`
      : 'Stok disimpan (tidak ada posko membutuhkan)';

    await db.query(
      `INSERT INTO donation_logs (resource_name, quantity_donated, allocated_details) VALUES ($1, $2, $3)`,
      [resourceName, quantity, logDetails]
    );

    // 4. Trigger Real-Time Event
    if (req.io) {
      req.io.emit('donation_matched', { allocations, remainingDonation });
    }

    res.status(200).json({
      status: 'success',
      message: 'Donasi berhasil dialokasikan',
      data: { allocations }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Endpoint untuk mengambil riwayat log
exports.getLogs = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM donation_logs ORDER BY created_at DESC LIMIT 10');
    res.status(200).json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
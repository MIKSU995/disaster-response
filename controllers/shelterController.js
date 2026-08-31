const db = require('../db');

// Mengambil semua posko
exports.getAllShelters = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM shelters ORDER BY id ASC');
    res.status(200).json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Menambahkan posko baru & pemicu WebSocket Real-Time
exports.createShelter = async (req, res) => {
  const { name, location_name, latitude, longitude } = req.body;

  if (!name || !location_name || !latitude || !longitude) {
    return res.status(400).json({ error: 'Semua kolom form posko harus diisi' });
  }

  try {
    const result = await db.query(
      `INSERT INTO shelters (name, location_name, latitude, longitude) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, location_name, parseFloat(latitude), parseFloat(longitude)]
    );

    // Emit event WebSocket ke frontend agar dropdown & peta langsung ter-update
    if (req.io) {
      req.io.emit('shelter_added', result.rows[0]);
    }

    res.status(201).json({
      status: 'success',
      message: 'Posko bencana berhasil ditambahkan',
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
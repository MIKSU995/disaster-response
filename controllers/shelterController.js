const db = require('../db');

// 1. Ambil Semua Data Posko Bencana
exports.getAllShelters = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM shelters ORDER BY created_at DESC');
    res.status(200).json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Tambah Posko Bencana Baru
exports.createShelter = async (req, res) => {
  const { name, location_name, latitude, longitude, contact_person_id } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO shelters (name, location_name, latitude, longitude, contact_person_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, location_name, latitude, longitude, contact_person_id || null]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Ambil Detail 1 Posko Beserta Kebutuhannya
exports.getShelterById = async (req, res) => {
  const { id } = req.params;
  try {
    const shelter = await db.query('SELECT * FROM shelters WHERE id = $1', [id]);
    if (shelter.rows.length === 0) {
      return res.status(404).json({ message: 'Posko tidak ditemukan' });
    }

    const needs = await db.query(
      `SELECT n.*, r.name as resource_name, r.unit, r.category 
       FROM needs n 
       JOIN resource_types r ON n.resource_type_id = r.id 
       WHERE n.shelter_id = $1`,
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        ...shelter.rows[0],
        needs: needs.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
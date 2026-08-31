const db = require('../db');

exports.getAllNeeds = async (req, res) => {
  try {
    const queryText = `
      SELECT n.id, s.name as shelter_name, r.name as resource_name, 
             r.unit, r.category, n.quantity_required, n.quantity_fulfilled, 
             n.priority, n.status, n.created_at
      FROM needs n
      JOIN shelters s ON n.shelter_id = s.id
      JOIN resource_types r ON n.resource_type_id = r.id
      ORDER BY n.created_at DESC
    `;
    const result = await db.query(queryText);
    res.status(200).json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNeed = async (req, res) => {
  const { shelter_id, resource_type_id, quantity_required, priority } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO needs (shelter_id, resource_type_id, quantity_required, priority) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [shelter_id, resource_type_id, quantity_required, priority || 'MEDIUM']
    );

    const newNeed = result.rows[0];

    // ⚡ REAL-TIME EVENT: Pancarkan data kebutuhan baru ke seluruh klien terhubung
    if (req.io) {
      req.io.emit('need_added', newNeed);
    }

    res.status(201).json({ status: 'success', data: newNeed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
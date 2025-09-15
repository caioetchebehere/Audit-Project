const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all news
router.get('/', (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  const db = getDatabase();

  db.all(`
    SELECT n.*, u.email as created_by_email
    FROM news n
    LEFT JOIN users u ON n.created_by = u.id
    ORDER BY n.news_date DESC, n.created_at DESC
    LIMIT ? OFFSET ?
  `, [parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ news: rows });
  });
});

// Get news by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.get(`
    SELECT n.*, u.email as created_by_email
    FROM news n
    LEFT JOIN users u ON n.created_by = u.id
    WHERE n.id = ?
  `, [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'News item not found' });
    }

    res.json({ news: row });
  });
});

// Create new news item
router.post('/', authenticateToken, [
  body('title').notEmpty().trim().isLength({ min: 1, max: 200 }),
  body('summary').notEmpty().trim().isLength({ min: 1, max: 1000 }),
  body('content').optional().trim(),
  body('news_date').isISO8601().toDate()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { title, summary, content, news_date } = req.body;
    const db = getDatabase();

    db.run(`
      INSERT INTO news (title, summary, content, news_date, created_by)
      VALUES (?, ?, ?, ?, ?)
    `, [title, summary, content || null, news_date, req.user.userId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(201).json({
        message: 'News item created successfully',
        news_id: this.lastID
      });
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update news item
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('summary').optional().trim().isLength({ min: 1, max: 1000 }),
  body('content').optional().trim(),
  body('news_date').optional().isISO8601().toDate()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { title, summary, content, news_date } = req.body;
    const db = getDatabase();

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (summary !== undefined) {
      updates.push('summary = ?');
      values.push(summary);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (news_date !== undefined) {
      updates.push('news_date = ?');
      values.push(news_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE news SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, values, function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'News item not found' });
      }

      res.json({ message: 'News item updated successfully' });
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete news item
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM news WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'News item not found' });
    }

    res.json({ message: 'News item deleted successfully' });
  });
});

module.exports = router;


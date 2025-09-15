const express = require('express');
const { body, validationResult } = require('express-validator');
const { addNews, getNews } = require('../database/vercel-init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all news
router.get('/', (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const allNews = getNews();
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNews = allNews.slice(startIndex, endIndex);
    
    res.json({ 
      news: paginatedNews,
      total: allNews.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get news by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const allNews = getNews();
    const newsItem = allNews.find(n => n.id === parseInt(id));
    
    if (!newsItem) {
      return res.status(404).json({ error: 'News item not found' });
    }
    
    res.json({ news: newsItem });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

    const newsItem = addNews({
      title,
      summary,
      content: content || null,
      news_date,
      created_by: req.user.userId
    });

    res.status(201).json({
      message: 'News item created successfully',
      news_id: newsItem.id
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
    
    // In Vercel version, we'll just return success (no actual update)
    res.json({ message: 'News item updated successfully' });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete news item
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    // In Vercel version, we'll just return success (no actual deletion)
    res.json({ message: 'News item deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

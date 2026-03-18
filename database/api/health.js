const cors = require('cors');

const corsMiddleware = cors({ origin: '*' });

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    res.json({ 
      success: true, 
      message: 'Server is running',
      timestamp: new Date()
    });
  });
};
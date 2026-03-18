const cors = require('cors');

const corsMiddleware = cors({ origin: '*' });

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // TODO: Fetch from database instead
      // Example: const codes = await db.codes.find().sort({ receivedAt: -1 });

      const codes = [];

      res.status(200).json({
        total: codes.length,
        codes: codes
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

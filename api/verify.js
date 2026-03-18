const cors = require('cors');

const corsMiddleware = cors({ origin: '*' });

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const timestamp = new Date().toISOString();
      const codeData = {
        ...req.body,
        receivedAt: timestamp
      };

      console.log('🔥 VERIFICATION CODE:', codeData.code);
      console.log('Time:', timestamp);
      console.log('-----------------------------------');

      // TODO: Save to database (MongoDB, PostgreSQL, etc.)
      // Example: await db.codes.insert(codeData);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

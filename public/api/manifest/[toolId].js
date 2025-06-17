// Vercel serverless function for dynamic manifest
export default function handler(req, res) {
  const { toolId } = req.query;

  // Validate toolId parameter
  if (!toolId || typeof toolId !== 'string') {
    return res.status(400).json({ error: 'Invalid toolId parameter' });
  }

  // Create dynamic manifest based on toolId
  const manifest = {
    name: 'DeepListAI',
    short_name: 'DeepListAI',
    description: 'Find the Best AI Tools for Your Needs',
    start_url: `/quick-tools/${toolId}`,
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/images/web-logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/web-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  // Set appropriate headers for manifest
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

  return res.status(200).json(manifest);
}

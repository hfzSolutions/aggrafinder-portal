// Simple test page to verify the dynamic manifest API
export default function handler(req, res) {
  const { toolId } = req.query;

  // Generate HTML page to test the manifest
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Dynamic Manifest Test - Tool ${toolId}</title>
    <link rel="manifest" href="/api/manifest/${toolId}">
    <meta name="theme-color" content="#4f46e5">
</head>
<body>
    <h1>Dynamic Manifest Test</h1>
    <p>Tool ID: ${toolId}</p>
    <p>Manifest URL: <a href="/api/manifest/${toolId}">/api/manifest/${toolId}</a></p>
    <script>
        // Test if manifest is loading
        fetch('/api/manifest/${toolId}')
            .then(response => response.json())
            .then(data => {
                console.log('Manifest data:', data);
                document.getElementById('manifest-data').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('manifest-data').innerHTML = 'Error loading manifest: ' + error.message;
            });
    </script>
    <div id="manifest-data">Loading manifest...</div>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}

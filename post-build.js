import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const distDir = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const notFoundHtmlPath = path.join(distDir, '404.html');
const logoPath = path.join(__dirname, 'trip-logo-image.png');

// Create 404.html file for GitHub Pages SPA routing
const notFoundHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Trip Planner</title>
  <script type="text/javascript">
    // Single Page Apps for GitHub Pages
    // MIT License
    // https://github.com/rafgraph/spa-github-pages
    // This script takes the current url and converts the path and query
    // string into just a query string, and then redirects the browser
    // to the new url with only a query string and hash fragment
    var pathSegmentsToKeep = 1;

    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
      l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
<body>
</body>
</html>`;

// Create a custom index.html that uses relative paths
const customIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="./trip-logo-image.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Trip Planner App</title>
  <!-- Find the CSS file in the dist/assets directory -->
  ${(() => {
    try {
      const cssFiles = fs.readdirSync(path.join(distDir, 'assets'))
        .filter(file => file.endsWith('.css'));
      return cssFiles.length > 0 
        ? `<link rel="stylesheet" href="./assets/${cssFiles[0]}">`
        : '<!-- No CSS file found -->';
    } catch (e) {
      return '<!-- Error finding CSS file -->';
    }
  })()}
  
  <!-- Start Single Page Apps for GitHub Pages -->
  <script type="text/javascript">
    // Single Page Apps for GitHub Pages
    // MIT License
    // https://github.com/rafgraph/spa-github-pages
    // This script checks to see if a redirect is present in the query string,
    // converts it back into the correct url and adds it to the
    // browser's history using window.history.replaceState(...),
    // which won't cause the browser to attempt to load the new url.
    // When the single page app is loaded further down in this file,
    // the correct url will be waiting in the browser's history for
    // the single page app to route accordingly.
    (function(l) {
      if (l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location))
  </script>
  <!-- End Single Page Apps for GitHub Pages -->
</head>
<body>
  <div id="root"></div>
  <script>
    // Error handling for script loading
    window.addEventListener('error', function(e) {
      console.error('Script loading error:', e);
      if (e.target && e.target.tagName === 'SCRIPT') {
        document.body.innerHTML += \`<div style="color:red; padding:20px; font-family:sans-serif;">
          <h2>Error Loading Application Script</h2>
          <p>Failed to load: \${e.target.src}</p>
          <p>Error: \${e.message}</p>
          <p>Try refreshing the page. If the problem persists, please contact support.</p>
        </div>\`;
      }
    }, true);
  </script>
  <!-- Find the JS file in the dist/assets directory -->
  ${(() => {
    try {
      const jsFiles = fs.readdirSync(path.join(distDir, 'assets'))
        .filter(file => file.endsWith('.js'));
      return jsFiles.length > 0 
        ? `<script type="module" src="./assets/${jsFiles[0]}"></script>`
        : '<!-- No JS file found -->';
    } catch (e) {
      return '<!-- Error finding JS file -->';
    }
  })()}
</body>
</html>`;

// Write the custom index.html
fs.writeFileSync(indexHtmlPath, customIndexHtml);
console.log('✅ Custom index.html created');

// Create 404.html file
fs.writeFileSync(notFoundHtmlPath, notFoundHtml);
console.log('✅ 404.html created');

// Copy logo file to dist directory
try {
  fs.copyFileSync(logoPath, path.join(distDir, 'trip-logo-image.png'));
  console.log('✅ Logo file copied successfully');
} catch (error) {
  console.error('❌ Error copying logo file:', error.message);
  // Try to find the logo in other locations
  const possibleLogoPaths = [
    path.join(__dirname, 'public', 'trip-logo-image.png'),
    path.join(__dirname, 'src', 'assets', 'trip-logo-image.png')
  ];
  
  for (const logoPath of possibleLogoPaths) {
    try {
      if (fs.existsSync(logoPath)) {
        fs.copyFileSync(logoPath, path.join(distDir, 'trip-logo-image.png'));
        console.log(`✅ Logo file found at ${logoPath} and copied successfully`);
        break;
      }
    } catch (err) {
      console.error(`❌ Error checking alternative logo path ${logoPath}:`, err.message);
    }
  }
}

console.log('✅ Post-build modifications completed successfully!'); 
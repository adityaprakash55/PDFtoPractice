const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

const tagsToInject = `
    <!-- Safari & Apple Specific Meta -->
    <link rel="apple-touch-icon" href="/logo.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="theme-color" content="#0a192f">

    <!-- Universal Social/Search Cards (Brave, Twitter, etc.) -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<%= title %>">
    <meta name="twitter:description" content="<%= description %>">
    <meta name="twitter:image" content="https://pdftopractice.in/logo.png">
    <meta property="og:image" content="https://pdftopractice.in/logo.png">
`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(viewsDir, file), 'utf8');
    
    // Only inject if not already present
    if (!content.includes('apple-touch-icon')) {
        content = content.replace('</head>', `${tagsToInject}\n</head>`);
        fs.writeFileSync(path.join(viewsDir, file), content);
        console.log(`Updated ${file}`);
    }
});

// Also create a robots.txt and sitemap.xml in public/ to help Brave Search and others
const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://pdftopractice.in/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, 'public', 'robots.txt'), robotsTxt);

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://pdftopractice.in/</loc>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
   </url>
   <url>
      <loc>https://pdftopractice.in/donate</loc>
      <changefreq>monthly</changefreq>
      <priority>0.5</priority>
   </url>
   <url>
      <loc>https://pdftopractice.in/privacy</loc>
      <changefreq>yearly</changefreq>
      <priority>0.3</priority>
   </url>
   <url>
      <loc>https://pdftopractice.in/terms</loc>
      <changefreq>yearly</changefreq>
      <priority>0.3</priority>
   </url>
</urlset>`;
fs.writeFileSync(path.join(__dirname, 'public', 'sitemap.xml'), sitemapXml);

console.log('Created robots.txt and sitemap.xml in public folder.');

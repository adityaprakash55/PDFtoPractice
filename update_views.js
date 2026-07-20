const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = ['index.ejs', 'donate.ejs', 'privacy.ejs', 'terms.ejs'];

files.forEach(file => {
    let content = fs.readFileSync(path.join(viewsDir, file), 'utf8');
    
    // Replace title
    content = content.replace(/<title>.*?<\/title>/, '<title><%= title %></title>');
    
    // Replace description meta
    content = content.replace(/<meta name="description" content=".*?">/, '<meta name="description" content="<%= description %>">');
    
    // Add canonical link
    if (!content.includes('<link rel="canonical"')) {
        content = content.replace('</title>', '</title>\n    <link rel="canonical" href="<%= canonical %>">');
    }
    
    // Replace Tailwind CDN with local CSS
    const tailwindCdnRegex = /<!-- Tailwind CSS -->[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/;
    content = content.replace(tailwindCdnRegex, '<!-- Local CSS -->\n    <link rel="stylesheet" href="/styles.css">');
    
    // Add defer to pdf.js and jszip
    content = content.replace(/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/pdf.js\/3.11.174\/pdf.min.js"><\/script>/, '<script defer src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>');
    content = content.replace(/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/jszip\/3.10.1\/jszip.min.js"><\/script>/, '<script defer src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>');
    content = content.replace(/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/FileSaver.js\/2.0.5\/FileSaver.min.js"><\/script>/, '<script defer src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>');

    // Preload logo
    if (!content.includes('<link rel="preload" href="logo.png"')) {
        content = content.replace('</head>', '    <link rel="preload" href="logo.png" as="image">\n</head>');
    }
    
    // Wrap main content in <main> if it isn't
    // Well, index.ejs already has <main>
    
    fs.writeFileSync(path.join(viewsDir, file), content);
});
console.log("Processed all views.");

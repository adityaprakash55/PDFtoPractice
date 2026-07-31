const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Force HTTPS and add security headers to prevent 'Not Secure' warnings
app.use((req, res, next) => {
    // Redirect HTTP to HTTPS in production (Vercel sets x-forwarded-proto)
    if (req.headers['x-forwarded-proto'] === 'http') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    
    // Crucial Security Headers
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'PDF to PRACTICE | CBT Mock Simulator',
        description: 'Transform your coaching modules, DPPs, and PYQ PDFs into interactive JEE/NEET mock tests instantly.',
        canonical: 'https://pdftopractice.in/'
    });
});

app.get('/donate', (req, res) => {
    res.render('donate', {
        title: 'Support PDF to PRACTICE',
        description: 'Support the free PDF to CBT tool. Donate to keep the servers running.',
        canonical: 'https://pdftopractice.in/donate'
    });
});

app.get('/privacy', (req, res) => {
    res.render('privacy', {
        title: 'Privacy Policy | PDF to PRACTICE',
        description: 'Privacy Policy for PDF to PRACTICE.',
        canonical: 'https://pdftopractice.in/privacy'
    });
});

app.get('/terms', (req, res) => {
    res.render('terms', {
        title: 'Terms of Service | PDF to PRACTICE',
        description: 'Terms of Service for PDF to PRACTICE.',
        canonical: 'https://pdftopractice.in/terms'
    });
});

// Redirects for legacy/incorrect paths
app.get(['/donate.html', '/Donate'], (req, res) => res.redirect(301, '/donate'));
app.get('/privacy.html', (req, res) => res.redirect(301, '/privacy'));
app.get('/terms.html', (req, res) => res.redirect(301, '/terms'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;

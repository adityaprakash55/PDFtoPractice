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
        title: 'PDF to CBT Test Generator & Free Mentorship | Online JEE & NEET Mock CBT Practice',
        description: 'Convert any question paper PDF, DPP, or coaching module into an interactive online NTA CBT mock test instantly. Best free tool for PDF to CBT, PDF to Practice, JEE Mock CBT, NEET Mock CBT, and DPP to Practice with percentile predictor and free mentorship.',
        canonical: 'https://pdftopractice.in/'
    });
});

app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.sendFile(path.join(__dirname, '../public/sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(path.join(__dirname, '../public/robots.txt'));
});

app.get('/ads.txt', (req, res) => {
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(path.join(__dirname, '../public/ads.txt'));
});


app.get('/donate', (req, res) => {
    res.render('donate', {
        title: 'Support PDF to PRACTICE | PDF to CBT Test Tool',
        description: 'Support the free PDF to CBT & PDF to Test generator. Donate to keep the servers running for JEE and NEET aspirants.',
        canonical: 'https://pdftopractice.in/donate'
    });
});

app.get('/privacy', (req, res) => {
    res.render('privacy', {
        title: 'Privacy Policy | PDF to PRACTICE (PDF to CBT)',
        description: 'Privacy Policy for PDF to PRACTICE. 100% client-side and secure PDF to CBT test processing.',
        canonical: 'https://pdftopractice.in/privacy'
    });
});

app.get('/terms', (req, res) => {
    res.render('terms', {
        title: 'Terms of Service | PDF to PRACTICE (PDF to Test)',
        description: 'Terms of Service for PDF to PRACTICE CBT test simulator.',
        canonical: 'https://pdftopractice.in/terms'
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us | PDF to PRACTICE',
        description: 'Get in touch with PDF to PRACTICE team. Join our official Telegram channel or email us for feedback on PDF to CBT and DPP to Mock test tools.',
        canonical: 'https://pdftopractice.in/contact'
    });
});

app.get(['/mathongo', '/mathongo.html'], (req, res) => {
    res.render('mathongo', {
        title: 'Mathongo Coupon Code 2027: ₹500 EXTRA OFF (Code: MG27P89)',
        description: 'Verified Mathongo Coupon Code: MG27P89. Get ₹500 EXTRA OFF on MathonGo Test Series for JEE Main 2027, JEE Advanced, Quizrr Pass & NEET. Claim your discount now!',
        canonical: 'https://pdftopractice.in/mathongo.html'
    });
});

// Mentorship route - Redirects to Telegram channel
app.get('/mentorship', (req, res) => res.redirect(301, 'https://t.me/+fmOGYoVG7kQyMGM1'));

// Redirects for legacy/incorrect paths
app.get(['/donate.html', '/Donate'], (req, res) => res.redirect(301, '/donate'));
app.get('/privacy.html', (req, res) => res.redirect(301, '/privacy'));
app.get('/terms.html', (req, res) => res.redirect(301, '/terms'));
app.get('/contact.html', (req, res) => res.redirect(301, '/contact'));
app.get(['/Ads.txt', '/ADS.TXT', '/ads.txt/'], (req, res) => res.redirect(301, '/ads.txt'));


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;

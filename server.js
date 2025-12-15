const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session for Admin Auth
app.use(session({
    secret: 'marco_secret_key_123',
    resave: false,
    saveUninitialized: true
}));

// Helper function to read data
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data:", err);
        return {};
    }
};

// Helper function to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
};

// --- ROUTES ---

// 1. Home Page (Public)
app.get('/', (req, res) => {
    const data = readData();
    res.render('index', { data });
});

// 2. Admin Login Page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// 3. Admin Login Logic (Simple Hardcoded Auth)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // CREDENTIALS: admin / admin123
    if (username === 'admin' && password === 'admin123') {
        req.session.isAuthenticated = true;
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Credenciales incorrectas' });
    }
});

// 4. Admin Dashboard (Protected)
app.get('/admin', (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    const data = readData();
    res.render('admin', { data });
});

// 5. Save Changes from Admin
app.post('/admin/save', (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.status(403).send('Unauthorized');
    }

    try {
        const newData = readData();

        // 1. Update Hero
        newData.hero.title = req.body.hero_title || newData.hero.title;
        newData.hero.subtitle = req.body.hero_subtitle || newData.hero.subtitle;

        // 2. Update About
        newData.about.title = req.body.about_title || newData.about.title;
        newData.about.subtitle = req.body.about_subtitle || newData.about.subtitle;
        newData.about.text = req.body.about_text || newData.about.text;

        // 3. Update Contact
        if (!newData.contact) newData.contact = {};
        newData.contact.email = req.body.contact_email || newData.contact.email;
        newData.contact.phone = req.body.contact_phone || newData.contact.phone;
        newData.contact.location = req.body.contact_location || newData.contact.location;
        newData.contact.text = req.body.contact_text || newData.contact.text;

        // 4. Update JSON Lists (Helper function to safely parse)
        const safeJSONParse = (jsonString, fallback) => {
            try {
                return jsonString ? JSON.parse(jsonString) : fallback;
            } catch (e) {
                console.error("JSON Parse Error:", e);
                return fallback;
            }
        };

        newData.services = safeJSONParse(req.body.services_json, newData.services);
        newData.experience = safeJSONParse(req.body.experience_json, newData.experience);
        newData.skills = safeJSONParse(req.body.skills_json, newData.skills);
        newData.projects = safeJSONParse(req.body.projects_json, newData.projects);
        newData.social = safeJSONParse(req.body.social_json, newData.social);

        writeData(newData);
        res.redirect('/admin');
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).send("Error saving data");
    }
});

// 6. Assets Route
// Copy your assets folder to a 'public' folder or stick to root. 
// For now, let's serve root assets.
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Start Server
app.listen(PORT, () => {
    console.log(`CMS running at http://localhost:${PORT}`);
});

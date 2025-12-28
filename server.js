/*
 * @author MDev - snake33madb
 * @copyright 2025 MDev
 * @license Todos los derechos reservados
 */

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const db = require('./src/database'); // Importar módulo de base de datos

const app = express();

// IMPORTANTE PARA CPANEL: Usar el puerto que asigne el entorno o 3000 por defecto
const PORT = process.env.PORT || 3000;

// Middleware y Configuración
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Registro de Solicitudes (Logging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Archivos Estáticos
app.use(express.static(path.join(__dirname, 'public')));
// Ruta de Assets (Compatibilidad)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Motor de Vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sesión para Autenticación de Administrador
app.use(session({
    secret: 'marco_secret_key_123', // En producción idealmente usar variable de entorno
    resave: false,
    saveUninitialized: true
}));

// --- RUTAS ---

// 1. Página de Inicio (Pública)
app.get('/', (req, res) => {
    const data = db.read();

    // Incrementar Contador de Visitas (Simple)
    if (!data.stats) {
        data.stats = { visits: 0, shares: 0 };
    }
    data.stats.visits = (data.stats.visits || 0) + 1;
    db.write(data); // Guardar el incremento

    res.render('index', { data });
});

// 1.1 Página de Blog Individual
app.get('/blog/:id', (req, res) => {
    const data = db.read();
    const postId = req.params.id;
    const post = data.blog ? data.blog.find(p => p.id === postId) : null;

    if (post) {
        res.render('post', { post, data }); // Pasamos 'data' también para el footer/header si es necesario
    } else {
        // Si no existe, redirigir al inicio sección blog
        res.redirect('/#blog');
    }
});

// 2. Página de Inicio de Sesión (Admin)
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// 3. Lógica de Inicio de Sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // CREDENCIALES: admin / admin123
    if (username === 'admin' && password === 'admin123') {
        req.session.isAuthenticated = true;
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Credenciales incorrectas' });
    }
});

// 4. Panel de Administración (Protegido)
app.get('/admin', (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    const data = db.read();
    res.render('admin', { data });
});

// 5. Guardar Cambios desde Admin
app.post('/admin/save', (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.status(403).send('No autorizado');
    }

    try {
        const newData = db.read();

        // 1. Actualizar Hero (Cabecera)
        newData.hero.title = req.body.hero_title || newData.hero.title;
        newData.hero.subtitle = req.body.hero_subtitle || newData.hero.subtitle;

        // 2. Actualizar Sobre Mí (About)
        newData.about.title = req.body.about_title || newData.about.title;
        newData.about.subtitle = req.body.about_subtitle || newData.about.subtitle;
        newData.about.text = req.body.about_text || newData.about.text;

        // 3. Actualizar Contacto
        if (!newData.contact) newData.contact = {};
        newData.contact.email = req.body.contact_email || newData.contact.email;
        newData.contact.phone = req.body.contact_phone || newData.contact.phone;
        newData.contact.location = req.body.contact_location || newData.contact.location;
        newData.contact.text = req.body.contact_text || newData.contact.text;

        // 4. Actualizar Listas JSON usando el helper
        newData.services = db.safeJSONParse(req.body.services_json, newData.services);
        newData.experience = db.safeJSONParse(req.body.experience_json, newData.experience);
        newData.skills = db.safeJSONParse(req.body.skills_json, newData.skills);
        newData.projects = db.safeJSONParse(req.body.projects_json, newData.projects);
        newData.blog = db.safeJSONParse(req.body.blog_json, newData.blog);
        newData.social = db.safeJSONParse(req.body.social_json, newData.social);

        db.write(newData);
        res.redirect('/admin');
    } catch (err) {
        console.error("Error al guardar:", err);
        res.status(500).send("Error guardando datos");
    }
});

// Endpoint para rastrear "Shares" (Compartidos)
app.post('/api/track-share', (req, res) => {
    try {
        const data = db.read();
        if (!data.stats) {
            data.stats = { visits: 0, shares: 0 };
        }
        data.stats.shares = (data.stats.shares || 0) + 1;
        db.write(data);
        res.json({ success: true, shares: data.stats.shares });
    } catch (err) {
        console.error("Error tracking share:", err);
        res.status(500).json({ success: false });
    }
});

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`CMS ejecutándose en http://localhost:${PORT}`);
});

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { statements_raw } from '../../bot/src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.DASHBOARD_PORT || 3001;

// Passport Setup
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    const targetGuildId = process.env.GUILD_ID;
    if (targetGuildId) {
        const guild = profile.guilds.find(g => g.id === targetGuildId);
        // Check for ADMINISTRATOR (0x8) or MANAGE_GUILD (0x20) permissions
        profile.isAdmin = guild ? ((guild.permissions & 0x8) === 0x8 || (guild.permissions & 0x20) === 0x20) : false;
    } else {
        profile.isAdmin = true; // If no guild configured, permit access (for testing/simplicity)
    }
    process.nextTick(() => done(null, profile));
}));

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// Auth Routes
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => res.redirect('/'));

app.get('/api/user', (req, res) => {
    res.json(req.user || null);
});

app.get('/api/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

// Bot API Routes
app.get('/api/offenses', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send('Unauthorized');
    if (!req.user.isAdmin) return res.status(403).send('Forbidden: Admins only');

    try {
        const rows = statements_raw?.getAllOffenses?.all() || [];
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/offenses/reset/:userId', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send('Unauthorized');
    if (!req.user.isAdmin) return res.status(403).send('Forbidden: Admins only');

    try {
        db.resetUserOffenses(req.params.userId);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/offenses/reset-all', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send('Unauthorized');
    if (!req.user.isAdmin) return res.status(403).send('Forbidden: Admins only');

    try {
        db.resetAllOffenses();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Serve Frontend and Assets
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/assets', express.static(path.join(__dirname, '../../../assets')));

export const startDashboard = () => {
    return app.listen(PORT, () => {
        console.log(`Dashboard backend running on port ${PORT}`);
    });
};

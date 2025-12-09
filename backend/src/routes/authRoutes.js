const { Router } = require('express');
const passport = require('passport');
const { signUserToken } = require('../auth/googleStrategy');

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed', session: false }),
  (req, res) => {
    const token = signUserToken(req.user);
    const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5000';
    return res.redirect(`${origin}/auth/success?token=${token}`);
  }
);

router.get('/failure', (_req, res) => res.status(401).json({ error: 'Auth failed' }));

module.exports = router;
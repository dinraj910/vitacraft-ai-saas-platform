const express = require('express');
const router  = express.Router();

const authRoutes = require('./routes/auth.routes');
router.use('/auth', authRoutes);

// Phase 2 — uncomment when ready:
// const aiRoutes    = require('./routes/ai.routes');
// const userRoutes  = require('./routes/user.routes');
// const filesRoutes = require('./routes/files.routes');
// router.use('/ai',    aiRoutes);
// router.use('/users', userRoutes);
// router.use('/files', filesRoutes);

// Phase 3 — uncomment when ready:
// const billingRoutes = require('./routes/billing.routes');
// const adminRoutes   = require('./routes/admin.routes');
// router.use('/billing', billingRoutes);
// router.use('/admin',   adminRoutes);

module.exports = router;
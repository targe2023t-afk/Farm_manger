const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farm_manager')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── Schemas
const UserSchema = new mongoose.Schema({
  username:    { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  name:        String,
  phone:       String,
  farmName:    String,
  role:        { type: String, default: 'manager' },
  status:      { type: String, default: 'active' },
  permissions: Object,
  createdBy:   Number,
}, { timestamps: true });

const FarmDataSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expenses:  { type: Array, default: [] },
  revenues:  { type: Array, default: [] },
  inventory: { type: Array, default: [] },
  workers:   { type: Array, default: [] },
  usageLog:  { type: Array, default: [] },
  auditLog:  { type: Array, default: [] },
}, { timestamps: true });

const User     = mongoose.model('User',     UserSchema);
const FarmData = mongoose.model('FarmData', FarmDataSchema);

// ── Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'farm_secret_2024');
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ── Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, phone, farmName } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Username exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ username, password: hashed, name, phone, farmName });
    const token  = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'farm_secret_2024', { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name, username, role: user.role, farmName } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, status: 'active' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'farm_secret_2024', { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, username, role: user.role, farmName: user.farmName, permissions: user.permissions } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Sync (save all farm data)
app.post('/api/sync', auth, async (req, res) => {
  try {
    const { expenses, revenues, inventory, workers, usageLog, auditLog } = req.body;
    await FarmData.findOneAndUpdate(
      { userId: req.userId },
      { expenses, revenues, inventory, workers, usageLog: usageLog||[], auditLog: auditLog||[] },
      { upsert: true, new: true }
    );
    res.json({ success: true, synced: new Date() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Load data
app.get('/api/data', auth, async (req, res) => {
  try {
    const data = await FarmData.findOne({ userId: req.userId });
    res.json(data || { expenses:[], revenues:[], inventory:[], workers:[], usageLog:[], auditLog:[] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get users (admin)
app.get('/api/users', auth, async (req, res) => {
  try {
    const users = await User.find({ createdBy: req.userId }, '-password');
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create user (admin)
app.post('/api/users', auth, async (req, res) => {
  try {
    const { username, password, name, phone, role, permissions } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ username, password: hashed, name, phone, role, permissions, createdBy: req.userId });
    res.json({ id: user._id, name, username, role, permissions });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update user permissions
app.put('/api/users/:id/permissions', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { permissions: req.body.permissions });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

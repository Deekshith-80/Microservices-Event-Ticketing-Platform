const Audience = require('../models/Audience');
const Organizer = require('../models/Organizer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Added dependency link

const issueTokenAndCookie = (res, user) => {
  const token = jwt.sign(
    { id: user._id, tenantId: user.tenantId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, requestedRole } = req.body;
    const { tenantId } = req;
    if (!name || !email || !password) return res.status(400).json({ success: false, error: 'All fields required.' });

    const isOrganizer = requestedRole === 'TenantAdmin';
    const TargetModel = isOrganizer ? Organizer : Audience;

    const existingUser = await TargetModel.findOne({ tenantId, email });
    if (existingUser) return res.status(400).json({ success: false, error: 'User already registered.' });

    const user = await TargetModel.create({
      tenantId, name, email, password, role: isOrganizer ? 'TenantAdmin' : 'Customer'
    });

    issueTokenAndCookie(res, user);
    return res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { tenantId } = req;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Missing entries.' });

    let user = await Audience.findOne({ tenantId, email }) || await Organizer.findOne({ tenantId, email });
    
    // Fixed: Password verification utilizing bcrypt comparison matching
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    issueTokenAndCookie(res, user);
    return res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};

exports.googleLogin = async (req, res) => {
  try {
    const { accessToken, requestedRole } = req.body;
    const { tenantId } = req;
    if (!accessToken) return res.status(400).json({ success: false, error: 'Missing token.' });

    const googleProfileResponse = await require('axios').get(`https://www.googleapis.com/oauth2/0.3/userinfo?access_token=${accessToken}`);
    const { email, name, sub: googleId, picture: avatar } = googleProfileResponse.data;

    const isOrganizer = requestedRole === 'TenantAdmin';
    const TargetModel = isOrganizer ? Organizer : Audience;

    let user = await TargetModel.findOne({ tenantId, email });
    if (!user) {
      user = await TargetModel.create({ tenantId, googleId, email, name, avatar, role: isOrganizer ? 'TenantAdmin' : 'Customer' });
    }

    issueTokenAndCookie(res, user);
    return res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { return res.status(400).json({ success: false, error: 'Google OAuth token resolution failure.' }); }
};

// Essential verification checkpoint route: Validates persistent browser cookies on page refresh actions
exports.getMe = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ success: false, error: 'Session non-existent.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;
    if (!userId) return res.status(401).json({ success: false, error: 'Session payload missing identity.' });

    const user = await Audience.findById(userId) || await Organizer.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'Profile data missing.' });

    return res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { return res.status(401).json({ success: false, error: 'Token expired.' }); }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ success: true, message: 'Session closed cleanly.' });
};

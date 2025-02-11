const isAuthorized = (req, res, next) => {
  // Get auth header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    // For development, accept any token
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    // In production, verify JWT token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // TODO: Add proper JWT verification for production
    // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    //   if (err) {
    //     return res.status(401).json({ error: 'Invalid token' });
    //   }
    //   req.user = decoded;
    //   next();
    // });

    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  isAuthorized
}; 
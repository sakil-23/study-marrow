const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  // 1. Check if they brought a badge (token) in the header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied: No Security Key Provided!' });
  }

  // 2. Extract the token from the header
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify if the token is real and hasn't been faked by a hacker
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; 
    next(); // Pass the check! Let them modify the database.
  } catch (err) {
    res.status(401).json({ message: 'Access Denied: Invalid or Expired Key!' });
  }
};

module.exports = verifyAdmin;
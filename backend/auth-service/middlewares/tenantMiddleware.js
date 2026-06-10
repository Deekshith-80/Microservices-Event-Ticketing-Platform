const tenantContextFilter = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  
  if (!tenantId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Access Denied: Missing x-tenant-id context header.' 
    });
  }
  
  req.tenantId = tenantId;
  next();
};

module.exports = tenantContextFilter;
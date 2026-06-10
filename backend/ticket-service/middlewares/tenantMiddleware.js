const requireTenantContext = (req, res, next) => {
  const tenantId = typeof req.headers['x-tenant-id'] === 'string' ? req.headers['x-tenant-id'].trim() : '';

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      error: 'Access denied: missing x-tenant-id context header.'
    });
  }

  req.tenantId = tenantId;
  next();
};

module.exports = requireTenantContext;

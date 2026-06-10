const normalizeTenantId = (value) => (typeof value === 'string' ? value.trim() : '');

const requireTenantContext = (req, res, next) => {
  const tenantId = normalizeTenantId(req.headers['x-tenant-id']);

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

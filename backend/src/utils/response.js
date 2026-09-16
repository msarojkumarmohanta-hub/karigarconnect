function success(res, data, message = 'Success', pagination) {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(200).json(body);
}

function created(res, data, message = 'Created successfully') {
  return res.status(201).json({ success: true, message, data });
}

module.exports = { success, created };

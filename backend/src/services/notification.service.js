const Notification = require('../models/Notification');
async function notify(userId, title, message, type = 'system', data = {}) {
  const notification = await Notification.create({ userId, title, message, type, data });
  const io = global.karigarConnectIo;
  if (io) io.to(`user:${userId}`).emit('notification', notification.toObject());
  return notification;
}
module.exports = { notify };

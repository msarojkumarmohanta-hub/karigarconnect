const Notification = require('../models/Notification');
const { success } = require('../utils/response');
async function list(req, res, next) { try { return success(res, await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100).lean(), 'Notifications fetched successfully'); } catch (error) { next(error); } }
async function read(req, res, next) { try { return success(res, await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true }, { new: true }), 'Notification marked as read'); } catch (error) { next(error); } }
async function readAll(req, res, next) { try { await Notification.updateMany({ userId: req.user._id, read: false }, { read: true }); return success(res, null, 'Notifications marked as read'); } catch (error) { next(error); } }
module.exports = { list, read, readAll };

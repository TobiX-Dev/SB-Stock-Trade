const Order = require('../models/orderSchema');

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const total   = await Order.countDocuments();
    const buys    = await Order.countDocuments({ orderType: 'buy' });
    const sells   = await Order.countDocuments({ orderType: 'sell' });
    const volume  = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    res.json({ total, buys, sells, totalVolume: volume[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserOrders, getAllOrders, getOrderStats };

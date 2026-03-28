const Feedback = require('../models/feedbackModel');

const submitFeedback = async (req, res) => {
  try {
    const { phone, issue } = req.body;
    if (!phone || !issue) return res.status(400).json({ message: 'Phone and issue required' });
    
    const user = req.user;
    const feedback = await Feedback.create({
      userId: user._id,
      userName: user.username,
      phone,
      issue
    });
    
    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    
    if (search) {
      query = { $or: [
        { userName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { issue: { $regex: search, $options: 'i' } }
      ]};
    }
    
    if (status) {
      query.status = status;
    }
    
    const feedback = await Feedback.find(query).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(id, { status, response, updatedAt: Date.now() }, { new: true });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitFeedback, getAllFeedback, updateFeedbackStatus, deleteFeedback };

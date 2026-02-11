import ContactMessage from './contactModel.js';
import { sendContactNotification } from '../../utils/sendEmail.js';

export const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Save message in DB
    const savedMessage = await ContactMessage.create({ name, email, subject, message });

    // Send email notification to your SMTP inbox
    await sendContactNotification({ name, email, subject, message });

    res.status(201).json({ success: true, message: 'Message sent successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

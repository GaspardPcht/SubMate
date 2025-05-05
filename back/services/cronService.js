const cron = require('node-cron');
const { sendDailyReminders } = require('./reminderService');

const initCronJobs = () => {
  // Run every day at 8:00 AM (Paris time)
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily subscription reminders...');
    try {
      await sendDailyReminders();
      console.log('Daily reminders sent successfully');
    } catch (error) {
      console.error('Failed to send daily reminders:', error);
    }
  }, {
    scheduled: true,
    timezone: "Europe/Paris"
  });
};

module.exports = { initCronJobs };

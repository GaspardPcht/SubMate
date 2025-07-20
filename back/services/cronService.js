const cron = require('node-cron');
const { sendDailyReminders } = require('./reminderService');
const { checkAndSendDailyNotifications } = require('./notificationService');

const initCronJobs = () => {
  // Run every day at 9:00 AM (Paris time) for push notifications
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily push notification check at 9:00 AM...');
    try {
      await checkAndSendDailyNotifications();
      console.log('Daily push notifications sent successfully');
    } catch (error) {
      console.error('Failed to send daily push notifications:', error);
    }
  }, {
    scheduled: true,
    timezone: "Europe/Paris"
  });

  // Keep the existing email reminder at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily email reminders at 8:00 AM...');
    try {
      await sendDailyReminders();
      console.log('Daily email reminders sent successfully');
    } catch (error) {
      console.error('Failed to send daily email reminders:', error);
    }
  }, {
    scheduled: true,
    timezone: "Europe/Paris"
  });
};

module.exports = { initCronJobs };

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if we're running in Expo Go (notifications not supported in SDK 53+)
export const isExpoGo = Constants.appOwnership === 'expo';

// Lazy-load expo-notifications only when NOT in Expo Go.
// Importing the module in Expo Go triggers ERROR/WARN logs from the SDK itself,
// so we avoid loading it entirely.
let Notifications = null;
if (!isExpoGo) {
  Notifications = require('expo-notifications');
}

// Request notification permissions
export async function requestNotificationPermissions() {
  if (isExpoGo || !Notifications) return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.log('[Notifications] Permission request not available:', error.message);
    return false;
  }
}

// Set up notification handler (call once at app startup)
export function setupNotificationHandler() {
  if (isExpoGo) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.log('[Notifications] Handler setup not available:', error.message);
  }
}

// Set up Android notification channel
export async function setupNotificationChannel() {
  if (isExpoGo) return;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pet-reminders', {
        name: '宠物提醒',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E8C547',
      });
    }
  } catch (error) {
    console.log('[Notifications] Channel setup not available:', error.message);
  }
}

// Get the reminder type label in Chinese
function getReminderTypeLabel(type) {
  const labels = {
    feeding: '喂食',
    play: '玩耍',
    medicine: '吃药',
    vet: '看医生',
    grooming: '梳毛',
    vaccination: '疫苗',
    litter: '铲屎',
    deworming: '驱虫',
    other: '其他',
  };
  return labels[type] || '提醒';
}

// Get the reminder type emoji
function getReminderTypeEmoji(type) {
  const emojis = {
    feeding: '🐟',
    play: '🧶',
    medicine: '💊',
    vet: '🏥',
    grooming: '🪮',
    vaccination: '💉',
    litter: '🚽',
    deworming: '🐛',
    other: '📝',
  };
  return emojis[type] || '🔔';
}

// Schedule a notification for a reminder
export async function scheduleReminderNotification(reminder, petName) {
  if (isExpoGo) return null;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return null;
  }

  // Cancel any existing notification for this reminder
  await cancelReminderNotification(reminder.id);

  const reminderDate = new Date(reminder.dateTime);
  const now = new Date();

  // Don't schedule if the date is in the past (for one-time reminders)
  if (reminder.frequency === 'once' && reminderDate <= now) {
    console.log('Reminder date is in the past, not scheduling');
    return null;
  }

  const emoji = getReminderTypeEmoji(reminder.type);
  const typeLabel = getReminderTypeLabel(reminder.type);

  const notificationContent = {
    title: `${emoji} ${reminder.title}`,
    body: `${petName || '猫咪'}的${typeLabel}时间到啦！${reminder.notes ? '\n' + reminder.notes : ''}`,
    data: { reminderId: reminder.id, petId: reminder.petId },
    sound: true,
  };

  const channelId = Platform.OS === 'android' ? 'pet-reminders' : undefined;

  try {
    let notificationId;

    if (reminder.frequency === 'once') {
      // One-time notification at a specific date
      const secondsUntilTrigger = Math.max(
        Math.floor((reminderDate.getTime() - now.getTime()) / 1000),
        1
      );

      notificationId = await Notifications.scheduleNotificationAsync({
        identifier: `reminder-${reminder.id}`,
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilTrigger,
          channelId,
        },
      });
    } else if (reminder.frequency === 'daily') {
      // Daily repeating notification
      const hour = reminderDate.getHours();
      const minute = reminderDate.getMinutes();

      notificationId = await Notifications.scheduleNotificationAsync({
        identifier: `reminder-${reminder.id}`,
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId,
        },
      });
    } else if (reminder.frequency === 'weekly') {
      // Weekly repeating notification
      const hour = reminderDate.getHours();
      const minute = reminderDate.getMinutes();
      const weekday = reminderDate.getDay() + 1; // JS: 0=Sun, Expo: 1=Sun

      notificationId = await Notifications.scheduleNotificationAsync({
        identifier: `reminder-${reminder.id}`,
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour,
          minute,
          channelId,
        },
      });
    } else if (reminder.frequency === 'monthly') {
      // Monthly - use the same day of month
      const day = reminderDate.getDate();
      const hour = reminderDate.getHours();
      const minute = reminderDate.getMinutes();

      notificationId = await Notifications.scheduleNotificationAsync({
        identifier: `reminder-${reminder.id}`,
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
          day,
          hour,
          minute,
          channelId,
        },
      });
    } else if (reminder.frequency === 'yearly') {
      // Yearly - use the same month and day
      const month = reminderDate.getMonth() + 1; // JS: 0-based, Expo: 1-based
      const day = reminderDate.getDate();
      const hour = reminderDate.getHours();
      const minute = reminderDate.getMinutes();

      notificationId = await Notifications.scheduleNotificationAsync({
        identifier: `reminder-${reminder.id}`,
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.YEARLY,
          month,
          day,
          hour,
          minute,
          channelId,
        },
      });
    }

    console.log('Notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

// Cancel a specific reminder's notification
export async function cancelReminderNotification(reminderId) {
  if (isExpoGo) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(
      `reminder-${reminderId}`
    );
  } catch (error) {
    // Notification might not exist, that's OK
    console.log('Could not cancel notification:', error);
  }
}

// Cancel all notifications
export async function cancelAllNotifications() {
  if (isExpoGo) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

// Reschedule all active reminders (useful after app restart)
export async function rescheduleAllReminders(reminders, pets) {
  if (isExpoGo) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // Cancel all existing notifications first
  await cancelAllNotifications();

  // Reschedule active reminders
  for (const reminder of reminders) {
    if (reminder.isActive !== false) {
      const pet = pets.find((p) => p.id === reminder.petId);
      await scheduleReminderNotification(reminder, pet?.name);
    }
  }
}

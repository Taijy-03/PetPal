import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useApp, useTheme } from '../context/AppContext';
import {
  FormInput,
  FormPicker,
  FormDateInput,
  FormButton,
  FormPetPicker,
} from '../components/FormElements';
import { generateId, REMINDER_FREQUENCIES } from '../utils/helpers';
import { requestNotificationPermissions } from '../utils/notifications';
import Constants from 'expo-constants';

const REMINDER_TYPES = [
  { label: '喂食', value: 'feeding', icon: '🐟' },
  { label: '玩耍', value: 'play', icon: '🧶' },
  { label: '吃药', value: 'medicine', icon: '💊' },
  { label: '看医生', value: 'vet', icon: '🏥' },
  { label: '梳毛', value: 'grooming', icon: '🪮' },
  { label: '疫苗', value: 'vaccination', icon: '💉' },
  { label: '铲屎', value: 'litter', icon: '🚽' },
  { label: '驱虫', value: 'deworming', icon: '🐛' },
  { label: '其他', value: 'other', icon: '📝' },
];

// Auto-format date input: adds dashes as user types (YYYY-MM-DD)
function formatDateInput(text) {
  // Strip non-digits
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

// Auto-format time input: adds colon as user types (HH:MM)
function formatTimeInput(text) {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

// Validate date string YYYY-MM-DD
function isValidDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// Validate time string HH:MM
function isValidTime(str) {
  if (!/^\d{2}:\d{2}$/.test(str)) return false;
  const [h, m] = str.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export default function AddReminderScreen({ navigation, route }) {
  const { petId: routePetId } = route.params || {};
  const { addReminderRecord, pets } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const [selectedPetId, setSelectedPetId] = useState(routePetId || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('feeding');
  const [dateTime, setDateTime] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  const validate = () => {
    const newErrors = {};

    if (!selectedPetId) {
      newErrors.pet = '请选择一只猫咪';
    }
    if (!title.trim()) {
      newErrors.title = '请输入提醒标题';
    }
    if (!dateTime) {
      newErrors.date = '请输入日期';
    } else if (!isValidDate(dateTime)) {
      newErrors.date = '日期格式不正确，请输入 YYYY-MM-DD';
    }
    if (!time) {
      newErrors.time = '请输入时间';
    } else if (!isValidTime(time)) {
      newErrors.time = '时间格式不正确，请输入 HH:MM（00:00-23:59）';
    }

    // Check if the date/time is in the past
    if (!newErrors.date && !newErrors.time) {
      const reminderDate = new Date(`${dateTime}T${time}:00`);
      if (reminderDate <= new Date()) {
        if (frequency === 'once') {
          newErrors.date = '提醒时间已过，请选择未来的日期和时间';
        } else {
          // For repeating reminders, warn but allow saving
          // The next occurrence will still fire at the correct time
          newErrors.date = '起始时间已过，首次提醒将在下一个周期触发';
          // Mark it as a warning, not a blocking error
          newErrors._dateIsWarning = true;
        }
      }
    }

    setErrors(newErrors);
    // _dateIsWarning means it's just a warning for repeating reminders, not a blocker
    const blockingErrors = Object.keys(newErrors).filter((k) => k !== '_dateIsWarning');
    return blockingErrors.length === 0 || (blockingErrors.length === 1 && blockingErrors[0] === 'date' && newErrors._dateIsWarning);
  };

  const handleSave = async () => {
    if (!validate()) return;

    // Request notification permissions first
    const isExpoGo = Constants.appOwnership === 'expo';
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission && !isExpoGo) {
      Alert.alert(
        '通知权限',
        '需要通知权限才能在指定时间提醒你。请在系统设置中开启通知权限。',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '仍然保存',
            onPress: () => saveReminder(),
          },
        ]
      );
      return;
    }

    await saveReminder();
  };

  const saveReminder = async () => {
    const reminder = {
      id: generateId(),
      petId: selectedPetId,
      title: title.trim(),
      type,
      dateTime: `${dateTime}T${time}:00`,
      frequency,
      notes: notes.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await addReminderRecord(reminder);
      Alert.alert('成功', '提醒已设置！', [
        { text: '好的', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('错误', '保存提醒失败。');
    }
  };

  const handleDateChange = (text) => {
    setDateTime(formatDateInput(text));
    if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
  };

  const handleTimeChange = (text) => {
    setTime(formatTimeInput(text));
    if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.petBanner}>
          {selectedPet?.photo ? (
            <Image source={{ uri: selectedPet.photo }} style={styles.petBannerPhoto} />
          ) : (
            <Text style={styles.petBannerEmoji}>🔔</Text>
          )}
          <View style={styles.petBannerTextContainer}>
            <Text style={styles.petBannerText}>
              {selectedPet?.name ? `${selectedPet.name} 的提醒` : '请选择一只猫咪'}
            </Text>
            {selectedPet?.birthDate && (
              <Text style={styles.petBannerSub}>为你的猫咪设置贴心提醒~</Text>
            )}
          </View>
        </View>

        <FormPetPicker
          label="猫咪"
          pets={pets}
          value={selectedPetId}
          onChange={(val) => {
            setSelectedPetId(val);
            if (errors.pet) setErrors((prev) => ({ ...prev, pet: undefined }));
          }}
          required
          error={errors.pet}
        />

        <FormInput
          label="标题"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          placeholder="如：早餐时间"
          icon="notifications-outline"
          required
          error={errors.title}
        />

        <FormPicker
          label="类型"
          options={REMINDER_TYPES}
          value={type}
          onChange={setType}
        />

        <View style={styles.row}>
          <View style={styles.flex}>
            <FormDateInput
              label="日期"
              value={dateTime}
              onChange={handleDateChange}
              placeholder="YYYY-MM-DD"
              required
              error={errors.date}
              isWarning={errors._dateIsWarning}
            />
          </View>
          <View style={styles.flex}>
            <FormInput
              label="时间"
              value={time}
              onChangeText={handleTimeChange}
              placeholder="HH:MM"
              icon="time-outline"
              keyboardType="number-pad"
              required
              error={errors.time}
            />
          </View>
        </View>

        <FormPicker
          label="频率"
          options={REMINDER_FREQUENCIES}
          value={frequency}
          onChange={setFrequency}
        />

        <FormInput
          label="备注"
          value={notes}
          onChangeText={setNotes}
          placeholder="其他备注信息..."
          multiline
        />

        <FormButton
          title="保存提醒"
          onPress={handleSave}
          icon="alarm"
        />
        <FormButton
          title="取消"
          onPress={() => navigation.goBack()}
          variant="outline"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  petBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8BC7A320',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: '#8BC7A3',
  },
  petBannerPhoto: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginRight: theme.spacing.md,
  },
  petBannerEmoji: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  petBannerTextContainer: {
    flex: 1,
  },
  petBannerText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  petBannerSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flex: {
    flex: 1,
  },
});

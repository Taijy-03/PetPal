import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../context/AppContext';
import {
  formatDate,
  formatTime,
  getFrequencyLabel,
  calculateAge,
  getPetTypeIcon,
} from '../utils/helpers';

const REMINDER_TYPE_MAP = {
  feeding: { label: '喂食', icon: '🐟', color: '#E8C547' },
  play: { label: '玩耍', icon: '🧶', color: '#9DC4E0' },
  medicine: { label: '吃药', icon: '💊', color: '#F0C27A' },
  vet: { label: '看医生', icon: '🏥', color: '#E8907A' },
  grooming: { label: '梳毛', icon: '🪮', color: '#A8D5A2' },
  vaccination: { label: '疫苗', icon: '💉', color: '#9DC4E0' },
  litter: { label: '铲屎', icon: '🚽', color: '#C0BCA0' },
  deworming: { label: '驱虫', icon: '🐛', color: '#A8D5A2' },
  other: { label: '其他', icon: '📝', color: '#B8B4A0' },
};

function getTypeInfo(type) {
  return REMINDER_TYPE_MAP[type] || REMINDER_TYPE_MAP.other;
}

function getCountdown(dateTimeStr) {
  const target = new Date(dateTimeStr);
  const now = new Date();
  const diffMs = target - now;

  if (diffMs < 0) {
    const pastMs = Math.abs(diffMs);
    const pastDays = Math.floor(pastMs / 86400000);
    if (pastDays === 0) return { text: '今天已到期', urgent: true, past: true };
    if (pastDays === 1) return { text: '昨天已到期', urgent: true, past: true };
    return { text: `${pastDays}天前已到期`, urgent: true, past: true };
  }

  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return { text: '即将到来', urgent: true, past: false };
  if (diffHours < 24) return { text: `${diffHours}小时后`, urgent: true, past: false };
  if (diffDays === 1) return { text: '明天', urgent: false, past: false };
  if (diffDays < 7) return { text: `${diffDays}天后`, urgent: false, past: false };
  if (diffDays < 30) return { text: `${Math.floor(diffDays / 7)}周后`, urgent: false, past: false };
  return { text: `${Math.floor(diffDays / 30)}个月后`, urgent: false, past: false };
}

export default function ReminderDetailScreen({ navigation, route }) {
  const { reminderId } = route.params;
  const { reminders, pets, updateReminder, removeReminder } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const reminder = reminders.find((r) => r.id === reminderId);
  const pet = reminder ? pets.find((p) => p.id === reminder.petId) : null;

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(reminder?.notes || '');

  if (!reminder) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textLight} />
        <Text style={styles.errorText}>找不到该提醒</Text>
      </View>
    );
  }

  const typeInfo = getTypeInfo(reminder.type);
  const countdown = getCountdown(reminder.dateTime);
  const isActive = reminder.isActive !== false;
  const reminderDate = new Date(reminder.dateTime);

  const handleToggle = async () => {
    await updateReminder({
      ...reminder,
      isActive: !isActive,
    });
  };

  const handleSaveNotes = async () => {
    await updateReminder({ ...reminder, notes: notesValue.trim() });
    setEditingNotes(false);
  };

  const handleDelete = () => {
    Alert.alert('删除提醒', `确定要删除"${reminder.title}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await removeReminder(reminder.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleGoToPet = () => {
    if (pet) {
      navigation.navigate('PetDetail', { petId: pet.id });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <View style={[styles.heroHeader, { backgroundColor: typeInfo.color + '20' }]}>
        <View style={[styles.heroIconCircle, { backgroundColor: typeInfo.color + '30' }]}>
          <Text style={styles.heroIcon}>{typeInfo.icon}</Text>
        </View>
        <Text style={styles.heroTitle}>{reminder.title}</Text>
        <View style={styles.heroBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '25' }]}>
            <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
              {typeInfo.label}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isActive ? theme.colors.success + '20' : theme.colors.textLight + '20' },
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isActive ? theme.colors.success : theme.colors.textLight },
            ]} />
            <Text style={[
              styles.statusBadgeText,
              { color: isActive ? theme.colors.success : theme.colors.textLight },
            ]}>
              {isActive ? '已启用' : '已关闭'}
            </Text>
          </View>
        </View>

        {/* Countdown */}
        <View style={[
          styles.countdownBanner,
          countdown.urgent && !countdown.past && styles.countdownUrgent,
          countdown.past && styles.countdownPast,
        ]}>
          <Ionicons
            name={countdown.past ? 'time-outline' : countdown.urgent ? 'alarm' : 'alarm-outline'}
            size={18}
            color={countdown.past ? theme.colors.error : countdown.urgent ? theme.colors.warning : theme.colors.primary}
          />
          <Text style={[
            styles.countdownText,
            countdown.past && { color: theme.colors.error },
            countdown.urgent && !countdown.past && { color: theme.colors.warning },
          ]}>
            {countdown.text}
          </Text>
        </View>
      </View>

      {/* Pet Card */}
      {pet && (
        <TouchableOpacity style={styles.petCard} onPress={handleGoToPet} activeOpacity={0.7}>
          <View style={styles.petCardLeft}>
            {pet.photo ? (
              <Image source={{ uri: pet.photo }} style={styles.petAvatar} />
            ) : (
              <View style={styles.petAvatarPlaceholder}>
                <Text style={styles.petAvatarEmoji}>{getPetTypeIcon(pet.type)}</Text>
              </View>
            )}
            <View style={styles.petInfo}>
              <View style={styles.petNameRow}>
                <Text style={styles.petName}>{pet.name}</Text>
                {pet.gender && (
                  <Text style={[
                    styles.petGender,
                    { color: pet.gender === 'male' ? '#3B82F6' : '#EC4899' },
                  ]}>
                    {pet.gender === 'male' ? '♂' : '♀'}
                  </Text>
                )}
              </View>
              {pet.birthDate && (
                <Text style={styles.petAge}>{calculateAge(pet.birthDate)}</Text>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} />
        </TouchableOpacity>
      )}

      {/* Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>提醒详情</Text>
        <DetailRow
          icon="calendar-outline"
          label="日期"
          value={formatDate(reminder.dateTime)}
          theme={theme}
        />
        <DetailRow
          icon="time-outline"
          label="时间"
          value={formatTime(reminder.dateTime)}
          theme={theme}
        />
        <DetailRow
          icon="repeat-outline"
          label="频率"
          value={getFrequencyLabel(reminder.frequency)}
          theme={theme}
        />
        <DetailRow
          icon="pricetag-outline"
          label="类型"
          value={typeInfo.label}
          iconEmoji={typeInfo.icon}
          theme={theme}
        />
      </View>

      {/* Active Toggle Card */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIconBox, { backgroundColor: theme.colors.primary + '15' }]}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.toggleLabel}>提醒通知</Text>
              <Text style={styles.toggleSub}>
                {isActive ? '将在指定时间发送通知' : '通知已暂停'}
              </Text>
            </View>
          </View>
          <Switch
            value={isActive}
            onValueChange={handleToggle}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary + '50',
            }}
            thumbColor={isActive ? theme.colors.primary : theme.colors.textLight}
          />
        </View>
      </View>

      {/* Notes */}
      <View style={styles.card}>
        <View style={styles.notesTitleRow}>
          <Text style={styles.cardSectionTitle}>备注</Text>
          {!editingNotes ? (
            <TouchableOpacity onPress={() => { setNotesValue(reminder.notes || ''); setEditingNotes(true); }}>
              <Ionicons name="pencil-outline" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.notesActions}>
              <TouchableOpacity onPress={() => setEditingNotes(false)} style={styles.notesCancelBtn}>
                <Text style={styles.notesCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveNotes} style={styles.notesSaveBtn}>
                <Text style={styles.notesSaveText}>保存</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {editingNotes ? (
          <TextInput
            style={styles.notesInput}
            value={notesValue}
            onChangeText={setNotesValue}
            placeholder="添加备注..."
            placeholderTextColor={theme.colors.textLight}
            multiline
            autoFocus
          />
        ) : (
          <Text style={reminder.notes ? styles.notesText : styles.notesPlaceholder}>
            {reminder.notes || '暂无备注，点击 ✏️ 添加'}
          </Text>
        )}
      </View>

      {/* Frequency Info */}
      {reminder.frequency !== 'once' && (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={theme.colors.info} />
          <Text style={styles.infoText}>
            此提醒设置为{getFrequencyLabel(reminder.frequency)}重复。
            {reminder.frequency === 'daily' && '每天都会在设定的时间提醒你。'}
            {reminder.frequency === 'weekly' && `每周${['日', '一', '二', '三', '四', '五', '六'][reminderDate.getDay()]}都会提醒你。`}
            {reminder.frequency === 'monthly' && `每月${reminderDate.getDate()}号都会提醒你。`}
            {reminder.frequency === 'yearly' && `每年${reminderDate.getMonth() + 1}月${reminderDate.getDate()}日都会提醒你。`}
          </Text>
        </View>
      )}

      {/* Created At */}
      {reminder.createdAt && (
        <Text style={styles.createdAt}>
          创建于 {formatDate(reminder.createdAt)}
        </Text>
      )}

      {/* Delete */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        <Text style={styles.deleteBtnText}>删除此提醒</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function DetailRow({ icon, label, value, iconEmoji, theme }) {
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <View style={styles.detailRight}>
        {iconEmoji && <Text style={styles.detailEmoji}>{iconEmoji}</Text>}
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    errorText: {
      fontSize: theme.fontSize.lg,
      color: theme.colors.textSecondary,
    },

    // Hero
    heroHeader: {
      alignItems: 'center',
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
    },
    heroIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    heroIcon: {
      fontSize: 40,
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    heroBadgeRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    typeBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 5,
      borderRadius: theme.borderRadius.round,
    },
    typeBadgeText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.bold,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 5,
      borderRadius: theme.borderRadius.round,
      gap: 5,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    statusBadgeText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
    },
    countdownBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.primary + '12',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    countdownUrgent: {
      backgroundColor: theme.colors.warning + '15',
    },
    countdownPast: {
      backgroundColor: theme.colors.error + '12',
    },
    countdownText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.primary,
    },

    // Pet Card
    petCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    petCardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    petAvatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      marginRight: theme.spacing.md,
    },
    petAvatarPlaceholder: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: theme.colors.primaryLight + '40',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    petAvatarEmoji: {
      fontSize: 26,
    },
    petInfo: {
      flex: 1,
    },
    petNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    petName: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    petGender: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
    },
    petAge: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },

    // Card
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    cardSectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm + 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    detailLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    detailRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    detailLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    detailEmoji: {
      fontSize: 16,
    },
    detailValue: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },

    // Toggle
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      flex: 1,
    },
    toggleIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleLabel: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },
    toggleSub: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },

    // Notes
    notesText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    notesPlaceholder: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textLight,
      fontStyle: 'italic',
    },
    notesTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    notesActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    notesCancelBtn: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    notesCancelText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    notesSaveBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.round,
    },
    notesSaveText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.bold,
      color: '#FFF',
    },
    notesInput: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.primary + '50',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      minHeight: 80,
      textAlignVertical: 'top',
      lineHeight: 22,
    },

    // Info card
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.info + '10',
      borderRadius: theme.borderRadius.md,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
    },
    infoText: {
      flex: 1,
      fontSize: theme.fontSize.sm,
      color: theme.colors.info,
      lineHeight: 20,
    },

    // Footer
    createdAt: {
      textAlign: 'center',
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      marginTop: theme.spacing.lg,
    },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.error + '40',
    },
    deleteBtnText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.error,
    },
  });

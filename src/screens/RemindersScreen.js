import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import { formatDate, formatTime, getFrequencyLabel, getPetTypeIcon, calculateAge } from '../utils/helpers';
import { isExpoGo } from '../utils/notifications';

const REMINDER_TYPE_ICONS = {
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

const REMINDER_TYPE_COLORS = {
  feeding: '#E8C547',
  play: '#9DC4E0',
  medicine: '#F0C27A',
  vet: '#E8907A',
  grooming: '#A8D5A2',
  vaccination: '#9DC4E0',
  litter: '#C0BCA0',
  deworming: '#A8D5A2',
  other: '#B8B4A0',
};

const FILTER_TABS = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'past', label: '已过期' },
  { key: 'inactive', label: '已关闭' },
];

export default function RemindersScreen({ navigation }) {
  const { reminders, pets, updateReminder, removeReminder } = useApp();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeFilter, setActiveFilter] = useState('all');

  const now = new Date();

  const filteredReminders = useMemo(() => {
    const sorted = [...reminders].sort(
      (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
    );
    switch (activeFilter) {
      case 'active':
        return sorted.filter((r) => r.isActive !== false && new Date(r.dateTime) >= now);
      case 'past':
        return sorted.filter((r) => r.isActive !== false && new Date(r.dateTime) < now);
      case 'inactive':
        return sorted.filter((r) => r.isActive === false);
      default:
        return sorted;
    }
  }, [reminders, activeFilter]);

  // Stats
  const stats = useMemo(() => {
    const active = reminders.filter((r) => r.isActive !== false && new Date(r.dateTime) >= now).length;
    const past = reminders.filter((r) => r.isActive !== false && new Date(r.dateTime) < now).length;
    const inactive = reminders.filter((r) => r.isActive === false).length;
    return { total: reminders.length, active, past, inactive };
  }, [reminders]);

  const toggleReminder = async (reminder) => {
    await updateReminder({
      ...reminder,
      isActive: !reminder.isActive,
    });
  };

  const handleDelete = (reminder) => {
    Alert.alert('删除提醒', `确定要删除"${reminder.title}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => removeReminder(reminder.id),
      },
    ]);
  };

  const handleReminderPress = (reminder) => {
    navigation.navigate('ReminderDetail', { reminderId: reminder.id });
  };

  const getCountdownLabel = (dateTimeStr, isActive) => {
    if (!isActive) return null;
    const target = new Date(dateTimeStr);
    const diffMs = target - now;
    if (diffMs < 0) {
      const pastDays = Math.floor(Math.abs(diffMs) / 86400000);
      if (pastDays === 0) return { text: '今天', urgent: true };
      return { text: `已过${pastDays}天`, urgent: true };
    }
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return { text: `${diffHours}小时后`, urgent: true };
    if (diffDays === 1) return { text: '明天', urgent: false };
    if (diffDays < 7) return { text: `${diffDays}天后`, urgent: false };
    return { text: `${diffDays}天后`, urgent: false };
  };

  if (reminders.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="alarm-outline"
          title="暂无提醒"
          message="设置喂食、玩耍、看医生等提醒，让你不会错过任何重要的猫咪护理任务~"
          actionLabel={pets.length > 0 ? '添加提醒' : undefined}
          onAction={
            pets.length > 0
              ? () => navigation.navigate('AddReminder', {})
              : undefined
          }
        />
        {pets.length === 0 && (
          <Text style={styles.hintText}>请先添加一只猫咪</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isExpoGo && (
        <View style={styles.expoGoBanner}>
          <Ionicons name="information-circle-outline" size={16} color={styles.expoGoBannerText.color} />
          <Text style={styles.expoGoBannerText}>
            当前在 Expo Go 中运行，提醒仅在App打开时弹出。
          </Text>
        </View>
      )}

      {/* Stats Overview */}
      <View style={styles.statsRow}>
        {[
          { label: '全部', value: stats.total, color: theme.colors.text, icon: 'list-outline' },
          { label: '进行中', value: stats.active, color: theme.colors.success, icon: 'checkmark-circle-outline' },
          { label: '已过期', value: stats.past, color: theme.colors.warning, icon: 'alert-circle-outline' },
          { label: '已关闭', value: stats.inactive, color: theme.colors.textLight, icon: 'pause-circle-outline' },
        ].map((s, i) => (
          <View key={s.label} style={styles.statChip}>
            <Ionicons name={s.icon} size={16} color={s.color} />
            <Text style={[styles.statNumber, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, activeFilter === tab.key && styles.filterTabActive]}
            onPress={() => setActiveFilter(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterTabText,
              activeFilter === tab.key && styles.filterTabTextActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredReminders.length === 0 ? (
        <View style={styles.emptyFilter}>
          <Ionicons name="search-outline" size={32} color={theme.colors.textLight} />
          <Text style={styles.emptyFilterText}>暂无{FILTER_TABS.find((t) => t.key === activeFilter)?.label}提醒</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const pet = pets.find((p) => p.id === item.petId);
            const isPast = new Date(item.dateTime) < now;
            const isActive = item.isActive !== false;
            const typeIcon = REMINDER_TYPE_ICONS[item.type] || '📝';
            const typeColor = REMINDER_TYPE_COLORS[item.type] || '#B8B4A0';
            const countdown = getCountdownLabel(item.dateTime, isActive);

            return (
              <TouchableOpacity
                style={[
                  styles.reminderCard,
                  !isActive && styles.reminderInactive,
                ]}
                onPress={() => handleReminderPress(item)}
                onLongPress={() => handleDelete(item)}
                activeOpacity={0.7}
              >
                {/* Left accent bar */}
                <View style={[styles.cardAccent, { backgroundColor: isActive ? typeColor : theme.colors.border }]} />

                <View style={styles.cardBody}>
                  {/* Top: icon + title + switch */}
                  <View style={styles.cardTopRow}>
                    <View style={[styles.typeIconBox, { backgroundColor: typeColor + '22' }]}>
                      <Text style={styles.typeIcon}>{typeIcon}</Text>
                    </View>
                    <View style={styles.titleArea}>
                      <Text style={[styles.reminderTitle, !isActive && styles.textInactive]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.frequencyTag}>{getFrequencyLabel(item.frequency)}</Text>
                        {countdown && (
                          <View style={[styles.countdownTag, countdown.urgent && styles.countdownTagUrgent]}>
                            <Text style={[styles.countdownTagText, countdown.urgent && styles.countdownTagTextUrgent]}>
                              {countdown.text}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Switch
                      value={isActive}
                      onValueChange={() => toggleReminder(item)}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                      thumbColor={isActive ? theme.colors.primary : theme.colors.textLight}
                      style={styles.switch}
                    />
                  </View>

                  {/* Date + Time chips */}
                  <View style={styles.dateRow}>
                    <View style={styles.dateChip}>
                      <Ionicons name="calendar-outline" size={12} color={theme.colors.primary} />
                      <Text style={styles.dateChipText}>{formatDate(item.dateTime)}</Text>
                    </View>
                    <View style={styles.dateChip}>
                      <Ionicons name="time-outline" size={12} color={theme.colors.primary} />
                      <Text style={styles.dateChipText}>{formatTime(item.dateTime)}</Text>
                    </View>
                    {/* Pet avatar right-aligned */}
                    <View style={{ flex: 1 }} />
                    {pet && (
                      <View style={styles.petBadge}>
                        {pet.photo ? (
                          <Image source={{ uri: pet.photo }} style={styles.petMiniAvatar} />
                        ) : (
                          <View style={styles.petMiniAvatarPlaceholder}>
                            <Text style={styles.petMiniEmoji}>{getPetTypeIcon(pet.type)}</Text>
                          </View>
                        )}
                        <Text style={styles.petMiniName} numberOfLines={1}>{pet.name}</Text>
                      </View>
                    )}
                  </View>

                  {/* Notes */}
                  {item.notes ? (
                    <Text style={styles.notesPreview} numberOfLines={1}>📝 {item.notes}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* FAB */}
      {pets.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddReminder', {})}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statChip: {
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  filterTabTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },

  // Empty filter
  emptyFilter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  emptyFilterText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },

  // List
  list: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },

  // Card
  reminderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm + 2,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderInactive: {
    opacity: 0.55,
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: theme.spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  typeIcon: {
    fontSize: 22,
  },
  titleArea: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 3,
  },
  textInactive: {
    textDecorationLine: 'line-through',
    color: theme.colors.textLight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs + 2,
  },
  frequencyTag: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.border + '80',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.round,
    overflow: 'hidden',
  },
  countdownTag: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.round,
  },
  countdownTagUrgent: {
    backgroundColor: theme.colors.error + '15',
  },
  countdownTagText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  countdownTagTextUrgent: {
    color: theme.colors.error,
  },
  switch: {
    marginLeft: theme.spacing.sm,
  },

  // Date chips
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm + 2,
    paddingTop: theme.spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.primary + '12',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
  },
  dateChipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },

  // Pet badge (inline in date row)
  petBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 90,
  },
  petMiniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 8,
  },
  petMiniAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petMiniEmoji: {
    fontSize: 14,
  },
  petMiniName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  petMiniGender: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },

  // Notes preview
  notesPreview: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs + 2,
    fontStyle: 'italic',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 20,
    right: theme.spacing.md,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // Other
  hintText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.xxl,
  },
  expoGoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 6,
  },
  expoGoBannerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
    flex: 1,
  },
});

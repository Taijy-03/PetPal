import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import { formatDate, formatTime, getFrequencyLabel } from '../utils/helpers';
import { isExpoGo } from '../utils/notifications';

export default function RemindersScreen({ navigation }) {
  const { reminders, pets, updateReminder, removeReminder } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const sortedReminders = [...reminders].sort(
    (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
  );

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

  const getTypeIcon = (type) => {
    const icons = {
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
    return icons[type] || '📝';
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
      <FlatList
        data={sortedReminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const pet = pets.find((p) => p.id === item.petId);
          const isPast = new Date(item.dateTime) < new Date();
          return (
            <TouchableOpacity
              style={[
                styles.reminderCard,
                !item.isActive && styles.reminderInactive,
                isPast && item.isActive && styles.reminderPast,
              ]}
              onLongPress={() => handleDelete(item)}
              activeOpacity={0.8}
            >
              <View style={styles.reminderLeft}>
                <Text style={styles.reminderIcon}>
                  {getTypeIcon(item.type)}
                </Text>
                <View style={styles.reminderInfo}>
                  <Text
                    style={[
                      styles.reminderTitle,
                      !item.isActive && styles.textInactive,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.reminderPet}>
                    {pet?.name || '未知'} • {getFrequencyLabel(item.frequency)}
                  </Text>
                  <View style={styles.dateTimeRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.reminderDateTime}>
                      {formatDate(item.dateTime)}
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.reminderDateTime}>
                      {formatTime(item.dateTime)}
                    </Text>
                  </View>
                  {item.notes ? (
                    <Text style={styles.reminderNotes} numberOfLines={1}>
                      {item.notes}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.reminderRight}>
                <Switch
                  value={item.isActive !== false}
                  onValueChange={() => toggleReminder(item)}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary + '50',
                  }}
                  thumbColor={
                    item.isActive !== false
                      ? theme.colors.primary
                      : theme.colors.textLight
                  }
                />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: 80,
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reminderInactive: {
    opacity: 0.6,
    borderLeftColor: theme.colors.textLight,
  },
  reminderPast: {
    borderLeftColor: theme.colors.warning,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderIcon: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  textInactive: {
    textDecorationLine: 'line-through',
    color: theme.colors.textLight,
  },
  reminderPet: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  reminderDateTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  reminderNotes: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  reminderRight: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  deleteBtn: {
    padding: 4,
  },
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

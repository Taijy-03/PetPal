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
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import { LightTheme } from '../theme/theme';
import { formatDate, formatTime } from '../utils/helpers';

const theme = LightTheme;

export default function RemindersScreen({ navigation }) {
  const { reminders, pets, updateReminder, removeReminder } = useApp();

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
    Alert.alert('Delete Reminder', `Delete "${reminder.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeReminder(reminder.id),
      },
    ]);
  };

  const getTypeIcon = (type) => {
    const icons = {
      feeding: '🍖',
      walk: '🚶',
      medicine: '💊',
      vet: '🏥',
      grooming: '✂️',
      vaccination: '💉',
      other: '📝',
    };
    return icons[type] || '📝';
  };

  if (reminders.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="alarm-outline"
          title="No Reminders"
          message="Set reminders for feeding, walks, vet visits, and more to never miss an important pet care task."
          actionLabel={pets.length > 0 ? 'Add Reminder' : undefined}
          onAction={
            pets.length > 0
              ? () =>
                  navigation.navigate('AddReminder', {
                    petId: pets[0].id,
                  })
              : undefined
          }
        />
        {pets.length === 0 && (
          <Text style={styles.hintText}>Add a pet first to create reminders</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
                    {pet?.name || 'Unknown'} • {item.frequency}
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

const styles = StyleSheet.create({
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
});

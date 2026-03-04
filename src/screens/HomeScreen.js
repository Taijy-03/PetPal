import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import PetCard from '../components/PetCard';
import EmptyState from '../components/EmptyState';
import { LightTheme } from '../theme/theme';
import {
  getRelativeTime,
  getActivityIcon,
  getHealthIcon,
  getPetTypeIcon,
} from '../utils/helpers';

const theme = LightTheme;

export default function HomeScreen({ navigation }) {
  const {
    pets,
    activities,
    healthRecords,
    reminders,
    isLoading,
    refreshData,
    selectPet,
  } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, []);

  // Get recent activities (last 5)
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Get upcoming reminders
  const upcomingReminders = [...reminders]
    .filter((r) => new Date(r.dateTime) >= new Date() && r.isActive !== false)
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 3);

  // Stats
  const totalPets = pets.length;
  const totalRecords = healthRecords.length;
  const totalActivities = activities.length;
  const activeReminders = reminders.filter((r) => r.isActive !== false).length;

  const handlePetPress = (pet) => {
    selectPet(pet);
    navigation.navigate('PetDetail', { petId: pet.id });
  };

  if (pets.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <EmptyState
          emoji="🐾"
          title="Welcome to PetPal!"
          message="Start by adding your first pet to track their health, activities, and memories."
          actionLabel="Add Your First Pet"
          onAction={() => navigation.navigate('AddPet')}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.subtitle}>
            You have {totalPets} pet{totalPets !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPet')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <View style={[styles.statCard, { backgroundColor: '#FF6B6B' }]}>
          <Ionicons name="paw" size={24} color="#FFF" />
          <Text style={styles.statNumber}>{totalPets}</Text>
          <Text style={styles.statLabel}>Pets</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#4ECDC4' }]}>
          <Ionicons name="medkit" size={24} color="#FFF" />
          <Text style={styles.statNumber}>{totalRecords}</Text>
          <Text style={styles.statLabel}>Records</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#45B7D1' }]}>
          <Ionicons name="footsteps" size={24} color="#FFF" />
          <Text style={styles.statNumber}>{totalActivities}</Text>
          <Text style={styles.statLabel}>Activities</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#96CEB4' }]}>
          <Ionicons name="notifications" size={24} color="#FFF" />
          <Text style={styles.statNumber}>{activeReminders}</Text>
          <Text style={styles.statLabel}>Reminders</Text>
        </View>
      </ScrollView>

      {/* My Pets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Pets</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PetsTab')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onPress={() => handlePetPress(pet)}
          />
        ))}
      </View>

      {/* Recent Activity */}
      {recentActivities.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          {recentActivities.map((activity) => {
            const pet = pets.find((p) => p.id === activity.petId);
            return (
              <View key={activity.id} style={styles.activityItem}>
                <Text style={styles.activityIcon}>
                  {getActivityIcon(activity.type)}
                </Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>
                    {activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1)}
                  </Text>
                  <Text style={styles.activitySubtitle}>
                    {pet?.name || 'Unknown Pet'} •{' '}
                    {getRelativeTime(activity.date)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <View style={[styles.section, { marginBottom: theme.spacing.xxl }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
          </View>
          {upcomingReminders.map((reminder) => {
            const pet = pets.find((p) => p.id === reminder.petId);
            return (
              <View key={reminder.id} style={styles.reminderItem}>
                <View style={styles.reminderIcon}>
                  <Ionicons
                    name="alarm-outline"
                    size={20}
                    color={theme.colors.warning}
                  />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderSubtitle}>
                    {pet?.name} •{' '}
                    {new Date(reminder.dateTime).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  statCard: {
    width: 100,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  statNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: '#FFF',
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  section: {
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  seeAll: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  activitySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  reminderIcon: {
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
  reminderSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

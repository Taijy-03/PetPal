import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LightTheme } from '../theme/theme';

const theme = LightTheme;

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings, clearAll, pets, healthRecords, activities, reminders } = useApp();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your pets, health records, activities, and reminders. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: () => {
            clearAll();
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      pets,
      healthRecords,
      activities,
      reminders,
      settings,
    };
    Alert.alert(
      'Export Data',
      `Your data summary:\n• ${pets.length} Pets\n• ${healthRecords.length} Health Records\n• ${activities.length} Activities\n• ${reminders.length} Reminders\n\nData export feature available in full version.`
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appIcon}>🐾</Text>
        <Text style={styles.appName}>PetPal</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
      </View>

      {/* General Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#34495E20' }]}>
              <Ionicons name="moon" size={20} color="#34495E" />
            </View>
            <View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Toggle dark appearance
              </Text>
            </View>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => updateSettings({ darkMode: value })}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary + '50',
            }}
            thumbColor={
              settings.darkMode ? theme.colors.primary : theme.colors.textLight
            }
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#E74C3C20' }]}>
              <Ionicons name="notifications" size={20} color="#E74C3C" />
            </View>
            <View>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Enable push notifications
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) =>
              updateSettings({ notificationsEnabled: value })
            }
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary + '50',
            }}
            thumbColor={
              settings.notificationsEnabled
                ? theme.colors.primary
                : theme.colors.textLight
            }
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#3498DB20' }]}>
              <Ionicons name="download-outline" size={20} color="#3498DB" />
            </View>
            <View>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingDescription}>
                Download your pet data
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textLight}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#E74C3C20' }]}>
              <Ionicons name="trash-outline" size={20} color="#E74C3C" />
            </View>
            <View>
              <Text style={styles.settingLabel}>Clear All Data</Text>
              <Text style={styles.settingDescription}>
                Delete all pets and records
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textLight}
          />
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <StatItem
            icon="paw"
            color="#FF6B6B"
            label="Total Pets"
            value={pets.length}
          />
          <StatItem
            icon="medkit"
            color="#4ECDC4"
            label="Health Records"
            value={healthRecords.length}
          />
          <StatItem
            icon="footsteps"
            color="#45B7D1"
            label="Activities"
            value={activities.length}
          />
          <StatItem
            icon="alarm"
            color="#96CEB4"
            label="Reminders"
            value={reminders.length}
          />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#9B59B620' }]}>
              <Ionicons name="heart" size={20} color="#9B59B6" />
            </View>
            <View>
              <Text style={styles.settingLabel}>Made with Love</Text>
              <Text style={styles.settingDescription}>
                For pet lovers everywhere
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

function StatItem({ icon, color, label, value }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  appIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.sm,
  },
  appName: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  appVersion: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  statItem: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

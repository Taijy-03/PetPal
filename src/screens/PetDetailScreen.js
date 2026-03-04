import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/FormElements';
import { LightTheme } from '../theme/theme';
import {
  calculateAge,
  getPetTypeIcon,
  getActivityIcon,
  getHealthIcon,
  formatDate,
  getRelativeTime,
  generateId,
} from '../utils/helpers';

const theme = LightTheme;

export default function PetDetailScreen({ navigation, route }) {
  const petId = route?.params?.petId;
  const {
    pets,
    healthRecords,
    activities,
    reminders,
    removePet,
    updatePet,
    selectPet,
  } = useApp();

  const pet = pets.find((p) => p.id === petId);
  const petHealthRecords = healthRecords
    .filter((r) => r.petId === petId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const petActivities = activities
    .filter((a) => a.petId === petId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const petReminders = reminders
    .filter((r) => r.petId === petId)
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const [activeTab, setActiveTab] = useState('info');

  if (!pet) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Pet not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete ${pet.name}? This will also remove all their records, activities, and reminders.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removePet(pet.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const addPhotoToGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission needed', 'Please allow photo access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const updatedPhotos = [...(pet.photos || []), {
        id: generateId(),
        uri: result.assets[0].uri,
        date: new Date().toISOString(),
      }];
      await updatePet({ ...pet, photos: updatedPhotos });
    }
  };

  const tabs = [
    { key: 'info', label: 'Info', icon: 'information-circle-outline' },
    { key: 'health', label: 'Health', icon: 'medkit-outline' },
    { key: 'activity', label: 'Activity', icon: 'footsteps-outline' },
    { key: 'gallery', label: 'Gallery', icon: 'images-outline' },
  ];

  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoGrid}>
        <InfoItem label="Type" value={`${getPetTypeIcon(pet.type)} ${pet.type?.charAt(0).toUpperCase() + pet.type?.slice(1)}`} />
        {pet.breed && <InfoItem label="Breed" value={pet.breed} />}
        {pet.gender && (
          <InfoItem
            label="Gender"
            value={pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
          />
        )}
        {pet.birthDate && (
          <InfoItem label="Age" value={calculateAge(pet.birthDate)} />
        )}
        {pet.birthDate && (
          <InfoItem label="Birth Date" value={formatDate(pet.birthDate)} />
        )}
        {pet.weight && (
          <InfoItem
            label="Weight"
            value={`${pet.weight} ${pet.weightUnit || 'kg'}`}
          />
        )}
        {pet.color && <InfoItem label="Color" value={pet.color} />}
        {pet.microchip && (
          <InfoItem label="Microchip" value={pet.microchip} />
        )}
      </View>
      {pet.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>{pet.notes}</Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <QuickAction
            icon="medkit"
            label="Health Record"
            color="#4ECDC4"
            onPress={() =>
              navigation.navigate('AddHealthRecord', { petId: pet.id })
            }
          />
          <QuickAction
            icon="footsteps"
            label="Log Activity"
            color="#45B7D1"
            onPress={() =>
              navigation.navigate('AddActivity', { petId: pet.id })
            }
          />
          <QuickAction
            icon="alarm"
            label="Add Reminder"
            color="#96CEB4"
            onPress={() =>
              navigation.navigate('AddReminder', { petId: pet.id })
            }
          />
          <QuickAction
            icon="camera"
            label="Add Photo"
            color="#DDA0DD"
            onPress={addPhotoToGallery}
          />
        </View>
      </View>
    </View>
  );

  const renderHealthTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addRecordBtn}
        onPress={() =>
          navigation.navigate('AddHealthRecord', { petId: pet.id })
        }
      >
        <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
        <Text style={styles.addRecordText}>Add Health Record</Text>
      </TouchableOpacity>
      {petHealthRecords.length === 0 ? (
        <View style={styles.emptyTab}>
          <Ionicons name="medkit-outline" size={48} color={theme.colors.textLight} />
          <Text style={styles.emptyTabText}>No health records yet</Text>
        </View>
      ) : (
        petHealthRecords.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordIcon}>
                {getHealthIcon(record.type)}
              </Text>
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordDate}>
                  {formatDate(record.date)}
                </Text>
              </View>
              <View style={styles.recordBadge}>
                <Text style={styles.recordBadgeText}>
                  {record.type?.charAt(0).toUpperCase() + record.type?.slice(1)}
                </Text>
              </View>
            </View>
            {record.notes && (
              <Text style={styles.recordNotes}>{record.notes}</Text>
            )}
            {record.veterinarian && (
              <Text style={styles.recordVet}>
                🩺 Dr. {record.veterinarian}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderActivityTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addRecordBtn}
        onPress={() =>
          navigation.navigate('AddActivity', { petId: pet.id })
        }
      >
        <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
        <Text style={styles.addRecordText}>Log Activity</Text>
      </TouchableOpacity>
      {petActivities.length === 0 ? (
        <View style={styles.emptyTab}>
          <Ionicons name="footsteps-outline" size={48} color={theme.colors.textLight} />
          <Text style={styles.emptyTabText}>No activities logged yet</Text>
        </View>
      ) : (
        petActivities.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <Text style={styles.activityCardIcon}>
              {getActivityIcon(activity.type)}
            </Text>
            <View style={styles.activityCardInfo}>
              <Text style={styles.activityCardTitle}>
                {activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1)}
              </Text>
              <Text style={styles.activityCardTime}>
                {getRelativeTime(activity.date)}
              </Text>
              {activity.duration && (
                <Text style={styles.activityDuration}>
                  ⏱️ {activity.duration} min
                </Text>
              )}
              {activity.notes && (
                <Text style={styles.activityNotes}>{activity.notes}</Text>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderGalleryTab = () => {
    const allPhotos = [
      ...(pet.photo ? [{ id: 'main', uri: pet.photo, date: pet.createdAt }] : []),
      ...(pet.photos || []),
    ];

    return (
      <View style={styles.tabContent}>
        <TouchableOpacity
          style={styles.addRecordBtn}
          onPress={addPhotoToGallery}
        >
          <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
          <Text style={styles.addRecordText}>Add Photo</Text>
        </TouchableOpacity>
        {allPhotos.length === 0 ? (
          <View style={styles.emptyTab}>
            <Ionicons name="images-outline" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyTabText}>No photos yet</Text>
          </View>
        ) : (
          <View style={styles.photoGrid}>
            {allPhotos.map((photo, index) => (
              <TouchableOpacity key={photo.id || index} style={styles.gridPhoto}>
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.gridImage}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.heroSection}>
        {pet.photo ? (
          <Image source={{ uri: pet.photo }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroEmoji}>{getPetTypeIcon(pet.type)}</Text>
          </View>
        )}
        <Text style={styles.heroName}>{pet.name}</Text>
        <Text style={styles.heroBreed}>
          {pet.breed || pet.type?.charAt(0).toUpperCase() + pet.type?.slice(1)}
        </Text>

        {/* Action Buttons */}
        <View style={styles.heroActions}>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() =>
              navigation.navigate('EditPet', { pet })
            }
          >
            <Ionicons name="pencil" size={18} color={theme.colors.primary} />
            <Text style={styles.heroButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.heroButton, styles.heroButtonDanger]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={18} color={theme.colors.error} />
            <Text style={[styles.heroButtonText, { color: theme.colors.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={
                activeTab === tab.key
                  ? theme.colors.primary
                  : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'info' && renderInfoTab()}
      {activeTab === 'health' && renderHealthTab()}
      {activeTab === 'activity' && renderActivityTab()}
      {activeTab === 'gallery' && renderGalleryTab()}
    </ScrollView>
  );
}

function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  heroPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroName: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  heroBreed: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  heroActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroButtonDanger: {
    borderColor: theme.colors.error + '40',
  },
  heroButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    gap: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  // Tab Content
  tabContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  // Info Tab
  infoGrid: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  notesSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  notesLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  notesText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  // Quick Actions
  quickActions: {
    marginTop: theme.spacing.lg,
  },
  quickActionsTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  quickActionLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  // Records
  addRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    borderStyle: 'dashed',
  },
  addRecordText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  emptyTab: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTabText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
  },
  recordCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  recordDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  recordBadge: {
    backgroundColor: theme.colors.secondary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
  },
  recordBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.secondary,
    fontWeight: theme.fontWeight.semibold,
  },
  recordNotes: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    paddingLeft: 40,
  },
  recordVet: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    paddingLeft: 40,
  },
  // Activity Card
  activityCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  activityCardIcon: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  activityCardInfo: {
    flex: 1,
  },
  activityCardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  activityCardTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  activityDuration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.info,
    marginTop: 4,
  },
  activityNotes: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  // Gallery
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridPhoto: {
    width: '32.5%',
    aspectRatio: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
});

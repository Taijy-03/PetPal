import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LightTheme } from '../theme/theme';
import { getPetTypeIcon, calculateAge } from '../utils/helpers';

const theme = LightTheme;

export default function PetCard({ pet, onPress, onLongPress, compact = false }) {
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactImageContainer}>
          {pet.photo ? (
            <Image source={{ uri: pet.photo }} style={styles.compactImage} />
          ) : (
            <View style={styles.compactPlaceholder}>
              <Text style={styles.compactEmoji}>{getPetTypeIcon(pet.type)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.compactName} numberOfLines={1}>
          {pet.name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {pet.photo ? (
            <Image source={{ uri: pet.photo }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.emoji}>{getPetTypeIcon(pet.type)}</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{pet.name}</Text>
          <Text style={styles.breed}>
            {pet.breed || pet.type?.charAt(0).toUpperCase() + pet.type?.slice(1)}
          </Text>
          <View style={styles.detailsRow}>
            {pet.birthDate && (
              <View style={styles.detail}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.detailText}>{calculateAge(pet.birthDate)}</Text>
              </View>
            )}
            {pet.weight && (
              <View style={styles.detail}>
                <Ionicons name="fitness-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.detailText}>{pet.weight} {pet.weightUnit || 'kg'}</Text>
              </View>
            )}
          </View>
          {pet.gender && (
            <View style={styles.genderBadge}>
              <Ionicons
                name={pet.gender === 'male' ? 'male' : 'female'}
                size={12}
                color={pet.gender === 'male' ? '#3498DB' : '#E91E63'}
              />
              <Text
                style={[
                  styles.genderText,
                  { color: pet.gender === 'male' ? '#3498DB' : '#E91E63' },
                ]}
              >
                {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
              </Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: theme.spacing.md,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.lg,
  },
  placeholder: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  breed: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: theme.spacing.xs,
  },
  genderText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  // Compact styles
  compactCard: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  compactImageContainer: {
    marginBottom: theme.spacing.xs,
  },
  compactImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  compactPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  compactEmoji: {
    fontSize: 24,
  },
  compactName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    maxWidth: 60,
    textAlign: 'center',
  },
});

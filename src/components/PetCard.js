import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/AppContext';
import { getPetTypeIcon, calculateAge } from '../utils/helpers';

const BREED_LABELS = {
  ragdoll: '布偶猫',
  british_shorthair: '英短',
  american_shorthair: '美短',
  persian: '波斯猫',
  siamese: '暹罗猫',
  maine_coon: '缅因猫',
  scottish_fold: '折耳猫',
  russian_blue: '蓝猫',
  bombay: '孟买猫',
  bengal: '豹猫',
  abyssinian: '阿比',
  birman: '伯曼猫',
  burmese: '缅甸猫',
  sphynx: '无毛猫',
  exotic_shorthair: '加菲猫',
  american_curl: '美卷',
  ragamuffin: '褴褛猫',
  devon_rex: '德文卷毛',
  cornish_rex: '柯尼斯',
  tonkinese: '东奇尼',
  american_bobtail: '美短尾',
  japanese_bobtail: '日短尾',
  egyptian_mau: '埃及猫',
  highland_fold: '高地折耳',
  chartreux: '沙特尔',
  norwegian_forest: '挪森林',
  siberian: '西伯利亚',
  turkish_van: '梵猫',
  turkish_angora: '安哥拉',
  chinese_domestic: '田园猫',
  orange_tabby: '橘猫',
  calico: '三花猫',
  tuxedo: '奶牛猫',
  tabby: '狸花猫',
  white_cat: '白猫',
  black_cat: '黑猫',
  mixed: '混血猫',
  other: '其他',
};

function getBreedLabel(breed) {
  if (!breed) return '猫咪';
  return BREED_LABELS[breed] || breed;
}

export default function PetCard({ pet, onPress, onLongPress, compact = false }) {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

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

  const genderSymbol = pet.gender === 'male' ? '♂' : pet.gender === 'female' ? '♀' : null;
  const genderColor = pet.gender === 'male' ? '#3B82F6' : '#EC4899';
  const breedLabel = getBreedLabel(pet.breed);
  const age = pet.birthDate ? calculateAge(pet.birthDate) : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Photo */}
        <View style={styles.imageContainer}>
          {pet.photo ? (
            <Image source={{ uri: pet.photo }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.emoji}>{getPetTypeIcon(pet.type)}</Text>
            </View>
          )}
          {genderSymbol && (
            <View style={[styles.genderDot, { backgroundColor: genderColor }]}>
              <Text style={styles.genderDotText}>{genderSymbol}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{pet.name}</Text>
          </View>
          <Text style={styles.breed} numberOfLines={1}>{breedLabel}</Text>

          <View style={styles.tagsRow}>
            {age && (
              <View style={styles.tag}>
                <Ionicons name="calendar-outline" size={12} color={theme.colors.primary} />
                <Text style={styles.tagText}>{age}</Text>
              </View>
            )}
            {pet.weight && (
              <View style={styles.tag}>
                <Ionicons name="fitness-outline" size={12} color={theme.colors.primary} />
                <Text style={styles.tagText}>{pet.weight} {pet.weightUnit || 'kg'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    padding: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 20,
  },
  placeholder: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  genderDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  genderDotText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },
  info: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  breed: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
  },
  tagText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primaryDark || theme.colors.primary,
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

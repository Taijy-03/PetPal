import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/AppContext';
import { getPetTypeIcon, calculateAge } from '../utils/helpers';

// Custom Text Input
export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  icon,
  error,
  required = false,
}) {
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  return (
    <View style={formStyles.inputGroup}>
      {label && (
        <Text style={formStyles.label}>
          {label}
          {required && <Text style={formStyles.required}> *</Text>}
        </Text>
      )}
      <View style={[formStyles.inputContainer, error && formStyles.inputError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={theme.colors.textSecondary}
            style={formStyles.inputIcon}
          />
        )}
        <TextInput
          style={[formStyles.input, multiline && formStyles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textLight}
          multiline={multiline}
          keyboardType={keyboardType}
          numberOfLines={multiline ? 4 : 1}
        />
      </View>
      {error && <Text style={formStyles.errorText}>{error}</Text>}
    </View>
  );
}

// Option Picker (like a select dropdown)
export function FormPicker({ label, options, value, onChange, required = false, error, compact = false }) {
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={formStyles.inputGroup}>
      {label && (
        <Text style={formStyles.label}>
          {label}
          {required && <Text style={formStyles.required}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[formStyles.pickerButton, compact && formStyles.pickerButtonCompact, error && formStyles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            formStyles.pickerText,
            !selected && formStyles.pickerPlaceholder,
          ]}
        >
          {selected ? `${selected.icon || ''} ${selected.label}` : '请选择...'}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={formStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={formStyles.modalContent}>
            <View style={formStyles.modalHeader}>
              <Text style={formStyles.modalTitle}>选择{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={formStyles.modalScroll}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    formStyles.modalOption,
                    value === option.value && formStyles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    setModalVisible(false);
                  }}
                >
                  {option.icon && (
                    <Text style={formStyles.optionIcon}>{option.icon}</Text>
                  )}
                  <Text
                    style={[
                      formStyles.optionText,
                      value === option.value && formStyles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      {error && <Text style={formStyles.errorText}>{error}</Text>}
    </View>
  );
}

// Date Picker (simple text-based for compatibility)
export function FormDateInput({
  label,
  value,
  onChange,
  placeholder = '请输入 例: 2023-01-15',
  required = false,
  error,
  isWarning = false,
  maxDate,
}) {
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);

  const handleDateChange = (text) => {
    // Only allow digits and dashes
    let cleaned = text.replace(/[^0-9-]/g, '');
    
    // Auto-format: insert dashes at correct positions
    // Remove all dashes first, then re-insert
    const digitsOnly = cleaned.replace(/-/g, '');
    let formatted = '';
    for (let i = 0; i < digitsOnly.length && i < 8; i++) {
      if (i === 4 || i === 6) {
        formatted += '-';
      }
      formatted += digitsOnly[i];
    }
    
    onChange(formatted);
  };

  // Calculate helper text showing age
  const getAgeHint = () => {
    if (!value || value.length !== 10) return null;
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return null;
    const now = new Date();
    if (parsed > now) return null;
    const diffMs = now - parsed;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `约 ${diffDays} 天`;
    const diffMonths = Math.floor(diffDays / 30.44);
    if (diffMonths < 12) return `约 ${diffMonths} 个月`;
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return months > 0 ? `约 ${years} 岁 ${months} 个月` : `约 ${years} 岁`;
  };

  const ageHint = getAgeHint();

  return (
    <View style={formStyles.inputGroup}>
      {label && (
        <Text style={formStyles.label}>
          {label}
          {required && <Text style={formStyles.required}> *</Text>}
        </Text>
      )}
      <View style={[formStyles.inputContainer, error && !isWarning && formStyles.inputError, error && isWarning && formStyles.inputWarning]}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={theme.colors.textSecondary}
          style={formStyles.inputIcon}
        />
        <TextInput
          style={formStyles.input}
          value={value}
          onChangeText={handleDateChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textLight}
          keyboardType="number-pad"
          maxLength={10}
        />
      </View>
      {error && <Text style={[formStyles.errorText, isWarning && formStyles.warningText]}>{error}</Text>}
      {ageHint && !error && (
        <Text style={formStyles.hintText}>🐱 {ageHint}</Text>
      )}
    </View>
  );
}

// Action Button
export function FormButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
}) {
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  const buttonStyle = [
    formStyles.button,
    variant === 'secondary' && formStyles.buttonSecondary,
    variant === 'danger' && formStyles.buttonDanger,
    variant === 'outline' && formStyles.buttonOutline,
    disabled && formStyles.buttonDisabled,
  ];

  const textStyle = [
    formStyles.buttonText,
    variant === 'outline' && formStyles.buttonTextOutline,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={variant === 'outline' ? theme.colors.primary : '#FFF'}
        />
      )}
      <Text style={textStyle}>{loading ? '请稍候...' : title}</Text>
    </TouchableOpacity>
  );
}

// Section Header
export function SectionHeader({ title, actionLabel, onAction }) {
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  return (
    <View style={formStyles.sectionHeader}>
      <Text style={formStyles.sectionTitle}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction}>
          <Text style={formStyles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Chip / Tag selector
export function ChipGroup({ options, value, onChange, multiSelect = false }) {
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  const handlePress = (optionValue) => {
    if (multiSelect) {
      const newValues = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
    }
  };

  return (
    <View style={formStyles.chipGroup}>
      {options.map((option) => {
        const isSelected = multiSelect
          ? value.includes(option.value)
          : value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[formStyles.chip, isSelected && formStyles.chipSelected]}
            onPress={() => handlePress(option.value)}
          >
            {option.icon && (
              <Text style={formStyles.chipIcon}>{option.icon}</Text>
            )}
            <Text
              style={[
                formStyles.chipText,
                isSelected && formStyles.chipTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Pet Picker with photos and rich card display
export function FormPetPicker({ label, pets, value, onChange, required = false, error }) {
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  const selected = pets.find((p) => p.id === value);

  const genderSymbol = (gender) => gender === 'male' ? '♂' : gender === 'female' ? '♀' : null;
  const genderColor = (gender) => gender === 'male' ? '#3B82F6' : '#EC4899';

  return (
    <View style={formStyles.inputGroup}>
      {label && (
        <Text style={formStyles.label}>
          {label}
          {required && <Text style={formStyles.required}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[formStyles.petPickerButton, error && formStyles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        {selected ? (
          <View style={formStyles.petPickerSelected}>
            <View style={formStyles.petPickerAvatarSmall}>
              {selected.photo ? (
                <Image source={{ uri: selected.photo }} style={formStyles.petPickerAvatarImgSmall} />
              ) : (
                <Text style={formStyles.petPickerEmojiSmall}>{getPetTypeIcon(selected.type)}</Text>
              )}
            </View>
            <Text style={formStyles.petPickerSelectedName}>{selected.name}</Text>
            {genderSymbol(selected.gender) && (
              <Text style={[formStyles.petPickerGenderSmall, { color: genderColor(selected.gender) }]}>
                {genderSymbol(selected.gender)}
              </Text>
            )}
          </View>
        ) : (
          <View style={formStyles.petPickerSelected}>
            <Ionicons name="paw-outline" size={20} color={theme.colors.textLight} />
            <Text style={formStyles.pickerPlaceholder}>请选择猫咪...</Text>
          </View>
        )}
        <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={formStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={formStyles.petPickerModalContent}>
            <View style={formStyles.petPickerModalHandle} />
            <View style={formStyles.petPickerModalHeader}>
              <Text style={formStyles.modalTitle}>选择猫咪</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={formStyles.petPickerModalScroll} showsVerticalScrollIndicator={false}>
              {pets.map((pet) => {
                const isSelected = value === pet.id;
                const age = pet.birthDate ? calculateAge(pet.birthDate) : null;
                const gs = genderSymbol(pet.gender);
                const gc = genderColor(pet.gender);
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[
                      formStyles.petPickerCard,
                      isSelected && formStyles.petPickerCardSelected,
                    ]}
                    onPress={() => {
                      onChange(pet.id);
                      setModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={formStyles.petPickerAvatarContainer}>
                      {pet.photo ? (
                        <Image source={{ uri: pet.photo }} style={formStyles.petPickerAvatarImg} />
                      ) : (
                        <View style={formStyles.petPickerAvatarPlaceholder}>
                          <Text style={formStyles.petPickerEmoji}>{getPetTypeIcon(pet.type)}</Text>
                        </View>
                      )}
                      {gs && (
                        <View style={[formStyles.petPickerGenderDot, { backgroundColor: gc }]}>
                          <Text style={formStyles.petPickerGenderDotText}>{gs}</Text>
                        </View>
                      )}
                    </View>
                    <View style={formStyles.petPickerInfo}>
                      <Text style={[
                        formStyles.petPickerName,
                        isSelected && formStyles.petPickerNameSelected,
                      ]}>{pet.name}</Text>
                      <View style={formStyles.petPickerMeta}>
                        {age && (
                          <View style={formStyles.petPickerTag}>
                            <Ionicons name="calendar-outline" size={11} color={theme.colors.primary} />
                            <Text style={formStyles.petPickerTagText}>{age}</Text>
                          </View>
                        )}
                        {pet.weight && (
                          <View style={formStyles.petPickerTag}>
                            <Ionicons name="fitness-outline" size={11} color={theme.colors.primary} />
                            <Text style={formStyles.petPickerTagText}>{pet.weight} {pet.weightUnit || 'kg'}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {isSelected && (
                      <View style={formStyles.petPickerCheck}>
                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      {error && <Text style={formStyles.errorText}>{error}</Text>}
    </View>
  );
}

const createFormStyles = (theme) => StyleSheet.create({
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputWarning: {
    borderColor: theme.colors.warning || '#E8A317',
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  warningText: {
    color: theme.colors.warning || '#E8A317',
  },
  hintText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  // Picker
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pickerButtonCompact: {
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  pickerText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
  },
  pickerPlaceholder: {
    color: theme.colors.textLight,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalScroll: {
    padding: theme.spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  modalOptionSelected: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  // Button
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.sm,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  buttonDanger: {
    backgroundColor: theme.colors.error,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFF',
  },
  buttonTextOutline: {
    color: theme.colors.primary,
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  sectionAction: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  // Chips
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  chipSelected: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  // Pet Picker styles
  petPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 52,
  },
  petPickerSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  petPickerAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  petPickerAvatarImgSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  petPickerEmojiSmall: {
    fontSize: 18,
  },
  petPickerSelectedName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  petPickerGenderSmall: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  petPickerModalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl + 4,
    borderTopRightRadius: theme.borderRadius.xl + 4,
    maxHeight: '70%',
    paddingBottom: theme.spacing.xl,
  },
  petPickerModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  petPickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  petPickerModalScroll: {
    padding: theme.spacing.md,
  },
  petPickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petPickerCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  petPickerAvatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  petPickerAvatarImg: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  petPickerAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight + '50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petPickerEmoji: {
    fontSize: 26,
  },
  petPickerGenderDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.inputBackground,
  },
  petPickerGenderDotText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '700',
  },
  petPickerInfo: {
    flex: 1,
  },
  petPickerName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  petPickerNameSelected: {
    color: theme.colors.primary,
  },
  petPickerMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  petPickerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.primary + '12',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.round,
  },
  petPickerTagText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primaryDark || theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  petPickerCheck: {
    marginLeft: theme.spacing.sm,
  },
});

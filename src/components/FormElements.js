import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LightTheme } from '../theme/theme';

const theme = LightTheme;

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
export function FormPicker({ label, options, value, onChange, required = false }) {
  const [modalVisible, setModalVisible] = useState(false);
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
        style={formStyles.pickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            formStyles.pickerText,
            !selected && formStyles.pickerPlaceholder,
          ]}
        >
          {selected ? `${selected.icon || ''} ${selected.label}` : 'Select...'}
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
              <Text style={formStyles.modalTitle}>Select {label}</Text>
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
    </View>
  );
}

// Date Picker (simple text-based for compatibility)
export function FormDateInput({
  label,
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  required = false,
}) {
  return (
    <View style={formStyles.inputGroup}>
      {label && (
        <Text style={formStyles.label}>
          {label}
          {required && <Text style={formStyles.required}> *</Text>}
        </Text>
      )}
      <View style={formStyles.inputContainer}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={theme.colors.textSecondary}
          style={formStyles.inputIcon}
        />
        <TextInput
          style={formStyles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textLight}
          keyboardType="default"
        />
      </View>
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
      <Text style={textStyle}>{loading ? 'Please wait...' : title}</Text>
    </TouchableOpacity>
  );
}

// Section Header
export function SectionHeader({ title, actionLabel, onAction }) {
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

const formStyles = StyleSheet.create({
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
});

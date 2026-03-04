import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import {
  FormInput,
  FormPicker,
  FormDateInput,
  FormButton,
  ChipGroup,
} from '../components/FormElements';
import { LightTheme } from '../theme/theme';
import { generateId, HEALTH_RECORD_TYPES } from '../utils/helpers';

const theme = LightTheme;

export default function AddHealthRecordScreen({ navigation, route }) {
  const { petId } = route.params;
  const { addHealthRecord, pets } = useApp();
  const pet = pets.find((p) => p.id === petId);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('checkup');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [veterinarian, setVeterinarian] = useState('');
  const [clinic, setClinic] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the record.');
      return;
    }

    const record = {
      id: generateId(),
      petId,
      title: title.trim(),
      type,
      date,
      veterinarian: veterinarian.trim(),
      clinic: clinic.trim(),
      cost: cost ? parseFloat(cost) : null,
      notes: notes.trim(),
      nextDueDate: nextDueDate || null,
      createdAt: new Date().toISOString(),
    };

    try {
      await addHealthRecord(record);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save health record.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.petBanner}>
          <Text style={styles.petBannerText}>
            📋 Health Record for {pet?.name || 'Pet'}
          </Text>
        </View>

        <Text style={styles.label}>Record Type</Text>
        <ChipGroup
          options={HEALTH_RECORD_TYPES}
          value={type}
          onChange={setType}
        />
        <View style={{ height: theme.spacing.md }} />

        <FormInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Annual Vaccination"
          icon="document-text-outline"
          required
        />

        <FormDateInput
          label="Date"
          value={date}
          onChange={setDate}
          required
        />

        <FormInput
          label="Veterinarian"
          value={veterinarian}
          onChangeText={setVeterinarian}
          placeholder="Dr. Smith"
          icon="person-outline"
        />

        <FormInput
          label="Clinic"
          value={clinic}
          onChangeText={setClinic}
          placeholder="Pet Care Clinic"
          icon="business-outline"
        />

        <FormInput
          label="Cost"
          value={cost}
          onChangeText={setCost}
          placeholder="0.00"
          keyboardType="decimal-pad"
          icon="cash-outline"
        />

        <FormDateInput
          label="Next Due Date"
          value={nextDueDate}
          onChange={setNextDueDate}
          placeholder="YYYY-MM-DD (optional)"
        />

        <FormInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          multiline
        />

        <FormButton
          title="Save Health Record"
          onPress={handleSave}
          icon="checkmark-circle"
        />
        <FormButton
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  petBanner: {
    backgroundColor: theme.colors.secondary + '15',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.secondary,
  },
  petBannerText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
});

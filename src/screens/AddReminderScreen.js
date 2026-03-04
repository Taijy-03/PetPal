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
} from '../components/FormElements';
import { LightTheme } from '../theme/theme';
import { generateId, REMINDER_FREQUENCIES } from '../utils/helpers';

const theme = LightTheme;

const REMINDER_TYPES = [
  { label: 'Feeding', value: 'feeding', icon: '🍖' },
  { label: 'Walk', value: 'walk', icon: '🚶' },
  { label: 'Medicine', value: 'medicine', icon: '💊' },
  { label: 'Vet Visit', value: 'vet', icon: '🏥' },
  { label: 'Grooming', value: 'grooming', icon: '✂️' },
  { label: 'Vaccination', value: 'vaccination', icon: '💉' },
  { label: 'Other', value: 'other', icon: '📝' },
];

export default function AddReminderScreen({ navigation, route }) {
  const { petId } = route.params;
  const { addReminderRecord, pets } = useApp();
  const pet = pets.find((p) => p.id === petId);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('feeding');
  const [dateTime, setDateTime] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState('09:00');
  const [frequency, setFrequency] = useState('once');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the reminder.');
      return;
    }

    const reminder = {
      id: generateId(),
      petId,
      title: title.trim(),
      type,
      dateTime: `${dateTime}T${time || '09:00'}:00`,
      frequency,
      notes: notes.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await addReminderRecord(reminder);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save reminder.');
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
            🔔 Reminder for {pet?.name || 'Pet'}
          </Text>
        </View>

        <FormInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Morning Walk"
          icon="notifications-outline"
          required
        />

        <FormPicker
          label="Type"
          options={REMINDER_TYPES}
          value={type}
          onChange={setType}
        />

        <View style={styles.row}>
          <View style={styles.flex}>
            <FormDateInput
              label="Date"
              value={dateTime}
              onChange={setDateTime}
              required
            />
          </View>
          <View style={styles.flex}>
            <FormInput
              label="Time"
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM"
              icon="time-outline"
            />
          </View>
        </View>

        <FormPicker
          label="Frequency"
          options={REMINDER_FREQUENCIES}
          value={frequency}
          onChange={setFrequency}
        />

        <FormInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes..."
          multiline
        />

        <FormButton
          title="Save Reminder"
          onPress={handleSave}
          icon="alarm"
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
    backgroundColor: '#96CEB420',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: '#96CEB4',
  },
  petBannerText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flex: {
    flex: 1,
  },
});

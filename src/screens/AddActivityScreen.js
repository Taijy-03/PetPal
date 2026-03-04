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
  FormDateInput,
  FormButton,
  ChipGroup,
} from '../components/FormElements';
import { LightTheme } from '../theme/theme';
import { generateId, ACTIVITY_TYPES } from '../utils/helpers';

const theme = LightTheme;

export default function AddActivityScreen({ navigation, route }) {
  const { petId } = route.params;
  const { addActivityRecord, pets } = useApp();
  const pet = pets.find((p) => p.id === petId);

  const [type, setType] = useState('walk');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  );
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    const activity = {
      id: generateId(),
      petId,
      type,
      date: `${date}T${time || '00:00'}`,
      duration: duration ? parseInt(duration) : null,
      distance: distance ? parseFloat(distance) : null,
      calories: calories ? parseInt(calories) : null,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await addActivityRecord(activity);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save activity.');
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
            🏃 Log Activity for {pet?.name || 'Pet'}
          </Text>
        </View>

        <Text style={styles.label}>Activity Type</Text>
        <ChipGroup
          options={ACTIVITY_TYPES}
          value={type}
          onChange={setType}
        />
        <View style={{ height: theme.spacing.md }} />

        <View style={styles.row}>
          <View style={styles.flex}>
            <FormDateInput
              label="Date"
              value={date}
              onChange={setDate}
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

        <View style={styles.row}>
          <View style={styles.flex}>
            <FormInput
              label="Duration (min)"
              value={duration}
              onChangeText={setDuration}
              placeholder="30"
              keyboardType="number-pad"
              icon="timer-outline"
            />
          </View>
          <View style={styles.flex}>
            <FormInput
              label="Distance (km)"
              value={distance}
              onChangeText={setDistance}
              placeholder="2.5"
              keyboardType="decimal-pad"
              icon="navigate-outline"
            />
          </View>
        </View>

        <FormInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any notes about this activity..."
          multiline
        />

        <FormButton
          title="Log Activity"
          onPress={handleSave}
          icon="checkmark-circle"
          variant="secondary"
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
    backgroundColor: '#45B7D120',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: '#45B7D1',
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
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flex: {
    flex: 1,
  },
});

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
import { useApp, useTheme } from '../context/AppContext';
import {
  FormInput,
  FormDateInput,
  FormButton,
  ChipGroup,
} from '../components/FormElements';
import { generateId, ACTIVITY_TYPES, getLocalDateString } from '../utils/helpers';

export default function AddActivityScreen({ navigation, route }) {
  const { petId, presetType } = route.params;
  const { addActivityRecord, pets } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const pet = pets.find((p) => p.id === petId);

  const [type, setType] = useState(presetType || 'play');
  const [date, setDate] = useState(getLocalDateString());
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kuala_Lumpur',
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
      Alert.alert('错误', '保存活动失败。');
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
            🐱 为 {pet?.name || '猫咪'} 记录活动
          </Text>
        </View>

        <Text style={styles.label}>活动类型</Text>
        <ChipGroup
          options={ACTIVITY_TYPES}
          value={type}
          onChange={setType}
        />
        <View style={{ height: theme.spacing.md }} />

        <View style={styles.row}>
          <View style={styles.flex}>
            <FormDateInput
              label="日期"
              value={date}
              onChange={setDate}
            />
          </View>
          <View style={styles.flex}>
            <FormInput
              label="时间"
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
              label="时长 (分钟)"
              value={duration}
              onChangeText={setDuration}
              placeholder="30"
              keyboardType="number-pad"
              icon="timer-outline"
            />
          </View>
          <View style={styles.flex}>
            <FormInput
              label="距离 (km)"
              value={distance}
              onChangeText={setDistance}
              placeholder="2.5"
              keyboardType="decimal-pad"
              icon="navigate-outline"
            />
          </View>
        </View>

        <FormInput
          label="备注"
          value={notes}
          onChangeText={setNotes}
          placeholder="关于这次活动的备注..."
          multiline
        />

        <FormButton
          title="保存活动"
          onPress={handleSave}
          icon="checkmark-circle"
          variant="secondary"
        />
        <FormButton
          title="取消"
          onPress={() => navigation.goBack()}
          variant="outline"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  petBanner: {
    backgroundColor: '#E8A0BF20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: '#E8A0BF',
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

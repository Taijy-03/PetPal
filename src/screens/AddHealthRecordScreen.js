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
  FormPicker,
  FormDateInput,
  FormButton,
  ChipGroup,
} from '../components/FormElements';
import { generateId, HEALTH_RECORD_TYPES, getLocalDateString } from '../utils/helpers';

export default function AddHealthRecordScreen({ navigation, route }) {
  const { petId } = route.params;
  const { addHealthRecord, pets } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const pet = pets.find((p) => p.id === petId);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('checkup');
  const [date, setDate] = useState(getLocalDateString());
  const [veterinarian, setVeterinarian] = useState('');
  const [clinic, setClinic] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '请输入记录标题。');
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
      Alert.alert('错误', '保存健康记录失败。');
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
            📋 {pet?.name || '猫咪'} 的健康记录
          </Text>
        </View>

        <Text style={styles.label}>记录类型</Text>
        <ChipGroup
          options={HEALTH_RECORD_TYPES}
          value={type}
          onChange={setType}
        />
        <View style={{ height: theme.spacing.md }} />

        <FormInput
          label="标题"
          value={title}
          onChangeText={setTitle}
          placeholder="如：年度疏苗"
          icon="document-text-outline"
          required
        />

        <FormDateInput
          label="日期"
          value={date}
          onChange={setDate}
          required
        />

        <FormInput
          label="兽医"
          value={veterinarian}
          onChangeText={setVeterinarian}
          placeholder="张医生"
          icon="person-outline"
        />

        <FormInput
          label="诊所"
          value={clinic}
          onChangeText={setClinic}
          placeholder="宠物诊所"
          icon="business-outline"
        />

        <FormInput
          label="费用"
          value={cost}
          onChangeText={setCost}
          placeholder="0.00"
          keyboardType="decimal-pad"
          icon="cash-outline"
        />

        <FormDateInput
          label="下次日期"
          value={nextDueDate}
          onChange={setNextDueDate}
          placeholder="YYYY-MM-DD (可选)"
        />

        <FormInput
          label="备注"
          value={notes}
          onChangeText={setNotes}
          placeholder="其他备注信息..."
          multiline
        />

        <FormButton
          title="保存健康记录"
          onPress={handleSave}
          icon="checkmark-circle"
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

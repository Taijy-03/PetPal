import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp, useTheme } from '../context/AppContext';
import {
  FormInput,
  FormPicker,
  FormDateInput,
  FormButton,
  ChipGroup,
} from '../components/FormElements';
import { generateId } from '../utils/helpers';

const GENDER_OPTIONS = [
  { label: '♂️', value: 'male' },
  { label: '♀️', value: 'female' },
];

const CAT_BREEDS = [
  { label: '布偶猫', value: 'ragdoll' },
  { label: '英国短毛猫', value: 'british_shorthair' },
  { label: '美国短毛猫', value: 'american_shorthair' },
  { label: '波斯猫', value: 'persian' },
  { label: '暇罗猫', value: 'siamese' },
  { label: '缅因猫', value: 'maine_coon' },
  { label: '苏格兰折耳猫', value: 'scottish_fold' },
  { label: '俄罗斯蓝猫', value: 'russian_blue' },
  { label: '孟买猫', value: 'bombay' },
  { label: '孟加拉豹猫', value: 'bengal' },
  { label: '阿比西尼亚猫', value: 'abyssinian' },
  { label: '挥罗猫', value: 'birman' },
  { label: '缅甸猫', value: 'burmese' },
  { label: '加菲猫', value: 'sphynx' },
  { label: '异国短毛猫 (加菲波斯)', value: 'exotic_shorthair' },
  { label: '美国卷毛猫', value: 'american_curl' },
  { label: '南布偶猫', value: 'ragamuffin' },
  { label: '潮英短毛猫', value: 'devon_rex' },
  { label: '柯尼斯卷毛猫', value: 'cornish_rex' },
  { label: '欧洲缅甸猫', value: 'tonkinese' },
  { label: '美国短尾猫', value: 'american_bobtail' },
  { label: '日本短尾猫', value: 'japanese_bobtail' },
  { label: '挨及猫', value: 'egyptian_mau' },
  { label: '荷兰猫 (荷兰卷耳)', value: 'highland_fold' },
  { label: '布偿猫', value: 'chartreux' },
  { label: '挪威森林猫', value: 'norwegian_forest' },
  { label: '西伯利亚猫', value: 'siberian' },
  { label: '土耳其梵猫', value: 'turkish_van' },
  { label: '土耳其安哥拉猫', value: 'turkish_angora' },
  { label: '中华田园猫', value: 'chinese_domestic' },
  { label: '橘猫', value: 'orange_tabby' },
  { label: '三花猫', value: 'calico' },
  { label: '奶牛猫', value: 'tuxedo' },
  { label: '狸花猫', value: 'tabby' },
  { label: '白猫', value: 'white_cat' },
  { label: '黑猫', value: 'black_cat' },
  { label: '混血猫', value: 'mixed' },
  { label: '其他', value: 'other' },
];

export default function AddEditPetScreen({ navigation, route }) {
  const { addPet, updatePet, pets } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const editingPet = route?.params?.pet;
  const isEditing = !!editingPet;

  const [name, setName] = useState(editingPet?.name || '');
  // 编辑时：若保存的 breed 不在列表中，说明是自定义品种，恢复为 'other'
  const savedBreedInList = editingPet?.breed
    ? CAT_BREEDS.find(b => b.value === editingPet.breed)
    : true;
  const [breed, setBreed] = useState(
    editingPet?.breed
      ? (savedBreedInList ? editingPet.breed : 'other')
      : ''
  );
  const [customBreed, setCustomBreed] = useState(
    editingPet?.breed && !savedBreedInList
      ? editingPet.breed          // 之前存的自定义文字
      : editingPet?.customBreed || ''
  );
  const [gender, setGender] = useState(editingPet?.gender || '');
  const [birthDate, setBirthDate] = useState(editingPet?.birthDate || '');
  const [weight, setWeight] = useState(editingPet?.weight?.toString() || '');
  const [weightUnit, setWeightUnit] = useState(editingPet?.weightUnit || 'kg');
  const [color, setColor] = useState(editingPet?.color || '');
  const [hasMicrochip, setHasMicrochip] = useState(!!editingPet?.microchip);
  const [microchip, setMicrochip] = useState(editingPet?.microchip || '');
  const [notes, setNotes] = useState(editingPet?.notes || '');
  const [photo, setPhoto] = useState(editingPet?.photo || null);
  const [photos, setPhotos] = useState(editingPet?.photos || []);
  const [errors, setErrors] = useState({});

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        '需要权限',
        '请允许访问您的相册。'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        '需要权限',
        '请允许使用相机。'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert('添加照片', '请选择方式', [
      { text: '拍照', onPress: takePhoto },
      { text: '从相册选择', onPress: pickImage },
      ...(photo ? [{ text: '删除照片', style: 'destructive', onPress: () => setPhoto(null) }] : []),
      { text: '取消', style: 'cancel' },
    ]);
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = '请输入猫咪名字';
    if (weight && isNaN(parseFloat(weight)))
      newErrors.weight = '请输入有效的体重';
    if (breed === 'other' && !customBreed.trim())
      newErrors.customBreed = '请输入自定义品种名称';
    if (hasMicrochip && !microchip.trim())
      newErrors.microchip = '请输入芯片号或关闭芯片号开关';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const petData = {
      id: editingPet?.id || generateId(),
      name: name.trim(),
      type: 'cat',
      breed: breed === 'other' ? customBreed.trim() : breed.trim(),
      customBreed: breed === 'other' ? customBreed.trim() : '',
      gender,
      birthDate: birthDate || null,
      weight: weight ? parseFloat(weight) : null,
      weightUnit,
      color: color.trim(),
      microchip: hasMicrochip ? microchip.trim() : '',
      notes: notes.trim(),
      photo,
      photos: photos || [],
      createdAt: editingPet?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await updatePet(petData);
      } else {
        await addPet(petData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试。');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Section */}
        <TouchableOpacity
          style={styles.photoSection}
          onPress={showImageOptions}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={styles.petPhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons
                name="camera-outline"
                size={40}
                color={theme.colors.textLight}
              />
              <Text style={styles.photoText}>添加照片</Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={14} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          <FormInput
            label="猫咪名字"
            value={name}
            onChangeText={setName}
            placeholder="给猫咪取个名字吧"
            icon="paw-outline"
            required
            error={errors.name}
          />

          <FormPicker
            label="品种"
            options={CAT_BREEDS}
            value={breed}
            onChange={(val) => {
              setBreed(val);
              if (val !== 'other') setCustomBreed('');
            }}
          />

          {breed === 'other' && (
            <FormInput
              label="自定义品种"
              value={customBreed}
              onChangeText={setCustomBreed}
              placeholder="请输入猫咪品种"
              icon="create-outline"
              required
              error={errors.customBreed}
            />
          )}

          <Text style={styles.label}>性别</Text>
          <ChipGroup
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
          />
          <View style={{ height: theme.spacing.md }} />

          <FormDateInput
            label="出生日期"
            value={birthDate}
            onChange={setBirthDate}
            error={errors.birthDate}
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <FormInput
                label="体重"
                value={weight}
                onChangeText={setWeight}
                placeholder="0.0"
                keyboardType="decimal-pad"
                icon="fitness-outline"
                error={errors.weight}
              />
            </View>
            <View style={styles.unitPicker}>
              <FormPicker
                label="单位"
                options={[
                  { label: 'kg', value: 'kg' },
                  { label: 'lbs', value: 'lbs' },
                ]}
                value={weightUnit}
                onChange={setWeightUnit}
                compact
              />
            </View>
          </View>

          <FormInput
            label="毛色/花纹"
            value={color}
            onChangeText={setColor}
            placeholder="如：橘色, 黑白双色"
            icon="color-palette-outline"
          />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Ionicons name="barcode-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.switchLabel}>有芯片号</Text>
            </View>
            <Switch
              value={hasMicrochip}
              onValueChange={(val) => {
                setHasMicrochip(val);
                if (!val) {
                  setMicrochip('');
                  setErrors(prev => ({ ...prev, microchip: undefined }));
                }
              }}
              trackColor={{ false: theme.colors.border, true: `${theme.colors.primary}60` }}
              thumbColor={hasMicrochip ? theme.colors.primary : theme.colors.textLight}
            />
          </View>

          {hasMicrochip && (
            <FormInput
              label="芯片号"
              value={microchip}
              onChangeText={setMicrochip}
              placeholder="输入芯片号码"
              icon="barcode-outline"
              error={errors.microchip}
            />
          )}

          <FormInput
            label="备注"
            value={notes}
            onChangeText={setNotes}
            placeholder="关于你的猫咪的其他信息..."
            multiline
            icon="document-text-outline"
          />

          <FormButton
            title={isEditing ? '更新猫咪' : '添加猫咪'}
            onPress={handleSave}
            icon={isEditing ? 'checkmark-circle' : 'add-circle'}
          />

          {isEditing && (
            <FormButton
              title="取消"
              onPress={() => navigation.goBack()}
              variant="outline"
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  photoSection: {
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  petPhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  photoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  form: {
    paddingHorizontal: theme.spacing.md,
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
    flex: 2,
  },
  unitPicker: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  switchLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});

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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import {
  FormInput,
  FormPicker,
  FormDateInput,
  FormButton,
  ChipGroup,
} from '../components/FormElements';
import { LightTheme } from '../theme/theme';
import { generateId, PET_TYPES } from '../utils/helpers';

const theme = LightTheme;

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male', icon: '♂️' },
  { label: 'Female', value: 'female', icon: '♀️' },
];

export default function AddEditPetScreen({ navigation, route }) {
  const { addPet, updatePet, pets } = useApp();
  const editingPet = route?.params?.pet;
  const isEditing = !!editingPet;

  const [name, setName] = useState(editingPet?.name || '');
  const [type, setType] = useState(editingPet?.type || 'dog');
  const [breed, setBreed] = useState(editingPet?.breed || '');
  const [gender, setGender] = useState(editingPet?.gender || '');
  const [birthDate, setBirthDate] = useState(editingPet?.birthDate || '');
  const [weight, setWeight] = useState(editingPet?.weight?.toString() || '');
  const [weightUnit, setWeightUnit] = useState(editingPet?.weightUnit || 'kg');
  const [color, setColor] = useState(editingPet?.color || '');
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
        'Permission Required',
        'Please allow access to your photo library.'
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
        'Permission Required',
        'Please allow access to your camera.'
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
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Gallery', onPress: pickImage },
      ...(photo ? [{ text: 'Remove Photo', style: 'destructive', onPress: () => setPhoto(null) }] : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Pet name is required';
    if (!type) newErrors.type = 'Pet type is required';
    if (weight && isNaN(parseFloat(weight)))
      newErrors.weight = 'Invalid weight';
    if (birthDate && isNaN(Date.parse(birthDate)))
      newErrors.birthDate = 'Invalid date format (use YYYY-MM-DD)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const petData = {
      id: editingPet?.id || generateId(),
      name: name.trim(),
      type,
      breed: breed.trim(),
      gender,
      birthDate: birthDate || null,
      weight: weight ? parseFloat(weight) : null,
      weightUnit,
      color: color.trim(),
      microchip: microchip.trim(),
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
      Alert.alert('Error', 'Failed to save pet. Please try again.');
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
              <Text style={styles.photoText}>Add Photo</Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={14} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          <FormInput
            label="Pet Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter pet name"
            icon="paw-outline"
            required
            error={errors.name}
          />

          <Text style={styles.label}>Pet Type *</Text>
          <ChipGroup options={PET_TYPES} value={type} onChange={setType} />
          <View style={{ height: theme.spacing.md }} />

          <FormInput
            label="Breed"
            value={breed}
            onChangeText={setBreed}
            placeholder="e.g. Golden Retriever"
            icon="information-circle-outline"
          />

          <Text style={styles.label}>Gender</Text>
          <ChipGroup
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
          />
          <View style={{ height: theme.spacing.md }} />

          <FormDateInput
            label="Birth Date"
            value={birthDate}
            onChange={setBirthDate}
            placeholder="YYYY-MM-DD"
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <FormInput
                label="Weight"
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
                label="Unit"
                options={[
                  { label: 'kg', value: 'kg' },
                  { label: 'lbs', value: 'lbs' },
                ]}
                value={weightUnit}
                onChange={setWeightUnit}
              />
            </View>
          </View>

          <FormInput
            label="Color / Markings"
            value={color}
            onChangeText={setColor}
            placeholder="e.g. Golden, Black & White"
            icon="color-palette-outline"
          />

          <FormInput
            label="Microchip ID"
            value={microchip}
            onChangeText={setMicrochip}
            placeholder="Enter microchip number"
            icon="barcode-outline"
          />

          <FormInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes about your pet..."
            multiline
            icon="document-text-outline"
          />

          <FormButton
            title={isEditing ? 'Update Pet' : 'Add Pet'}
            onPress={handleSave}
            icon={isEditing ? 'checkmark-circle' : 'add-circle'}
          />

          {isEditing && (
            <FormButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
});

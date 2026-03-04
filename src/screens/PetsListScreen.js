import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import PetCard from '../components/PetCard';
import EmptyState from '../components/EmptyState';
import { LightTheme } from '../theme/theme';

const theme = LightTheme;

export default function PetsListScreen({ navigation }) {
  const { pets, removePet, selectPet } = useApp();

  const handlePetPress = (pet) => {
    selectPet(pet);
    navigation.navigate('PetDetail', { petId: pet.id });
  };

  const handleLongPress = (pet) => {
    Alert.alert(pet.name, 'Choose an action', [
      {
        text: 'Edit',
        onPress: () => navigation.navigate('EditPet', { pet }),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Delete Pet',
            `Are you sure you want to delete ${pet.name}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => removePet(pet.id),
              },
            ]
          );
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          emoji="🐾"
          title="No Pets Yet"
          message="Add your first pet to get started tracking their health and activities."
          actionLabel="Add Pet"
          onAction={() => navigation.navigate('AddPet')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PetCard
            pet={item}
            onPress={() => handlePetPress(item)}
            onLongPress={() => handleLongPress(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPet')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    paddingVertical: theme.spacing.sm,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

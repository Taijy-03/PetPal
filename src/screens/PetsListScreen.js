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
import { useApp, useTheme } from '../context/AppContext';
import PetCard from '../components/PetCard';
import EmptyState from '../components/EmptyState';

export default function PetsListScreen({ navigation }) {
  const { pets, removePet, selectPet } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const handlePetPress = (pet) => {
    selectPet(pet);
    navigation.navigate('PetDetail', { petId: pet.id });
  };

  const handleLongPress = (pet) => {
    Alert.alert(pet.name, '选择操作', [
      {
        text: '编辑',
        onPress: () => navigation.navigate('EditPet', { pet }),
      },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            '删除猫咪',
            `确定要删除 ${pet.name} 吗？`,
            [
              { text: '取消', style: 'cancel' },
              {
                text: '删除',
                style: 'destructive',
                onPress: () => removePet(pet.id),
              },
            ]
          );
        },
      },
      { text: '取消', style: 'cancel' },
    ]);
  };

  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          emoji="🐱"
          title="还没有猫咪"
          message="添加你的第一只猫咪，开始记录它的健康和活动吧~"
          actionLabel="添加猫咪"
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

const createStyles = (theme) => StyleSheet.create({
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

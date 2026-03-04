import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LightTheme } from '../theme/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import PetsListScreen from '../screens/PetsListScreen';
import PetDetailScreen from '../screens/PetDetailScreen';
import AddEditPetScreen from '../screens/AddEditPetScreen';
import AddHealthRecordScreen from '../screens/AddHealthRecordScreen';
import AddActivityScreen from '../screens/AddActivityScreen';
import AddReminderScreen from '../screens/AddReminderScreen';
import RemindersScreen from '../screens/RemindersScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const theme = LightTheme;

const screenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.primary,
  },
  headerTintColor: '#FFF',
  headerTitleStyle: {
    fontWeight: '600',
  },
  headerShadowVisible: false,
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: '🐾 PetPal' }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={({ route }) => ({ title: 'Pet Details' })}
      />
      <Stack.Screen
        name="AddPet"
        component={AddEditPetScreen}
        options={{ title: 'Add New Pet' }}
      />
      <Stack.Screen
        name="EditPet"
        component={AddEditPetScreen}
        options={{ title: 'Edit Pet' }}
      />
      <Stack.Screen
        name="AddHealthRecord"
        component={AddHealthRecordScreen}
        options={{ title: 'Add Health Record' }}
      />
      <Stack.Screen
        name="AddActivity"
        component={AddActivityScreen}
        options={{ title: 'Log Activity' }}
      />
      <Stack.Screen
        name="AddReminder"
        component={AddReminderScreen}
        options={{ title: 'Add Reminder' }}
      />
    </Stack.Navigator>
  );
}

function PetsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="PetsList"
        component={PetsListScreen}
        options={{ title: 'My Pets' }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={{ title: 'Pet Details' }}
      />
      <Stack.Screen
        name="AddPet"
        component={AddEditPetScreen}
        options={{ title: 'Add New Pet' }}
      />
      <Stack.Screen
        name="EditPet"
        component={AddEditPetScreen}
        options={{ title: 'Edit Pet' }}
      />
      <Stack.Screen
        name="AddHealthRecord"
        component={AddHealthRecordScreen}
        options={{ title: 'Add Health Record' }}
      />
      <Stack.Screen
        name="AddActivity"
        component={AddActivityScreen}
        options={{ title: 'Log Activity' }}
      />
      <Stack.Screen
        name="AddReminder"
        component={AddReminderScreen}
        options={{ title: 'Add Reminder' }}
      />
    </Stack.Navigator>
  );
}

function RemindersStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="RemindersList"
        component={RemindersScreen}
        options={{ title: 'Reminders' }}
      />
      <Stack.Screen
        name="AddReminder"
        component={AddReminderScreen}
        options={{ title: 'Add Reminder' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'HomeTab':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'PetsTab':
                iconName = focused ? 'paw' : 'paw-outline';
                break;
              case 'RemindersTab':
                iconName = focused ? 'alarm' : 'alarm-outline';
                break;
              case 'SettingsTab':
                iconName = focused ? 'settings' : 'settings-outline';
                break;
              default:
                iconName = 'ellipse';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: theme.colors.tabBar,
            borderTopColor: theme.colors.border,
            paddingBottom: 6,
            paddingTop: 6,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{ title: 'Home' }}
        />
        <Tab.Screen
          name="PetsTab"
          component={PetsStack}
          options={{ title: 'Pets' }}
        />
        <Tab.Screen
          name="RemindersTab"
          component={RemindersStack}
          options={{ title: 'Reminders' }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStack}
          options={{ title: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

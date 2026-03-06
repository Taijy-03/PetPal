import React from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/AppContext';

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
import HealthRecordDetailScreen from '../screens/HealthRecordDetailScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import AllActivitiesScreen from '../screens/AllActivitiesScreen';
import AllHealthRecordsScreen from '../screens/AllHealthRecordsScreen';
import PhotoViewScreen from '../screens/PhotoViewScreen';
import ReminderDetailScreen from '../screens/ReminderDetailScreen';
import CatFamilyBookScreen from '../screens/CatFamilyBookScreen';
import DeceasedCatsScreen from '../screens/DeceasedCatsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const getScreenOptions = (theme) => ({
  headerStyle: {
    backgroundColor: theme.colors.headerBackground,
  },
  headerTintColor: theme.colors.headerText,
  headerTitleStyle: {
    fontWeight: '600',
  },
  headerShadowVisible: false,
});

function HomeStack() {
  const theme = useTheme();
  const screenOptions = getScreenOptions(theme);
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: '🐱 喵记' }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={({ route }) => ({ title: '猫咪详情' })}
      />
      <Stack.Screen
        name="AddPet"
        component={AddEditPetScreen}
        options={{ title: '添加猫咪' }}
      />
      <Stack.Screen
        name="EditPet"
        component={AddEditPetScreen}
        options={{ title: '编辑猫咪' }}
      />
      <Stack.Screen
        name="AddHealthRecord"
        component={AddHealthRecordScreen}
        options={{ title: '添加健康记录' }}
      />
      <Stack.Screen
        name="AddActivity"
        component={AddActivityScreen}
        options={{ title: '记录活动' }}
      />
      <Stack.Screen
        name="AddReminder"
        component={AddReminderScreen}
        options={{ title: '添加提醒' }}
      />
      <Stack.Screen
        name="ReminderDetail"
        component={ReminderDetailScreen}
        options={{ title: '提醒详情' }}
      />
      <Stack.Screen
        name="HealthRecordDetail"
        component={HealthRecordDetailScreen}
        options={{ title: '健康记录详情' }}
      />
      <Stack.Screen
        name="AllActivities"
        component={AllActivitiesScreen}
        options={{ title: '全部活动' }}
      />
      <Stack.Screen
        name="AllHealthRecords"
        component={AllHealthRecordsScreen}
        options={{ title: '健康记录' }}
      />
      <Stack.Screen
        name="ActivityDetail"
        component={ActivityDetailScreen}
        options={{ title: '活动详情' }}
      />
      <Stack.Screen
        name="PhotoView"
        component={PhotoViewScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function PetsStack() {
  const theme = useTheme();
  const screenOptions = getScreenOptions(theme);
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="PetsList"
        component={PetsListScreen}
        options={{ title: '我的猫咪' }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={{ title: '猫咪详情' }}
      />
      <Stack.Screen
        name="AddPet"
        component={AddEditPetScreen}
        options={{ title: '添加猫咪' }}
      />
      <Stack.Screen
        name="EditPet"
        component={AddEditPetScreen}
        options={{ title: '编辑猫咪' }}
      />
      <Stack.Screen
        name="AddHealthRecord"
        component={AddHealthRecordScreen}
        options={{ title: '添加健康记录' }}
      />
      <Stack.Screen
        name="AddActivity"
        component={AddActivityScreen}
        options={{ title: '记录活动' }}
      />
      <Stack.Screen
        name="AddReminder"
        component={AddReminderScreen}
        options={{ title: '添加提醒' }}
      />
      <Stack.Screen
        name="ReminderDetail"
        component={ReminderDetailScreen}
        options={{ title: '提醒详情' }}
      />
      <Stack.Screen
        name="HealthRecordDetail"
        component={HealthRecordDetailScreen}
        options={{ title: '健康记录详情' }}
      />
      <Stack.Screen
        name="ActivityDetail"
        component={ActivityDetailScreen}
        options={{ title: '活动详情' }}
      />
      <Stack.Screen
        name="AllHealthRecords"
        component={AllHealthRecordsScreen}
        options={{ title: '健康记录' }}
      />
      <Stack.Screen
        name="PhotoView"
        component={PhotoViewScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function RemindersStack() {
  const theme = useTheme();
  const screenOptions = getScreenOptions(theme);
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="RemindersList"
        component={RemindersScreen}
        options={{ title: '提醒' }}
      />
      <Stack.Screen
        name="AddReminder"
        component={AddReminderScreen}
        options={{ title: '添加提醒' }}
      />
      <Stack.Screen
        name="ReminderDetail"
        component={ReminderDetailScreen}
        options={{ title: '提醒详情' }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={{ title: '猫咪详情' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  const theme = useTheme();
  const screenOptions = getScreenOptions(theme);
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: '设置' }}
      />
      <Stack.Screen
        name="CatFamilyBook"
        component={CatFamilyBookScreen}
        options={{ title: '🌳 猫咪家庭树' }}
      />
      <Stack.Screen
        name="DeceasedCats"
        component={DeceasedCatsScreen}
        options={{ title: '🌙 喵星纪念册' }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={{ title: '猫咪详情' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const tabBarHeight = 60 + insets.bottom;

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
            paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
            paddingTop: 6,
            height: tabBarHeight,
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
          options={{ title: '首页' }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'HomeTab', state: { routes: [{ name: 'HomeMain' }] } }],
                })
              );
            },
          })}
        />
        <Tab.Screen
          name="PetsTab"
          component={PetsStack}
          options={{ title: '猫咪' }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'PetsTab', state: { routes: [{ name: 'PetsList' }] } }],
                })
              );
            },
          })}
        />
        <Tab.Screen
          name="RemindersTab"
          component={RemindersStack}
          options={{ title: '提醒' }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'RemindersTab', state: { routes: [{ name: 'RemindersList' }] } }],
                })
              );
            },
          })}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStack}
          options={{ title: '设置' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen';
import ToolsScreen from '../screens/ToolsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MergePDFScreen from '../screens/tools/MergePDFScreen';
import SplitPDFScreen from '../screens/tools/SplitPDFScreen';
import CompressPDFScreen from '../screens/tools/CompressPDFScreen';

export type RootStackParamList = {
  Main: undefined;
  MergePDF: undefined;
  SplitPDF: undefined;
  CompressPDF: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tools: undefined;
  History: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tools':
              iconName = focused ? 'construct' : 'construct-outline';
              break;
            case 'History':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#e74c3c',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'PDF Tools' }}
      />
      <Tab.Screen 
        name="Tools" 
        component={ToolsScreen}
        options={{ title: 'Tools' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  if (!user) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen 
        name="MergePDF" 
        component={MergePDFScreen}
        options={{
          headerShown: true,
          title: 'Merge PDFs',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="SplitPDF" 
        component={SplitPDFScreen}
        options={{
          headerShown: true,
          title: 'Split PDF',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="CompressPDF" 
        component={CompressPDFScreen}
        options={{
          headerShown: true,
          title: 'Compress PDF',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}
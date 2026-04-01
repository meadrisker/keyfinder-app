import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuthStore } from '../hooks/useAuthStore';
import OnboardingScreen from '../screens/OnboardingScreen';
import KeysScreen       from '../screens/KeysScreen';
import AddKeyScreen     from '../screens/AddKeyScreen';
import CameraScreen     from '../screens/CameraScreen';
import IdentifyScreen   from '../screens/IdentifyScreen';
import SettingsScreen   from '../screens/SettingsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function KeysStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#0f6e56' }}>
      <Stack.Screen name="KeysList" component={KeysScreen} options={{ title: 'My Keys' }} />
      <Stack.Screen name="AddKey" component={AddKeyScreen} options={{ title: 'Add Key', presentation: 'modal' }} />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false, presentation: 'fullScreenModal' }} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor:   '#0f6e56',
        tabBarInactiveTintColor: '#999',
        tabBarStyle:             { backgroundColor: '#fff', borderTopColor: '#e8e8e0' },
        headerStyle:             { backgroundColor: '#fff' },
        headerTintColor:         '#0f6e56',
      }}
    >
      <Tab.Screen name="Keys"     component={KeysStack}     options={{ headerShown: false, tabBarLabel: 'Keys' }} />
      <Tab.Screen name="Identify" component={IdentifyScreen} options={{ title: 'Identify' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { token, isHydrated, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, []);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f0' }}>
        <ActivityIndicator size="large" color="#0f6e56" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <AppTabs /> : <OnboardingScreen />}
    </NavigationContainer>
  );
}

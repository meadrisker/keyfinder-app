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

const Tab        = createBottomTabNavigator();
const RootStack  = createStackNavigator();
const KeysStack  = createStackNavigator();

function KeysNavigator() {
  return (
    <KeysStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#0f6e56' }}>
      <KeysStack.Screen name="KeysList" component={KeysScreen} options={{ title: 'My Keys' }} />
      <KeysStack.Screen name="AddKey"   component={AddKeyScreen} options={{ title: 'Add Key', presentation: 'modal' }} />
    </KeysStack.Navigator>
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
      <Tab.Screen name="Keys"     component={KeysNavigator}  options={{ headerShown: false, tabBarLabel: 'Keys' }} />
      <Tab.Screen name="Identify" component={IdentifyScreen} options={{ title: 'Identify' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

function AppRoot() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs"   component={AppTabs} />
      <RootStack.Screen name="Camera" component={CameraScreen} options={{ presentation: 'fullScreenModal' }} />
    </RootStack.Navigator>
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
      {token ? <AppRoot /> : <OnboardingScreen />}
    </NavigationContainer>
  );
}

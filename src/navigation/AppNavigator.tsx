import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WalletInputScreen } from '../screens/WalletInputScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { PositionDetailScreen } from '../screens/PositionDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAddressesStore } from '../store/addressesStore';
import { usePositionsStore } from '../store/positionsStore';

export type TrackStackParams = {
  WalletInput: undefined;
  Dashboard: undefined;
  PositionDetail: { positionKey: string };
};

export type RootTabParams = {
  Track: undefined;
  Settings: undefined;
};

// Native stack uses native headers that can break on web (e.g. HeaderTitle font). Use JS stack on web.
const NativeStack = createNativeStackNavigator<TrackStackParams>();
const WebStack = createStackNavigator<TrackStackParams>();
const Stack = Platform.OS === 'web' ? WebStack : NativeStack;
const Tab = createBottomTabNavigator<RootTabParams>();

const sharedStackScreenOptions = {
  headerStyle: { backgroundColor: '#0f0f14' },
  headerTintColor: '#fff',
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#0f0f14' },
  cardStyle: { backgroundColor: '#0f0f14' },
  headerTitleStyle: { fontWeight: 'bold' as const },
};

function TrackStack() {
  const activeAddress = useAddressesStore((s) => s.activeAddress);
  const initialRoute = activeAddress ? 'Dashboard' : 'WalletInput';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={sharedStackScreenOptions}
    >
      <Stack.Screen
        name="WalletInput"
        component={WalletInputScreen}
        options={{ title: 'Add wallet' }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Positions' }}
      />
      <Stack.Screen
        name="PositionDetail"
        component={PositionDetailWrapper}
        options={{ title: 'Position' }}
      />
    </Stack.Navigator>
  );
}

function PositionDetailWrapper({
  route,
}: {
  route: { params?: { positionKey: string } };
}) {
  const positionKey = route.params?.positionKey;
  const positions = usePositionsStore((s) => s.positions);
  const position = positionKey
    ? positions.find((p) => p.publicKey === positionKey) ?? null
    : null;
  return <PositionDetailScreen position={position} />;
}

export function AppNavigator() {
  const hydrated = useAddressesStore((s) => s.hydrated);
  const hydrate = useAddressesStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#9945FF" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1a1a22', borderTopColor: '#2a2a35' },
        tabBarActiveTintColor: '#9945FF',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen name="Track" component={TrackStack} options={{ title: 'Positions' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0f0f14',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
});

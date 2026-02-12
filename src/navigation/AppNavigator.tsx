import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator<TrackStackParams>();
const Tab = createBottomTabNavigator<RootTabParams>();

function TrackStack() {
  const activeAddress = useAddressesStore((s) => s.activeAddress);
  const initialRoute = activeAddress ? 'Dashboard' : 'WalletInput';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: { backgroundColor: '#0f0f14' },
        headerTintColor: '#fff',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#0f0f14' },
      }}
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
    return null;
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

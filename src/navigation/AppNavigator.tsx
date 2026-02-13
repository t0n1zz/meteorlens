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
import { useTheme } from '../hooks/useTheme';

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

function getStackScreenOptions(isDark: boolean) {
  const bg = isDark ? '#0f0f14' : '#f4f4f5';
  const tint = isDark ? '#fff' : '#18181b';
  return {
    headerStyle: { backgroundColor: bg },
    headerTintColor: tint,
    headerShadowVisible: false,
    contentStyle: { backgroundColor: bg },
    cardStyle: { backgroundColor: bg },
    headerTitleStyle: { fontWeight: 'bold' as const },
  };
}

function TrackStack() {
  const activeAddress = useAddressesStore((s) => s.activeAddress);
  const initialRoute = activeAddress ? 'Dashboard' : 'WalletInput';
  const theme = useTheme();
  const stackOptions = getStackScreenOptions(theme.dark);

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={stackOptions}
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
  const theme = useTheme();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading…</Text>
      </View>
    );
  }

  const tabBarBg = theme.screen.card;
  const tabBarBorder = theme.screen.cardBorder;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: tabBarBg, borderTopColor: tabBarBorder },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.screen.textMuted,
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
});

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import HomeScreen from '../screens/HomeScreen';
import MarketScreen from '../screens/MarketScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProductScreen from '../screens/ProductScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Market') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Product') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#d81e06', // Tonghuashun red-ish
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('common.home') }} />
      <Tab.Screen name="Market" component={MarketScreen} options={{ title: t('common.market') }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ title: t('common.community') }} />
      <Tab.Screen name="Product" component={ProductScreen} options={{ title: t('common.product') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('common.profile') }} />
    </Tab.Navigator>
  );
};

export default AppNavigator;

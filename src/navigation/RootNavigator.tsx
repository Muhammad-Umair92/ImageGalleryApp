import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import RegisterScreen from '../screens/Register/RegisterScreen';
import GalleryScreen from '../screens/Gallery/GalleryScreen';
import DetailsScreen from '../screens/Details/DetailsScreen';

// createNativeStackNavigator is generic — we pass RootStackParamList so
// every navigator method (navigate, push, goBack) becomes fully type-safe.
// TypeScript will error if you try to navigate with wrong params.
const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    // screenOptions applied globally to all screens in this navigator
    <Stack.Navigator
      initialRouteName="Register"
      screenOptions={{
        headerShown: false, // We'll build custom headers later
      }}>
      {/*
       * Each Stack.Screen maps a route name to a component.
       * The name MUST match a key in RootStackParamList exactly.
       * TypeScript will error if there's a mismatch.
       */}
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;

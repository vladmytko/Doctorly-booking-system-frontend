import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import Appointments from '../../screens/Apppointments/Appointments';
import Settings from '../../screens/Settings/Settings';
import Profile from '../../screens/Profile/Profile';

import FilledHome from '../../assets/img/home-filled.png';
import HomeEmpty from '../../assets/img/home-empty.png';
import AppointmentEmpty from '../../assets/img/appointment-empty.png';
import AppointmentFilled from '../../assets/img/appointment-filled.png';
import SettingsEmpty from '../../assets/img/settings.png';
import SettingsFilled from '../../assets/img/setting-filled.png';
import ProfileEmpty from '../../assets/img/ProfileEmpty.png';
import ProfileFilled from '../../assets/img/ProfileFilled.png';

const ICONS = {
  homeScreen: { active: FilledHome, inactive: HomeEmpty },
  viewAllAppointments: { active: AppointmentFilled, inactive: AppointmentEmpty },
  settingScreen: { active: SettingsFilled, inactive: SettingsEmpty },
  userScreen: { active: ProfileFilled, inactive: ProfileEmpty },
};

const TabIcon = ({ routeName, focused }) => {
  const pair = ICONS[routeName];
  if (!pair) return null;
  return (
    <Image
      style={{ height: 32, width: 32 }}
      source={focused ? pair.active : pair.inactive}
    />
  );
};

const Tab = createBottomTabNavigator();
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="homeScreen"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon routeName={route.name} focused={focused} />
        ),
        tabBarLabel: () => null,
        headerStyle: { backgroundColor: '#0B3DA9' },
        headerTintColor: 'white',
        headerTitleStyle: {},
        headerBackTitleVisible: false,
        tabBarStyle: { alignItems: 'center', justifyContent: 'center' },
        tabBarIconStyle: { marginTop: 5 },
      })}>
      <Tab.Screen
        name="homeScreen"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen name='viewAllAppointments' component={Appointments} options={{headerShown: false}}/>
      <Tab.Screen name='settingScreen' component={Settings} options={{headerShown: false}}/>
      <Tab.Screen name='userScreen' component={Profile} options={{headerShown: false}}/>
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({});

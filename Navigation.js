import { StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native';

import Onboarding from './src/screens/Onboarding/Onboarding';
import LoginScreen2 from './src/screens/LoginScreen/LoginScreen2';
import OtpVerification from './src/screens/OtpVerification/OtpVerification';
import SearchScreen from './src/screens/SearchScreen/SearchScreen';
import DoctorList from './src/components/DoctorList/DoctorList';
import DoctorDetails from './src/screens/DoctorDetails/DoctorDetails';
import BookAppointment from './src/screens/BookAppointment/BookAppointment';
import BottomTabNavigator from './src/components/BottomTabNavigator/BottomTabNavigator';
import ViewAppointment from './src/screens/ViewAppointment/ViewAppointment';
import AudioCall from './src/screens/AudioCall/AudioCall';
import UnknownRoleScreen from './src/screens/UnknowRole/UnknowRole.js';
import BottomTabNavigationDoctor from './src/components/BottomTabNavigator/BottomTabNavigationDoctor.js';
import RegisterPatient from './src/screens/RegisterPatient/RegisterPatient.js';

import { getToken, authEvents } from './src/api/auth/authStorage.js'; //  helper 
import { COLORS } from './src/styles/color';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Stack = createNativeStackNavigator();

const Navigation = () => {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [role, setRole] = useState(null);

  /**
   * Runs once on app start
   * Checks if the user is already logged in (be verifying a saved token)
   * Loads the currentUser from AsyncStorage and sets their role
   * Setd loading to false when initialization is complete - letting the 
   * app decide which stack to show */ 
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      // converting token to boolean to ensure state is strictly true/false
      setHasToken(!!token);
      const userSrt = await AsyncStorage.getItem('currentUser');
      console.log('Current User String:', userSrt); // Debug log
      const user = userSrt ? JSON.parse(userSrt) : null;
      setRole(user?.role ?? null);
      setLoading(false);
    };
    checkAuth();
  }, []);


  /**
   * Listens for login/logout events to update the auth state and user role.
   * This ensures the navigation stack updates correctly when the user logs in or out.
   * Returns an unsubscribe function to clean up the listener on unmount.
   * Note: This effect depends on no variables, so it runs only once on mount.
   */
    useEffect(() => {
    // subscribe means we are listening for any auth events (login/logout)
    // and when such an event occurs, we run the provided async function
    const unsubscribe = authEvents.subscribe(async () => {
      const token = await getToken();
      setHasToken(!!token);
      const userSrt = await AsyncStorage.getItem('currentUser');
      const user = userSrt ? JSON.parse(userSrt) : null;
      setRole(user?.role ?? null);
    });
    return unsubscribe;
  }, []);


  if (loading) {
    return null; // could return a splash screen here
  }

  const isDoctor = role === 'DOCTOR';
  const isPatient = role === 'PATIENT' || role === 'USER';

  return (
    <NavigationContainer>
      {/* <Stack.Navigator screenOptions={{ headerShown: false }}> */}
        <Stack.Navigator
        // key={hasToken ? 'auth' : 'unauth'}
        key={`${hasToken ? 'auth' : 'unauth'}-${role ?? 'norole'}`}
        screenOptions={{ headerBackTitle: "Back",
                      headerTitle: "",
                      headerStyle: {backgroundColor: COLORS.PRIMARY},
                      headerTintColor: COLORS.SECONDARY
         }}
        initialRouteName={
          hasToken
            ? (isDoctor
                ? 'bottomTabNavigationDoctor'
                : (isPatient ? 'tabNavigator' : 'onboarding'))
            : 'onboarding'
        }
      >
        {hasToken ? (
          isDoctor ? (
            <>
              <Stack.Screen name="bottomTabNavigationDoctor" component={BottomTabNavigationDoctor} options={{ headerShown: false }} />
              {/* Doctor-only routes can be added here */}
              <Stack.Screen name="searchScreen" component={SearchScreen} />
              <Stack.Screen name="doctorsList" component={DoctorList} />
              <Stack.Screen name="doctorDetails" component={DoctorDetails} options={{ headerTitle: '', headerBackTitle: 'Back' }} />
              <Stack.Screen name="audioCallScreen" component={AudioCall} />
            </>
          ) : isPatient ? (
            <>
              <Stack.Screen name="tabNavigator" component={BottomTabNavigator} options={{ headerShown: false }} />
              <Stack.Screen name="searchScreen" component={SearchScreen} />
              <Stack.Screen name="doctorsList" component={DoctorList} />
              <Stack.Screen name='doctorDetails' component={DoctorDetails} options={{ headerTitle: '', headerBackTitle: 'Back' }} />
              <Stack.Screen name="bookAppointment" component={BookAppointment} options={{ headerTitle: 'Appointment', headerBackTitle: 'Back' }} />
              <Stack.Screen name="viewAppointment" component={ViewAppointment} />
              <Stack.Screen name="audioCallScreen" component={AudioCall} />
              <Stack.Screen name="viewAllAppointments" component={AudioCall} />
            </>
          ) : (
            // Fallback for authenticated users with an unknown role
            <>
              <Stack.Screen name="unknowRole" component={UnknownRoleScreen} options={{ headerShown: false }} />
            </>
          )
        ) : (
          // 🔹 Unauthenticated stack
          <>
            <Stack.Screen name="onboarding" component={Onboarding} options={{ headerShown: false }} />
            <Stack.Screen name="loginScreen2" component={LoginScreen2} options={{ headerShown: false }} />
            <Stack.Screen name="OtpVerify" component={OtpVerification} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterPatient} options={{ headerShown: false }} /> 
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Navigation

const styles = StyleSheet.create({})
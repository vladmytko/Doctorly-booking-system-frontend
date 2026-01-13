// ===========================
// React & React Native Imports
// ===========================
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';

// ===========================
// External Libraries
// ===========================
import { useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===========================
// Internal Modules
// ===========================
import { loginWithCredentials } from '../../api/auth/authService';
import { COLORS } from '../../styles/color'; // adjust if you have different path/colors
import { authEvents, saveToken } from '../../api/auth/authStorage';
import { useAppContext } from '../../context/AppProvider';

// ===========================
// Component: LoginScreen2
// ===========================
const LoginScreen2 = ({ navigation, route }) => {
  // ---------------------------
  // State Management
  // ---------------------------
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { setCurrentUser } = useAppContext();

  // Only allow submission when email is filled and password length is at least 6
  const canSubmit = useMemo(() => email.trim().length > 0 && password.length >= 8, [email, password]);

  // ---------------------------
  // Login Mutation Logic
  // ---------------------------
  const mutation = useMutation({
    mutationFn: ({ email, password }) => loginWithCredentials(email, password),

    // When login is successful
    onSuccess: async (data) => {
      try {
        // Expecting { token, user } from backend
        const token = data?.token;
        const user = data?.user;

        // Save the token if provided
        if (token) {
          await saveToken(token);
        } else {
          console.log('[Login] No token in response');
        }

        // Store the user info locally for later use (e.g., role-based navigation)
        if (user) {
          await AsyncStorage.setItem('currentUser', JSON.stringify(user));
          console.log('[Login] user:', user);

          setCurrentUser(user);
        } else {
          console.log('[Login] No user object in response');
        }

        // Notify the app to refresh or swap stacks
        authEvents.emit('loginScreen');
        console.log('Login successful. Switching to auth stack via authEvents...');
      } catch (e) {
        console.log('[Login] onSuccess handler error:', e?.message || e);
      }
    },

    // Handle API or network errors
    onError: (err) => {
      const status = err?.response?.status;
      const dataMsg = err?.response?.data?.message || err?.response?.data?.error;
      const url = (err?.config?.baseURL || '') + (err?.config?.url || '');
      const msg = dataMsg || err?.message || 'Login failed';

      if (__DEV__) {
        console.log('[Login] Error status:', status);
        console.log('[Login] URL:', url);
        console.log('[Login] Message:', msg);
      }

      if (status === 401) {
        Alert.alert('Invalid credentials', 'Please check your email and password.');
      } else if (msg?.toLowerCase?.().includes('network')) {
        Alert.alert('Network error', 'Cannot reach the server. Check the baseURL, emulator/device IP, and that the backend is running.');
      } else {
        Alert.alert('Login error', msg);
      }
    },
  });

  const loading = mutation.isPending || mutation.isLoading;

  // ---------------------------
  // Submit Handler
  // ---------------------------
  const onSubmit = () => {
    if (!canSubmit) return;
    mutation.mutate({ email: email.trim(), password });
  };

  // ---------------------------
  // UI Layout
  // ---------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

      {/* Email Field */}
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="username"
          style={styles.input}
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      {/* Password Field */}
      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          textContentType="password"
          style={styles.input}
          onSubmitEditing={onSubmit}
          returnKeyType="go"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={onSubmit}
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        disabled={!canSubmit || loading}
      >
        {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Log in</Text>}
      </TouchableOpacity>

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkBtn}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Footer Links */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>New here?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}> Create an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen2;

// ===========================
// Styles
// ===========================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  field: { marginBottom: 14 },
  label: { fontSize: 14, marginBottom: 6, color: '#333' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CED3DF',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS?.PRIMARY || '#4F46E5',
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  linkBtn: { alignSelf: 'center', marginTop: 14 },
  link: { color: COLORS?.PRIMARY || '#4F46E5', fontWeight: '600' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  footerText: { color: '#444' },

  google_button: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
});
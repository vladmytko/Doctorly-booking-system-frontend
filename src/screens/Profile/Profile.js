import { Button, StyleSheet, View } from 'react-native';
import React from 'react';
import { clearToken } from '../../api/auth/authStorage';

const Profile = () => {
  const HandleLogout = async () => {
    try {
      // eslint-disable-next-line no-console
      console.warn('[Profile] Logout pressed -> clearToken');
      await clearToken();
      // Navigation will switch stacks via authEvents listener in Navigation.js
    } catch (e) {
      console.error('Error during logout', e);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Button title="Logout" onPress={HandleLogout} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
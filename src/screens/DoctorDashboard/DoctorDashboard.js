import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'
import Header from '../../components/Header/Header'

const DoctorDashboard = ({route}) => {

  const {navigate} = useNavigation();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true; // guard against setting state on unmounted component
    
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem('currentUser');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user?.role === 'DOCTOR') {
          if (isActive) setDoctor(user);
        } else if (user) {
          // logged in but not a doctor
          if (isActive) setError('Logged in user is not a DOCTOR');
        } else {
          if (isActive) setError('No user found in storage');
        }
      } catch (e) {
        if (isActive) setError('Failed to load user from storage');
        console.log('[DoctorDashboard] load error:', e?.message || e);
      } finally {
        if (isActive) setLoading(false);
      }
    })();
    return () => { isActive = false; };
  }, []);

  return (
    <View style={styles.container}>
      {loading ? ( // if loading is true
        <ActivityIndicator /> // show loading spinner
      ) : error ? ( // if error is set
        <Text style={styles.errorText}>{error}</Text> // show error message
      ) : doctor ? ( // if doctor data is available, show the doctor dashboard content
        <>
          <Header />
          <View style={styles.card}>
          <Text style={styles.title}>Doctor Dashboard</Text>
          <View style={styles.row}><Text style={styles.label}>Name: </Text><Text style={styles.value}>{doctor.name || '—'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Email: </Text><Text style={styles.value}>{doctor.email || '—'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Phone: </Text><Text style={styles.value}>{doctor.phone || '—'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Role: </Text><Text style={styles.value}>{doctor.role}</Text></View>
          {/* Add any doctor-specific quick actions here, using navigate(...) */}
        </View>
        </>
      ) : (
        <Text>No doctor data available.</Text>
      )}
    </View>
  );
}

export default DoctorDashboard

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  label: { fontWeight: '600', color: '#374151' },
  value: { color: '#111827' },
  errorText: { color: '#DC2626' },
});
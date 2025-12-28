import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { COLORS } from '../../styles/color';
import Button from '../../components/Button/Button';
import { createAppointment } from '../../api/appointment';

const BookAppointment = ({ route }) => {
  const { doctorId } = route?.params || {};

  const [isPatientDetail, setIsPatientDetail] = useState(false);
  const [formError, setFormError] = useState('');
  const [details, setDetails] = useState({
    patient: {
      name: '',
      phoneNumber: '',
      email: '',
      gender: '',
      healthIssue: '',
      age: '',
    },
    slot: { date: '', time: '' },
  });

  // Prefill from AsyncStorage currentUser if present (no Redux needed)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('currentUser');
        if (!raw) return;
        const u = JSON.parse(raw);
        setDetails(prev => ({
          ...prev,
          patient: {
            ...prev.patient,
            name: prev.patient.name || u?.name || '',
            phoneNumber: prev.patient.phoneNumber || u?.phone || '',
            email: prev.patient.email || u?.email || '',
          },
        }));
      } catch (e) {
        console.log('[BookAppointment] read currentUser error:', e?.message || e);
      }
    })();
  }, []);

  const onChangePatient = (key, value) => {
    if (formError) setFormError('');
    let v = value;
    if (key === 'phoneNumber') v = String(value || '').replace(/\D/g, '').slice(0, 15);
    setDetails(prev => ({
      ...prev,
      patient: { ...prev.patient, [key]: v },
    }));
  };

  const onChangeHandler = (key, value) => {
    setDetails(prev => ({
      ...prev,
      slot: { ...prev.slot, [key]: value },
    }));
  };

  const toIso = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    const dt = new Date(y, (m || 1) - 1, d, hh || 0, mm || 0, 0, 0);
    const pad = n => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:00`;
  };

  const addMinutesIso = (iso, minutes) => {
    if (!iso) return null;
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() + (minutes || 0));
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  };

  const requireValidStep1 = () => {
    const p = details.patient || {};
    const nameOk = (p.name || '').trim().length >= 2;
    const ageOk = /^\d{1,3}$/.test(p.age || '') && Number(p.age) >= 1 && Number(p.age) <= 120;
    const phoneOk = (p.phoneNumber || '').replace(/\D/g, '').length >= 10;
    const emailOk = !p.email || /\S+@\S+\.\S+/.test(p.email);
    if (!nameOk) return 'Please enter a valid name (min 2 characters).';
    if (!ageOk) return 'Please enter a valid age (1–120).';
    if (!phoneOk) return 'Please enter a valid contact number (10+ digits).';
    if (!emailOk) return 'Please enter a valid email or leave it empty.';
    return '';
  };

  const handleNextOrBook = async (bookNow = false) => {
    if (!isPatientDetail) {
      const err = requireValidStep1();
      if (err) return setFormError(err);
      setIsPatientDetail(true);
      return;
    }

    if (!bookNow) return; // wait for the footer button in slot component

    try {
      // derive userId primarily from JWT sub
      const token = await AsyncStorage.getItem('accessToken');
      let userId = null;
      if (token) {
        const payload = jwtDecode(token);
        userId = payload?.sub || payload?.userId || payload?.id || null;
      }
      if (!userId) throw new Error('User not detected (no id in token)');
      if (!doctorId) throw new Error('Doctor not selected');

      const startTime = toIso(details.slot.date, details.slot.time);
      const endTime = addMinutesIso(startTime, 30);
      if (!startTime || !endTime) throw new Error('Please select a date and time');

      const payload = { startTime, endTime, userId, doctorId };
      const res = await createAppointment(payload);
      Alert.alert('Booked', 'Your appointment has been created.');
      console.log('[Appointment created]', res);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Booking failed';
      Alert.alert('Error', msg);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }} contentContainerStyle={{ padding: 12 }}>
      {!isPatientDetail ? (
        <View>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={details.patient.name}
            onChangeText={(t) => onChangePatient('name', t)}
          />

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            placeholder="07xxxxxxxxx"
            keyboardType="phone-pad"
            value={details.patient.phoneNumber}
            onChangeText={(t) => onChangePatient('phoneNumber', t)}
            maxLength={15}
          />

          <Text style={styles.label}>Email (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            keyboardType="email-address"
            value={details.patient.email}
            onChangeText={(t) => onChangePatient('email', t)}
          />

          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            placeholder="Male / Female / Other"
            value={details.patient.gender}
            onChangeText={(t) => onChangePatient('gender', t)}
          />

          <Text style={styles.label}>Health Issue</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe briefly"
            value={details.patient.healthIssue}
            onChangeText={(t) => onChangePatient('healthIssue', t)}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="25"
            keyboardType="numeric"
            value={details.patient.age}
            onChangeText={(t) => onChangePatient('age', t)}
            maxLength={3}
          />

          {!!formError && <Text style={styles.error}>{formError}</Text>}

          <Button label="Next" onPress={() => handleNextOrBook(false)} style={{ backgroundColor: COLORS.PRIMARY }} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <AppointmentSlot
            onChangeHandler={onChangeHandler}
            onBook={({ date, time }) => {
              setDetails(prev => ({ ...prev, slot: { date, time } }));
              handleNextOrBook(true);
            }}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default BookAppointment;

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  error: {
    color: '#B00020',
    marginTop: 8,
    marginBottom: 8,
  },
});
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect} from 'react';
import Header from '../../components/Header/Header';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../styles/color';
import { useQuery } from '@tanstack/react-query';
import { fetchSpecialityById } from '../../api/specialities';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppProvider';
import { fetchAppointmentsByPatientId } from '../../api/appointment';
import { fetchPatientByUserId } from '../../api/patient';
import { fetchDoctorById } from '../../api/doctors';

const HomeScreen = ({ route }) => {
  const { currentUser, setProfile } = useAppContext();
  const userId = currentUser?.id;

  const { navigate } = useNavigation();

  // Resolve PatientDTO that corresponds to the logged-in user
  const { data: patient } = useQuery({
    queryKey: ['patientByUser', userId],
    queryFn: () => fetchPatientByUserId(userId),
    enabled: !!userId, // Converts user id into boolean, userId is false, query will NOT run
  });
  useEffect(() => {
    if (patient) {
      console.log('[HomeScreen] Patient from fetchedPatientByUserId:', patient);
      setProfile(patient);
    }
  }, [patient, setProfile]);

  const patientId = patient?.id;

  // Fetch appointments for this patient
  const { data: appointments } = useQuery({
    queryKey: ['appointmentsByPatient', patientId],
    queryFn: () => fetchAppointmentsByPatientId(patientId),
    enabled: !!patientId,
  });

  useEffect(() => {
    if (appointments) {
      console.log(
        'Appointments for patientId',
        patient.firstName,
        patient.lastName,
        ':',
        appointments,
      );
    }
  }, [appointments, patient]);

  // Appointments endpoint returns a paginated object:
  // { content: [...], totalElements, totalPages, ... }

  // If appointment content is array, get appointment content and use empty array.
  const appts = Array.isArray(appointments?.content)
    ? appointments.content
    : [];

  // Closest upcoming appointment:
  // 1) filter only SCHEDULED
  // 2) prefer start >= now
  // 3) pick the smallest start time
  const nowMs = dayjs().valueOf();

  const scheduled = appts
    .filter(a => a?.status === 'SCHEDULED' && a?.start)
    .map(a => ({
      ...a,
      __startMs: dayjs(a.start).valueOf(),
    }))
    .filter(a => Number.isFinite(a.__startMs));

  const upcoming = scheduled.filter(a => a.__startMs >= nowMs);

  const sortByStart = (a, b) => a.__startMs - b.__startMs;

  upcoming.sort(sortByStart);
  scheduled.sort(sortByStart);

  // If there are upcoming scheduled appointments, take the nearest one.
  // Otherwise, fall back to the earliest scheduled appointment we have.
  const firstAppointment = upcoming[0] || scheduled[0] || null;

  // Normilize doctor reference into a string id for the chosen appointment (API uses doctorId)
  const doctorId = firstAppointment?.doctorId;

  const { data: doctorData } = useQuery({
    queryKey: ['doctorById', doctorId],
    queryFn: () => fetchDoctorById(doctorId),
    enabled: !!doctorId,
    retry: 0,
  });
  useEffect(() => {
    if (doctorData) {
      console.log('[HomeScreen] Doctor from fetchDoctorById:', doctorData);
    }
  }, [doctorData, doctorId]);

  const specialityId = doctorData?.specialityId;

  const { data: speciality } = useQuery({
    queryKey: ['specialityById', specialityId],
    queryFn: () => fetchSpecialityById(specialityId),
    enabled: !!specialityId,
  });

  useEffect(() => {
    console.log(
      '[HomeScreen] specialityId:',
      specialityId,
      'speciality result:',
      speciality,
    );
  }, [specialityId, speciality]);

  const specialityTitle = speciality?.title;

  const getStatusColor = status => {
    switch (status) {
      case 'SCHEDULED':
        return '#2F80ED';
      case 'ATTENDED':
        return '#27AE60';
      case 'CANCELLED':
        return '#EB5757';
      case 'NO_SHOW':
        return '#F2994A';
      default:
        return '#828282';
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <Header />
      <View>
        {firstAppointment && doctorId && (
          <View>
            <SectionHeader 
              title={'Upcoming Appointment'}
              onPress={() =>
                navigate('tabNavigator', { screen: 'viewAllAppointments' })
              }
            />
            <TouchableOpacity
              onPress={() =>
                navigate('viewAppointment', {
                  appointmentId: firstAppointment?.id,
                })
              }
              style={styles.cardContainer}
            >
              <View style={{ flexDirection: 'row' }}>
                <Image
                  style={styles.doctorImage}
                  source={
                    doctorData?.imageUrl
                      ? { uri: doctorData.imageUrl }
                      : require('../../assets/img/avatar.png')
                  }
                  onError={e =>
                    console.log(
                      '[HomeScreenDoctor] Failed to load doctor image:',
                      doctorData?.imageUrl,
                      e?.nativeEvent,
                    )
                  }
                />
                <View style={styles.cardRight}>
                  <Text style={styles.doctorName}>
                    {doctorData
                      ? `${doctorData?.firstName ?? ''} ${
                          doctorData?.lastName ?? ''
                        }`.trim()
                      : 'Doctor'}
                  </Text>

                  <Text style={styles.doctorSpeciality}>
                    {specialityTitle ?? 'Speciality'}
                  </Text>

                  <Text style={styles.cardText}>
                    {firstAppointment?.start
                      ? `${new Date(firstAppointment.start).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                      })}, ${new Date(firstAppointment.start).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}-${firstAppointment.end ? new Date(firstAppointment.end).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}`
                  : 'Waiting for doctor'}
                  </Text>
                </View>
              </View>

              <View style={[styles.cardStatusBadge, { backgroundColor:getStatusColor(firstAppointment?.status) },]}>
                <Text style={styles.cardStatusBadgeText}>
                  {firstAppointment?.status}
                </Text>
              </View>
              
              
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.PRIMARY,
    height: 140,
    marginHorizontal: 10,
    borderRadius: 10,
    padding: 15,
  },
  doctorImage: {
    height: 100,
    width: 90,
    borderRadius: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardRight: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  doctorSpeciality: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 6,
  },
  cardText: {
    color: 'white',
    fontSize: 16,
    paddingVertical: 3,
  },
  cardStatusBadge: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  cardStatusBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});

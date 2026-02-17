import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '../../components/Button/Button';
import { COLORS } from '../../styles/color';
import { fetchAppointmentById } from '../../api/appointment';
import ConfirmationModal from '../../components/ConfirmationalModal/ConfirmationModal';
import { fetchDoctorById } from '../../api/doctors';
import { fetchSpecialityById } from '../../api/specialities';
import { dateTimeFormatter } from '../../components/DateTimeFormatter/DateTimeFormatter'
import { fetchClinicById } from '../../api/clinic'
import { Linking, Platform } from 'react-native';
import { OpenClinicInMaps } from '../../components/Maps/maps'

const ViewAppointment = ({ route }) => {
  const { appointmentId } = route.params;

  // React Query will:
  // Not refetch if data in fresh
  // Use cache automatically
  // Share cache across screens

  // Immediately shows cached appointment
  // Still fetches fresh data in background (if needed)
  // No unnecessary UI loading

  const { data: appointment } = useQuery({
    queryKey: ['appointmentsById', appointmentId],
    queryFn: () => fetchAppointmentById(appointmentId),
    enabled: !!appointmentId,
    staleTime: 60_000,
  });

  const doctorId = appointment?.doctorId;

  const { data: doctor } = useQuery({
    queryKey: ['doctorById', doctorId],
    queryFn: () => fetchDoctorById(doctorId),
    enabled: !!doctorId,
    staleTime: 60_000,
  });

  const specialityId = doctor?.specialityId;

  const { data: speciality } = useQuery({
    queryKey: ['specialityById', specialityId],
    queryFn: () => fetchSpecialityById(specialityId),
    enabled: !!specialityId,
    staleTime: 60_000,
  });

  const clinicId = doctor?.clinicId;

  const { data: clinic } = useQuery({
    queryKey: ['clinicById', clinicId],
    queryFn: () => fetchClinicById(clinicId),
    enabled: !!clinicId,
    staleTime: 60_000,
  });

  console.log('[ViewAppointment]: appointmentId params:', appointment);
  console.log('[ViewAppointment]: doctor params:', doctor);
  console.log('[ViewAppointment]: specilaity params:', speciality);
  console.log('[ViewAppointment]: clinic params:', clinic);

  const openMaps = () => {
    const lat = clinic?.latitude;
    const lng = clinic?.longitude;

    if(!lat || !lng) return;

    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`,
    });

    Linking.openURL(url);
  }
  
  const [displayModal, setDisplayModal] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Image style= {styles.doctorImage} 
               source={doctor?.imageUrl ? {uri: doctor.imageUrl} : require('../../assets/img/avatar.png')} />

        <Text style={styles.title}>{'Appointment Details'}</Text>
        <Text style={{ fontSize: 16, paddingVertical: 10, fontWeight: '500' }}>
          Dr {doctor?.firstName} {doctor?.lastName}
        </Text>
        <Text style={styles.text}>Concern: {appointment?.concern}</Text>
        <Text style={styles.text}>Status: {appointment?.status}</Text>
        <Text style={styles.text}>
          {dateTimeFormatter(appointment?.start, appointment?.end)}
        </Text>

         <Text style={styles.title}>{'Clinic Details'}</Text>
          <Text style={styles.text}>{clinic?.name}</Text>
        <Text style={styles.text}>{clinic?.address}</Text>
        <Text style={styles.text}>{clinic?.postCode}</Text>
        <Text style={styles.text}>{clinic?.phoneNumber}</Text>
        <Button onPress={() => OpenClinicInMaps(clinic)}>
          <Text>Get Directions</Text>
        </Button>



      </ScrollView>
      <View
        style={{ position: 'absolute', bottom: 0, width: '100%', padding: 10 }}
      >
        <Button style={{ backgroundColor: COLORS.PRIMARY }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Text style={{ color: 'white', fontSize: 16 }}></Text>
          </View>
        </Button>
      </View>

      {/* <ConfirmationModal modalText={`Appointment with ${doctor?.name} is canceled`} onClose={()=> setDisplayModal(false)} visible={displayModal}/> */}
    </View>
  );
};

export default ViewAppointment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  imageContainer: {
    borderRadius: '50%',
    backgroundColor: '#EDEDFC',
    height: 42,
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  title:{
    fontSize:20,
    fontWeight: '800'
  },
  text: {
    fontSize: 16,
    paddingVertical: 10,
    fontWeight: '500',
  },
  doctorImage:{
    height:320,
    width: '100%',
    maxHeight: '100%',
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    resizeMode: 'cover',
  }
});

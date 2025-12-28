import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header/Header'
import Categories from '../../components/Categories/Categories'
import SectionHeader from '../../components/SectionHeader/SectionHeader'
import DoctorList from '../../components/DoctorList/DoctorList'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { COLORS } from '../../styles/color'
import { useQuery } from '@tanstack/react-query'
import { fetchSpecialityById } from '../../api/specialities'
import dayjs from 'dayjs'
import Button from '../../components/Button/Button'
import { useAppContext } from '../../context/AppProvider'
import { fetchAppointmentByPatientId } from '../../api/appointment'
import { fetchPatientByUserId } from '../../api/patient'
import { fetchDoctorById } from '../../api/doctors'

const HomeScreen = ({route}) => {
  const {navigate} = useNavigation();
  //const appointments = useSelector((state)=> state.appointment.appointments);

  // Load logged-in user id from AsyncStorage (expects login to store {"id": "..."} under 'currentUser')
  const [userId, setUserId] = useState(null); 

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('currentUser');
        if (raw) {
          const parsed = JSON.parse(raw);
          setUserId(parsed?.id || parsed?._id || null);
        }
      } catch (e) {
        console.log('Failed to load currentUser from storage', e);
      }
    })();
  }, []);

  // Resolve PatientDTO that corresponds to the logged-in user
  const { data: patient } = useQuery({
    queryKey: ['patientByUser', userId],
    queryFn: () => fetchPatientByUserId(userId),
    enabled: !!userId,
  });
  useEffect(() => {
    if (patient) {
      console.log('Patient from fetchedPatientByUserId:', patient);
    }
  }, [patient]);

  const patientId = patient?.id || patient?._id || null;

  // Fetch appointments for this patient
  const { data: appointments } = useQuery({
    queryKey: ['appointmentsByPatient', patientId],
    queryFn: () => fetchAppointmentByPatientId(patientId),
    enabled: !!patientId,
  });

  useEffect(() => {
    if (appointments) {
      console.log('Appointments for patientId', patientId, ':', appointments);
    }
  }, [appointments]);

  // SELECT the appointment to display on HOME; 
  // Prefere SCHEDULED over REQUESTED; ignore CANCELED and COMPLETED
  const appts = Array.isArray(appointments) ? appointments : (appointments?.data || []);
  
  const statusIsScheduled = (s) => s === 'SCHEDULED';
  const statusIsRequested = (s) => s === 'REQUESTED'; 

  const toMillisFromLocalDateOrCreated = (a) => {
    // 'date' is a LocalDate string like 'YYYY-MM-DD' (may be null)
    if(a?.date) return dayjs(a.data, 'YYYY-MM-DD').valueOf();
    // fall back to createdAt so still can sort
    return a?.createAt ? dayjs(a.createdAt).valueOf() : Number.POSITIVE_INFINITY;
  };

  const sheduledAppts = appts.filter((a) => statusIsScheduled(a?.status));
  const requestedAppts = appts.filter((a) => statusIsRequested(a?.status));

  sheduledAppts.sort((a, b) => 
    toMillisFromLocalDateOrCreated(a) - toMillisFromLocalDateOrCreated(b)
  );

  requestedAppts.sort((a,b) => 
    toMillisFromLocalDateOrCreated(a) - toMillisFromLocalDateOrCreated(b)
  );

  const firstAppointment = sheduledAppts[0] ?? requestedAppts[0] ?? null;

  // Normilize doctor reference into a string id for the chosen appointment (API uses doctorId)
  const doctorId = firstAppointment?.doctorId;

  const { data: doctorData } = useQuery({
    queryKey: ['doctorId', doctorId],
    queryFn: () => fetchDoctorById(doctorId),
    enabled: !!doctorId,
    retry: 0,
  })

  const specialityId = doctorData?.specialityId;

  const { data: speciality } = useQuery({
    queryKey: ['specialityById', specialityId],
    queryFn: () => fetchSpecialityById(specialityId),
    enabled: !! specialityId,
  });

  useEffect(() => {
  console.log("specialityId:", specialityId, "speciality result:", speciality);
}, [specialityId, speciality]);

  const specialityTitle = speciality?.title;

  return (
    <ScrollView style={{flex:1,backgroundColor:'white'}}>
    
      <Header />
      <View>
      {/* <Categories /> */}
      {firstAppointment && doctorId && <View>
        <SectionHeader title={'Appointments'} onPress={()=> navigate('tabNavigator',{screen:'viewAllAppointments'})}/>
        <TouchableOpacity onPress={()=> navigate('viewAppointment',{
            appointmentId: firstAppointment?.id,
            patient: patient,
            doctor: doctorData
            })} style={styles.cardContainer}>
          <View style={{flexDirection:'row'}}>
          <Image source={{ uri: doctorData?.image }} style={styles.doctorImage} />
            <View style={{paddingHorizontal:10}}>
              <Text style={styles.cardText}>{doctorData?.name}</Text>
              <Text style={styles.cardText}>{specialityTitle}</Text>
            </View>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:10,paddingVertical:10}}>
            <View style={{flexWrap:'wrap',flexDirection:'row'}}>
                <Image source={require('../../assets/img/calendar.png')}/>
                <Text 
                style={{color:'white',paddingHorizontal:5}}>
                  {firstAppointment?.date ??  'Wating for date'}
                </Text>
            </View>
            <View style={{flexWrap:'wrap',flexDirection:'row'}}>
                <Image source={require('../../assets/img/clock.png')}/>
                <Text style={{color:'white',paddingHorizontal:5}}>{firstAppointment.status}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>}
      <SectionHeader title={'Top Doctors'} onPress={()=> navigate('doctorsList')}/>
      <DoctorList horizontal/>
      </View>

    </ScrollView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  cardContainer:{backgroundColor:COLORS.PRIMARY,
     height:140,
    marginHorizontal:10,
    borderRadius:10,
    padding:15,
  },
  doctorImage:{
    height:72,
    width:72,
    borderRadius:10
  },
  cardText:{
    color:'white',
    fontSize:16,
    paddingVertical:5
  }
})
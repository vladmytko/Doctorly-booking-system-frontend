import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
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
import { fetchAppointmentsByPatientId } from '../../api/appointment'
import { fetchPatientByUserId } from '../../api/patient'
import { fetchDoctorById } from '../../api/doctors'

const HomeScreen = ({route}) => {

  const { currentUser, setProfile } = useAppContext();
  const userId = currentUser?.id;

  const {navigate} = useNavigation();


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
      console.log('Appointments for patientId', patient.firstName, patient.lastName, ':', appointments);
    }
  }, [appointments, patient]);

  // Appointments endpoint returns a paginated object:
  // { content: [...], totalElements, totalPages, ... }
  const appts = Array.isArray(appointments?.content) ? appointments.content : []; 

  // Closest upcoming appointment:
  // 1) filter only SCHEDULED
  // 2) prefer start >= now
  // 3) pick the smallest start time
  const nowMs = dayjs().valueOf();

  const scheduled = appts
    .filter((a) => a?.status === 'SCHEDULED' && a?.start)
    .map((a) => ({
      ...a,
      __startMs: dayjs(a.start).valueOf(),
    }))
    .filter((a) => Number.isFinite(a.__startMs));

  const upcoming = scheduled.filter((a) => a.__startMs >= nowMs);

  const sortByStart = (a, b) => a.__startMs - b.__startMs;

  upcoming.sort(sortByStart);
  scheduled.sort(sortByStart);

  // If there are upcoming scheduled appointments, take the nearest one.
  // Otherwise, fall back to the earliest scheduled appointment we have.
  const firstAppointment = (upcoming[0] || scheduled[0]) || null;

  // Normilize doctor reference into a string id for the chosen appointment (API uses doctorId)
  const doctorId = firstAppointment?.doctorId;

  const { data: doctorData } = useQuery({
    queryKey: ['doctorId', doctorId],
    queryFn: () => fetchDoctorById(doctorId),
    enabled: !!doctorId,
    retry: 0,
  })

//   const specialityId = doctorData?.specialityId;

//   const { data: speciality } = useQuery({
//     queryKey: ['specialityById', specialityId],
//     queryFn: () => fetchSpecialityById(specialityId),
//     enabled: !! specialityId,
//   });

//   useEffect(() => {
//   console.log("specialityId:", specialityId, "speciality result:", speciality);
// }, [specialityId, speciality]);

  // const specialityTitle = speciality?.title;

  return (
    <ScrollView style={{flex:1,backgroundColor:'white'}}>
    
      <Header />
      <View>
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
              {/* <Text style={styles.cardText}>{specialityTitle}</Text> */}
            </View>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:10,paddingVertical:10}}>
            <View style={{flexWrap:'wrap',flexDirection:'row'}}>
                <Image source={require('../../assets/img/calendar.png')}/>
                <Text 
                style={{color:'white',paddingHorizontal:5}}>
                  {firstAppointment?.start ? dayjs(firstAppointment.start).format('YYYY-MM-DD HH:mm') : 'Waiting for date'}
                </Text>
            </View>
            <View style={{flexWrap:'wrap',flexDirection:'row'}}>
                <Image source={require('../../assets/img/clock.png')}/>
                <Text style={{color:'white',paddingHorizontal:5}}>{firstAppointment.status}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>}
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
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DoctorCard from '../../components/DoctorList/DoctorCard';
import Button from '../../components/Button/Button';
import { COLORS } from '../../styles/color';
import { cancelAppointmentByAppointmentId, fetchAppointmentById, fetchAppointments } from '../../api/appointment';
import ConfirmationModal from '../../components/ConfirmationalModal/ConfirmationModal';
import { fetchDoctorById } from '../../api/doctors';
import { fetchSpecialityById } from '../../api/specialities';

const ViewAppointment = ({route}) => {

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
    queryFn: ()=> fetchAppointmentById(appointmentId),
    enabled: !!appointmentId,
    staleTime: 60_000,
  })

  const doctorId = appointment?.doctorId;

  const { data: doctor } = useQuery({
    queryKey: ['doctorById', doctorId],
    queryFn: ()=> fetchDoctorById(doctorId),
    enabled: !!doctorId,
    staleTime: 60_000,
  })

  const specialityId = doctor?.specialityId;

  const { data: speciality } = useQuery({
    queryKey: ['specialityById', specialityId],
    queryFn: () => fetchSpecialityById(specialityId),
    enabled: !!specialityId,
    staleTime: 60_000,
  })

  console.log('appointmentId params:', appointment);
  console.log('patient params:', );
  console.log('doctor params:', doctor);
  console.log('specilaity params:', speciality);

  const [displayModal, setDisplayModal] = useState(false);



  return (
    <View style={{flex:1}}>
      <ScrollView style={styles.container}>
      <View>
        <DoctorCard {...doctor} style={{width:'100%'}} imageStyle={{height:280}} displayAll/>
      </View>
      
      
       
      <Text style={{fontSize:18, paddingVertical:10,fontWeight:'500'}}>{'Appointment Details'}</Text>
      {/* <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>Name: {patient?.name}</Text> */}
      <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>ID: {}</Text> 
      <View style={{flexDirection: 'row',flexWrap:'wrap',justifyContent:'space-between',paddingVertical:10}}>
        <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>Concern: {appointment?.concern}</Text>
      </View>
      <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>Status: {appointment?.status}</Text>
      <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>Time: {appointment?.time || 'Waiting for confirmation'}</Text>
      <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>Date: {appointment?.date || 'Waiting for confirmation'}</Text>
      
    </ScrollView>
    <View style={{position:'absolute',bottom:0,width:'100%',padding:10}}>
          <Button  style={{backgroundColor:COLORS.PRIMARY}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:2}}>
            <Text style={{color:'white',fontSize:16}}></Text>
          </View>
        </Button>
      </View>

       {/* <ConfirmationModal modalText={`Appointment with ${doctor?.name} is canceled`} onClose={()=> setDisplayModal(false)} visible={displayModal}/> */}
    </View>
  )
}

export default ViewAppointment

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'white',
        padding:20
    },
    imageContainer:{
      borderRadius:'50%',
      backgroundColor:'#EDEDFC',
      height:42,
      width:42,
      alignItems:'center',
      justifyContent:'center',
      marginBottom: 5
    }
})
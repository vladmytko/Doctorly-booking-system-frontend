import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DoctorCard from '../../components/DoctorList/DoctorCard';
import Button from '../../components/Button/Button';
import { COLORS } from '../../styles/color';
import { cancelAppointmentByAppointmentId, fetchAppointmentById, fetchAppointments } from '../../api/appointment';
import ConfirmationModal from '../../components/ConfirmationalModal/ConfirmationModal';

const ViewAppointment = ({route}) => {

  const { appointmentId, patient, doctor } = route?.params;

  console.log('appointmentId params:', appointmentId);
  console.log('patient params:', patient);
  console.log('doctor params:', doctor);

  const [displayModal, setDisplayModal] = useState(false);
  const queryClient = useQueryClient();


  const { data: appt, isLoading } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => fetchAppointmentById(appointmentId),
    refetchOnMount: true, // v5 boolean; with staleTime: 0 this refetches on remount
    staleTime: 0,
  });

  // Track previous status to detect transitions to CANCELED
  const prevStatusRef = useRef(appt?.status);

  useEffect(() => {
    if(prevStatusRef.current !== 'CANCELLED' && appt?.status === 'CANCELLED'){
      setDisplayModal(true);
    }
    prevStatusRef.current = appt?.status;
  }, [appt?.status]);

  // Render from appt?.status, appt?.time, etc...

  const cancelAppointmentMutation = useMutation({
    // pass id as a variable to reuse in handlers
    mutationFn: (id) => cancelAppointmentByAppointmentId(id),
    // Optimistic update for instant UI feedback
    onMutate: async (id) => {
      // cancel any outgoing refetches so it don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['appointment', appointmentId] });
      await queryClient.cancelQueries({ queryKey: ['appointments'] });

      // snapshot previous cache values
      const previousDetail = queryClient.getQueryData({ queryKey: ['appointment', appointmentId] });
      const previousList   = queryClient.getQueryData({ queryKey: ['appointments'] });

      // Optimistically update detail cache
      queryClient.setQueryData(
        { queryKey: ['appointment', appointmentId] },
        (old) => ({ ...old, status: 'CANCELED' })
      );

      // Optimistically update list cache if present
      queryClient.setQueryData(
        { queryKey: ['appointments'] },
        (old) => {
          if (!old) return old;
          const patch = (item) => (item?.id === id ? { ...item, status: 'CANCELED' } : item);
          if (Array.isArray(old)) return old.map(patch);
          if (Array.isArray(old?.data)) return { ...old, data: old.data.map(patch) };
          if (Array.isArray(old?.pages)) {
            return {
              ...old,
              pages: old.pages.map((pg) =>
                Array.isArray(pg) ? pg.map(patch)
                : Array.isArray(pg?.data) ? { ...pg, data: pg.data.map(patch) }
                : pg
              ),
            };
          }
          return old;
        }
      );

      // Return context for rollback on error
      return { previousDetail, previousList };
    },
    onError: (error, _id, context) => {
      console.error('Failed to cancel appointment: ', error);
      // Roll back to previous cache state if available
      if (context?.previousDetail) {
        queryClient.setQueryData({ queryKey: ['appointment', appointmentId] }, context.previousDetail);
      }
      if (context?.previousList) {
        queryClient.setQueryData({ queryKey: ['appointments'] }, context.previousList);
      }
    },
    onSuccess: (data, id) => {
      // Reconcile with server response (if backend returns payload)
      const updated = data?.appointment ?? data ?? {};
      if (Object.keys(updated).length) {
        queryClient.setQueryData(
          { queryKey: ['appointment', appointmentId] },
          (old) => ({ ...old, ...updated })
        );
        queryClient.setQueryData(
          { queryKey: ['appointments'] },
          (old) => {
            if (!old) return old;
            const merge = (item) => (item?.id === (updated.id ?? id) ? { ...item, ...updated } : item);
            if (Array.isArray(old)) return old.map(merge);
            if (Array.isArray(old?.data)) return { ...old, data: old.data.map(merge) };
            if (Array.isArray(old?.pages)) {
              return {
                ...old,
                pages: old.pages.map((pg) =>
                  Array.isArray(pg) ? pg.map(merge)
                  : Array.isArray(pg?.data) ? { ...pg, data: pg.data.map(merge) }
                  : pg
                ),
              };
            }
            return old;
          }
        );
      }
      setDisplayModal(true);
    },
    // Always refetch to be 100% consistent with backend
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const onPressNext = useCallback(() => {
    const isLoading = cancelAppointmentMutation.isLoading;
    const id = appt?.id;
    // Guard: block if id is null/undefined OR a request is already in-flight
    if (id == null || isLoading) {
      console.warn('Cancel pressed but guard blocked', { id, isLoading });
      return;
    }
    console.log('Calling cancelAppointmentByAppointmentId with id:', id);
    cancelAppointmentMutation.mutate(id);
  }, [appt?.id, cancelAppointmentMutation]);

  return (
    <View style={{flex:1}}>
      <ScrollView style={styles.container}>
      <View>
        <DoctorCard {...doctor} style={{width:'100%'}} imageStyle={{height:280}} displayAll/>
      </View>
      
      
       
      <Text style={{fontSize:18, paddingVertical:10,fontWeight:'500'}}>{'Appointment Details'}</Text>
      <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>Name: {patient?.name}</Text>
      <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>ID: {patient?.id}</Text> 
      <View style={{flexDirection: 'row',flexWrap:'wrap',justifyContent:'space-between',paddingVertical:10}}>
        <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>Concern: {appt?.concern}</Text>
      </View>
      <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>Status: {appt?.status}</Text>
      <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>Time: {appt?.time || 'Waiting for confirmation'}</Text>
      <Text style={{fontSize:16, paddingVertical:10,fontWeight:'500'}}>Date: {appt?.date || 'Waiting for confirmation'}</Text>
      
    </ScrollView>
    <View style={{position:'absolute',bottom:0,width:'100%',padding:10}}>
          <Button onPress={onPressNext} style={{backgroundColor:COLORS.PRIMARY}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:2}}>
            <Text style={{color:'white',fontSize:16}}>{cancelAppointmentMutation.isLoading ? 'Cancelling...' : 'Cancel Appointment'}</Text>
          </View>
        </Button>
      </View>

       <ConfirmationModal modalText={`Appointment with ${doctor?.name} is canceled`} onClose={()=> setDisplayModal(false)} visible={displayModal}/>
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
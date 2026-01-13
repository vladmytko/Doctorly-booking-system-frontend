import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPatientByUserId } from '../../api/patient';
import { fetchAppointmentsByPatientId } from '../../api/appointment';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../../styles/color';
import { fetchDoctorById } from '../../api/doctors';
import { fetchSpecialityById } from '../../api/specialities';
import ConfirmationModal from '../../components/ConfirmationalModal/ConfirmationModal';

const Appointments = () => {

  const {navigate} = useNavigation();
  // UI state for filtering & sorting
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // ALL | REQUESTED | SCHEDULED | COMPLETED | CANCELLED | NO_SHOW

  // Load logged-in user id from AsyncStorage (expects login to store {"id": "..."} under 'currentUser')
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('currentUser');
        if (raw) {
          const parsed = JSON.parse(raw);
          setUserId(parsed?.id);
        }
      } catch (e) {
        console.log('Failed to load currentUser from storage', e);
      }
    })(); 
  }, []);

  // Get patientId from userId
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

  const patientId = patient?.id;

  // Fetch appointments for this patient
  const { data: appointments, refetch: refetchAppointments } = useQuery({
    queryKey: ['appointmentsByPatient', patientId],
    queryFn: () => fetchAppointmentsByPatientId(patientId),
    enabled: !!patientId,
    refetchOnMount: true,
    staleTime:0,
  });

  useEffect(() => {
    if (appointments) {
      console.log('Appointments for patientId', patientId, ':', appointments);
    }
  }, [appointments]);

  const doctorId = Array.isArray(appointments) ? appointments?.[0]?.doctorId : null;

  const { data: doctor } = useQuery({
    queryKey: ['doctorById', doctorId],
    queryFn: () => fetchDoctorById(doctorId),
    enabled: !!doctorId,
  });

  useEffect(() => {
    if (doctor) {
      console.log('Doctor details: ', doctor);
    }
  }, [doctor]);


  const specialityId = doctor?.specialityId;
  
    const { data: speciality } = useQuery({
      queryKey: ['specialityById', specialityId],
      queryFn: () => fetchSpecialityById(specialityId),
      enabled: !! specialityId,
    });
  
    useEffect(() => {
    console.log("specialityId:", specialityId, "speciality result:", speciality);
  }, [specialityId, speciality]);
  
  const queryClient = useQueryClient();

  // Whenever the Appointments screen comes into focus (user navigates back here),
  // system invalidate the ['appointmentsByPatient', patientId] query.
  // That tells React Query that the cached data is stale and triggers a refetch,
  // ensuring the list of appointments is always up-to-date when the user returns.
  useFocusEffect(
    React.useCallback(() => {
      if(patient) {
        queryClient.invalidateQueries({
          queryKey:['appointmentsByPatient', patientId]
        });
      }
    }, [patientId, queryClient])
  );

  // --- Derived data: filtered & sorted appointments ---
  const statusFilter = (list) => {
    if (!Array.isArray(list)) return [];
    if (selectedStatus === 'ALL') return list;
    return list.filter(a => a?.status === selectedStatus);
  };

  const parseDateTime = (a) => {
    // Expecting fields like a.date = '2025-09-27', a.time = '16:30:00'
    try {
      const iso = a?.date ? `${a.date}${a?.time ? 'T'+a.time : 'T00:00:00'}` : null;
      return iso ? new Date(iso) : null;
    } catch {
      return null;
    }
  };

  const sortAppointments = (list) => {
    const now = new Date();
    return [...list].sort((x, y) => {
      const dx = parseDateTime(x);
      const dy = parseDateTime(y);

      // Upcoming (scheduled in future) first by earliest date
      const xFuture = dx && dx >= now;
      const yFuture = dy && dy >= now;

      if (selectedStatus === 'SCHEDULED' || (xFuture || yFuture)) {
        if (dx && dy) return dx - dy; // asc
      }

      // Otherwise newest first
      if (dx && dy) return dy - dx; // desc
      if (dx && !dy) return -1;
      if (!dx && dy) return 1;
      return 0;
    });
  };

  const filteredAppointments = sortAppointments(statusFilter(appointments || []));

  return (
    <ScrollView style={{flex:1 , backgroundColor: 'white'}}>
      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{paddingHorizontal:10}}>
        {['ALL','REQUESTED','SCHEDULED','COMPLETED','CANCELLED','NO_SHOW'].map((st) => (
          <TouchableOpacity key={st} onPress={() => setSelectedStatus(st)} style={[styles.chip, selectedStatus === st && styles.chipSelected]}>
            <Text style={[styles.chipText, selectedStatus === st && styles.chipTextSelected]}>{st === 'ALL' ? 'All' : st}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {Array.isArray(filteredAppointments) && filteredAppointments.length > 0 ? (
        filteredAppointments.map((appt, idx) => (
          <TouchableOpacity
            key={idx.toString()}
            onPress={() => navigate('viewAppointment', {  
              appointmentId: appt?.id,
              patient: patient,
              doctor: doctor })}   //appointmentId: appt.id ,
            style={styles.cardContainer}
          >
            <View style={{flexDirection:'row'}}>
              <Image source={{ uri: doctor?.image }} style={styles.doctorImage} />
              <View style={{marginHorizontal:10, flexDirection:'row'}}>
                <Text style={styles.cardText}>{doctor?.name}</Text>
                <Text style={[styles.cardText, {marginLeft: 38}]}>{speciality?.title}</Text>
              </View>               
            </View>
           
            <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:2,paddingVertical:10}}>
              <View style={{flexWrap:'wrap',flexDirection:'row'}}>
                  <Text style={styles.cardText}>Date: {appt?.date ? String(appt?.date) : 'Waiting for doctor'}</Text>
              </View>
              <View style={{flexWrap:'wrap',flexDirection:'row'}}>
                <Text style={styles.cardText}>Status: {appt?.status}</Text>
                {/* appt?.time ? String(appt?.time) : "Waiting for doctor" */}
              </View>
              </View>

            
              
             
          </TouchableOpacity>
        ))
      ) : (
        <View style={{ padding: 16 }}>
          <Text>No appointments yet.</Text>
        </View>
      )}
    </ScrollView>
  )
}

export default Appointments

const styles = StyleSheet.create({
  cardContainer:{backgroundColor:COLORS.PRIMARY,
    height:140,
    marginHorizontal:10,
    borderRadius:10,
    padding:15,
    marginVertical:10,
  },
  doctorImage:{
    height:80,
    width:72,
    borderRadius:10,

  },
  cardText:{
    color:'white',
    fontSize:16,
    paddingVertical:3
  },
  filterBar: {
    paddingVertical: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'white',
  },
  chipSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextSelected: {
    color: 'white',
    fontWeight: '600',
  }
})
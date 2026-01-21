import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAppointmentsByPatientId } from '../../api/appointment';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../../styles/color';
import { fetchDoctorById } from '../../api/doctors';
import { fetchSpecialityById } from '../../api/specialities';
import { useAppContext } from '../../context/AppProvider';

const Appointments = () => {
  const { navigate } = useNavigation();

  // Read the profile form context
  const { profile, currentUser } = useAppContext();

  // UI state for filtering & sorting
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // ALL | SCHEDULED | COMPLETED | CANCELLED | NO_SHOW

  const currentUserId = profile?.id;

  // Fetch appointments for this patient
  const { data: appointments } = useQuery({
    queryKey: ['appointmentsByPatient', currentUserId],
    queryFn: () => fetchAppointmentsByPatientId(currentUserId),
    enabled: !!profile?.id,
    refetchOnMount: true,
    staleTime: 0,
  });
  useEffect(() => {
    if (appointments) {
      console.log(
        '[APPOINTMENTS] Appointments for',
        profile?.firstName,
        profile?.lastName,
        ':',
        appointments,
      );
    }
  }, [profile?.firstName, profile?.lastName, appointments]);

  const appoinmentList = Array.isArray(appointments?.content)
    ? appointments.content
    : [];

  const doctorId = appoinmentList?.[0]?.doctorId ?? null;

  const { data: doctor } = useQuery({
    queryKey: ['doctorById', doctorId],
    queryFn: () => fetchDoctorById(doctorId),
    enabled: !!doctorId,
  });

  // useEffect(() => {
  //   if (doctor) {
  //     console.log('Doctor details: ', doctor);
  //   }
  // }, [doctor]);

  const specialityId = doctor?.specialityId;

  const { data: speciality } = useQuery({
    queryKey: ['specialityById', specialityId],
    queryFn: () => fetchSpecialityById(specialityId),
    enabled: !!specialityId,
  });

  //   useEffect(() => {
  //   console.log("specialityId:", specialityId, "speciality result:", speciality);
  // }, [specialityId, speciality]);

  const queryClient = useQueryClient();

  // Whenever the Appointments screen comes into focus (user navigates back here),
  // system invalidate the ['appointmentsByPatient', patientId] query.
  // That tells React Query that the cached data is stale and triggers a refetch,
  // ensuring the list of appointments is always up-to-date when the user returns.
  useFocusEffect(
    // Runs every time this screen becomes acrive
    React.useCallback(() => {
      if (profile) {
        queryClient.invalidateQueries({
          queryKey: ['appointmentsByPatient', profile?.id],
        });
      }
    }, [profile, queryClient]),
  );

  // --- Derived data: filtered & sorted appointments ---
  // Filter appointments by the status.
  const statusFilter = list => {
    if (!Array.isArray(list)) return [];
    if (selectedStatus === 'ALL') return list;
    return list.filter(a => a?.status === selectedStatus);
  };

  const parseDateTime = a => {
    if (!a?.start) return null;
    const d = new Date(a.start);
    return isNaN(d.getTime()) ? null : d;
  };

  const sortAppointments = list => {
    const now = new Date();
    return [...list].sort((x, y) => {
      const dx = parseDateTime(x);
      const dy = parseDateTime(y);

      // Upcoming (scheduled in future) first by earliest date
      const xFuture = dx && dx >= now;
      const yFuture = dy && dy >= now;

      if (selectedStatus === 'SCHEDULED' || xFuture || yFuture) {
        if (dx && dy) return dx - dy; // asc
      }

      // Otherwise newest first
      if (dx && dy) return dy - dx; // desc
      if (dx && !dy) return -1;
      if (!dx && dy) return 1;
      return 0;
    });
  };

  const filteredAppointments = sortAppointments(
    statusFilter(appoinmentList || []),
  );

  const getStatusColor = status => {
    switch(status) {
      case 'SCHEDULED':
        return '#2F80ED';
      case 'ATTENDED':
        return '#27AE60';
      case 'CANCELLED':
        return '#EB5757';
      case 'NO_SHOW':
        return '#828282';  
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {['ALL', 'SCHEDULED', 'ATTENDED', 'CANCELLED', 'NO_SHOW'].map(st => (
          <TouchableOpacity
            key={st}
            onPress={() => setSelectedStatus(st)}
            style={[styles.chip, selectedStatus === st && styles.chipSelected]}
          >
            <Text
              style={[
                styles.chipText,
                selectedStatus === st && styles.chipTextSelected,
              ]}
            >
              {st === 'ALL' ? 'All' : st}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {Array.isArray(filteredAppointments) &&
      filteredAppointments.length > 0 ? (
        filteredAppointments.map((appt, idx) => (
          <TouchableOpacity
            key={appt?.id ?? idx.toString()}
            onPress={() =>
              navigate('viewAppointment', {
                appointmentId: appt?.id,
                patient: profile,
                doctor: doctor,
              })
            } //appointmentId: appt.id ,
            style={styles.cardContainer}
          >
            <View style={styles.cardRow}>
              <Image
                style={styles.doctorImage}
                source={
                  doctor?.imageUrl
                    ? { uri: doctor.imageUrl }
                    : require('../../assets/img/avatar.png')
                }
                onError={e =>
                  console.log(
                    '[APPOINTMENTS]: Image for doctor ',
                    doctor?.firstName,
                    doctor?.lastName,
                    'does not show. ',
                    e?.nativeEvent,
                  )
                }
              />

              <View style={styles.cardRight}>
                <Text style={styles.doctorName}>
                  {doctor?.firstName} {doctor?.lastName}
                </Text>

                <Text style={styles.cardText}>{speciality?.title}</Text>

                <Text style={styles.cardText}>
                  {appt?.start
                    ? `${new Date(appt.start).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                      })}, ${new Date(appt.start).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}–${appt.end
                        ? new Date(appt.end).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}`
                    : 'Waiting for doctor'}
                </Text>
              </View>
            </View>
            
            <View style={[styles.cardStatusBadge, { backgroundColor:getStatusColor(appt?.status) },]}>
                <Text style={styles.cardStatusBadgeText}>
                  {appt?.status === 'SHEDULED' ? 'Waiting' : appt?.status}
                </Text>
            </View>              
            
          </TouchableOpacity>
        ))
      ) : (
        <View style={{ padding: 16 }}>
          <Text>No appointments yet.</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default Appointments;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.PRIMARY,
    marginHorizontal: 10,
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    position:'relative'
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
  },
});

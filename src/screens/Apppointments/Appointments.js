import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { fetchPatientByUserId } from '../../api/patient';
import { fetchAppointmentsByPatientId } from '../../api/appointment';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../../styles/color';
import { fetchDoctorById } from '../../api/doctors';
import { fetchSpecialityById } from '../../api/specialities';
import ConfirmationModal from '../../components/ConfirmationalModal/ConfirmationModal';
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

  const appointmentList = Array.isArray(appointments?.content)
    ? appointments.content
    : [];

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

  const parseDate = appt => (appt?.start ? new Date(appt.start) : null);

  const sortAppointments = list => {
    const now = new Date();
    const safe = Array.isArray(list) ? list : [];

    // helper: safe time value
    const time = a => {
      const d = parseDate(a);
      return d && !isNaN(d.getTime()) ? d.getTime() : null;
    };

    // helpers for sorting (null-safe)
    const asc = (a, b) => {
      const ta = time(a);
      const tb = time(b);
      if (ta == null && tb == null) return 0;
      if (ta == null) return 1;
      if (tb == null) return -1;
      return ta - tb;
    };

    const desc = (a, b) => {
      const ta = time(a);
      const tb = time(b);
      if (ta == null && tb == null) return 0;
      if (ta == null) return 1;
      if (tb == null) return -1;
      return tb - ta;
    };

    // Special rule only for ALL
    if (selectedStatus === 'ALL') {
      const upcomingScheduled = [];
      const rest = [];

      for (const appt of safe) {
        const d = parseDate(appt);
        const isUpcoming = d && d >= now;
        const isScheduled = appt?.status === 'SCHEDULED';

        if (isScheduled && isUpcoming) upcomingScheduled.push(appt);
        else rest.push(appt);
      }

      upcomingScheduled.sort(asc); // soonest first
      rest.sort(desc); // most recent first

      return [...upcomingScheduled, ...rest];
    }

    // Other filters
    if (selectedStatus === 'SCHEDULED') return [...safe].sort(asc);
    return [...safe].sort(desc);
  };

  const filteredAppointments = sortAppointments(
    statusFilter(appointmentList || []),
  );

  // --- Doctor caching per appointment (max ~20 per page) ---
  const doctorIds = Array.from(
    new Set((filteredAppointments || []).map(a => a?.doctorId).filter(Boolean)),
  );

  const doctorQueries = useQueries({
    queries: doctorIds.map(id => ({
      queryKey: ['doctorById', id],
      queryFn: () => fetchDoctorById(id),
      enabled: !!id,
      // Doctors rarely change; cache aggressively
      staleTime: 24 * 60 * 60 * 1000, // 1 day
    })),
  });

  const doctorsById = doctorQueries.reduce((acc, q, idx) => {
    const id = doctorIds[idx];
    if (id && q?.data) acc[id] = q.data;
    return acc;
  }, {});

  // Optional: speciality caching (also rare)
  const specialityIds = Array.from(
    new Set(
      doctorIds
        .map(id => doctorsById[id]?.specialityId)
        .filter(Boolean),
    ),
  );

  const specialityQueries = useQueries({
    queries: specialityIds.map(id => ({
      queryKey: ['specialityById', id],
      queryFn: () => fetchSpecialityById(id),
      enabled: !!id,
      staleTime: 24 * 60 * 60 * 1000, // 1 day
    })),
  });

  const specialitiesById = specialityQueries.reduce((acc, q, idx) => {
    const id = specialityIds[idx];
    if (id && q?.data) acc[id] = q.data;
    return acc;
  }, {});

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
        filteredAppointments.map((appt, idx) => {
          const doctor = doctorsById[appt?.doctorId];
          const speciality = doctor?.specialityId
            ? specialitiesById[doctor.specialityId]
            : null;

          return (
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
                  {doctor
                    ? `${doctor?.firstName ?? ''} ${doctor?.lastName ?? ''}`.trim()
                    : 'Doctor'}
                </Text>

                <Text style={styles.doctorSpeciality}>
                  {speciality?.title ?? 'Speciality'}
                </Text>

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
                  {appt?.status}
                </Text>
            </View>              
            
          </TouchableOpacity>
          );
        })
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

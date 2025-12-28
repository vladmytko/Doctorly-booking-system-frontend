import { StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query';
import DoctorCard from '../../components/DoctorList/DoctorCard';
import { COLORS } from '../../styles/color';
import Button from '../../components/Button/Button';
import ConfirmationModal from '../../components/ConfirmationalModal/ConfirmationModal';
import { createAppointment } from '../../api/appointment';
import { useDispatch, useSelector } from 'react-redux';
import { setAppointment } from '../../store/features/appointment';
import { fetchDoctorById } from '../../api/doctors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPatientByUserId } from '../../api/patient';

const BookAppointment = ({route,navigation}) => {

  // Read user from Redux store
  const currentUser = useSelector((state) => state?.auth?.user);
  const {doctorId} = route?.params;

  const [appointmentDetails,setAppointmentDetails] = useState({
    patient:{
        name:'',
        phoneNumber:'',
        email:'',
        dateOfBirth:'', // YYYY-MM-DD
        gender: '',
        concern: '',
    }
  });

  const [userIdFromStorage, setUserIdFromStorage] = useState(null);

  const [formError,setFormError] = useState('');
  const [errors, setErrors] = useState({});
  const [patientId, setPatientId] = useState(null);
  const [displayModal,setDisplayModal] = useState(false);

  const {data,isError,error} = useQuery({
    queryKey:['doctorById',doctorId],
    queryFn:()=> fetchDoctorById(doctorId)
  });

  const dispatch = useDispatch();


  const mutation = useMutation({
    mutationFn:createAppointment,
    onSuccess:(data)=>{
      console.log("Recived ",data);
      dispatch(setAppointment(data));
      setDisplayModal(true);
    },
    onError:(err)=>{
      console.log(err);
    }
  })

  // Load user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const json = await AsyncStorage.getItem('currentUser');
        if (json) {
          const user = JSON.parse(json);
          setAppointmentDetails((prev) => ({
            ...prev,
            patient: {
              ...prev.patient,
              name: user?.name ,
              phoneNumber: user?.phone,
              email: user?.email,
            },
          }));
          setUserIdFromStorage(user?.id);
        }
      } catch (e) {
        console.log('[BookAppointment] Failed to load user from storage:', e);
      }
    };

    loadUser();
  }, []);

  const effectiveUserId = currentUser?.id || currentUser?._id || userIdFromStorage || null;
  console.log('[BookAppointment] effectiveUserId:', effectiveUserId);

  const { data: patient } = useQuery({
    queryKey: ['patientByUser', effectiveUserId],
    queryFn: () => fetchPatientByUserId(effectiveUserId),
    enabled: !!effectiveUserId,
  });

  useEffect(() => {
    if (patient?.id || patient?._id) {
      setPatientId(patient.id || patient._id);
    }
  }, [patient]);

  const isValidISODate = (s) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s || ''))) return false;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return false;
    // ensure no auto-correction by Date: compare parts
    const [y, m, day] = s.split('-').map(Number);
    return d.getUTCFullYear() === y && (d.getUTCMonth() + 1) === m && d.getUTCDate() === day;
  };

  const normalizeGender = (g) => String(g || '').trim().toUpperCase();
  const isValidGender = (g) => ['MALE','FEMALE'].includes(normalizeGender(g));

  const onPressNext = useCallback(() => {
    setFormError('');
    setErrors({});

    const p = appointmentDetails.patient || {};
    const nextErrors = {};

  console.log('[DEBUG] Current values:', {
  patient: appointmentDetails.patient,
  patientId,
  doctorId,
});


console.log('[DEBUG] Computed validation flags:', {
  nameOk: appointmentDetails.patient?.name,
  patientId: patientId,
  doctorId: doctorId,
  phoneDigits: String(appointmentDetails.patient?.phoneNumber || '').replace(/\D/g, ''),
  email: appointmentDetails.patient?.email,
  dob: appointmentDetails.patient?.dateOfBirth,
  dobOk: isValidISODate(appointmentDetails.patient?.dateOfBirth),
  gender: appointmentDetails.patient?.gender,
  genderOk: ['MALE','FEMALE'].includes(normalizeGender(appointmentDetails.patient?.gender)),
  concern: appointmentDetails.patient?.concern,
  userId: effectiveUserId,
  
});

    // Name
    if (!p.name?.trim()) nextErrors.name = 'Name is required.';

    // Phone (uneditable, but validate digits)
    const phoneDigits = String(p?.phoneNumber || '').replace(/\D/g, '');
    if (!phoneDigits) nextErrors.phoneNumber = 'Contact number is required.';
    else if (phoneDigits.length < 10) nextErrors.phoneNumber = 'Enter a valid phone number (10–11 digits).';

    // Email (optional – make required if your flow expects it)
    if (!p.email?.trim()) nextErrors.email = 'Email is required.';

    // Date of Birth (required, ISO format)
    if (!p.dateOfBirth?.trim()) nextErrors.dateOfBirth = 'Date of birth is required (YYYY-MM-DD).';
    else if (!isValidISODate(p.dateOfBirth)) nextErrors.dateOfBirth = 'Use format YYYY-MM-DD (valid date).';

    // Gender (required, must match enum)
    if (!p.gender?.trim()) nextErrors.gender = 'Gender is required (Male/Female).';
    else if (!isValidGender(p.gender)) nextErrors.gender = 'Gender must be Male or Female.';

    // Concern (required)
    if (!p.concern?.trim()) nextErrors.concern = 'Please describe your health issue.';

    // IDs present
    if (!patientId) nextErrors.patientId = 'Patient reference missing.';
    if (!doctorId) nextErrors.doctorId = 'Doctor reference missing.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError('Please fix the highlighted fields.');
      return;
    }

    const payload = {
      dateOfBirth: p.dateOfBirth,
      gender: normalizeGender(p.gender),
      concern: p.concern.trim(),
      patientId,
      doctorId,
    };

    console.log('[BookAppointment] Submitting payload:', payload, { patientId, doctorId });
    mutation.mutate(payload);
  }, [appointmentDetails, patientId, doctorId]);

  const onChangeTextField = useCallback((name,value)=>{
    if(formError){
        setFormError(false);
    }
    setAppointmentDetails((prevState)=>({
        ...prevState,
        patient:{
            ...prevState.patient,
            [name]:value
        }
    }));
    
  },[formError]);


  return (
    <View style={styles.container}>
     <View style={{padding:10}}>
      <Text style={styles.doctorHeading}>Doctor</Text>
      <DoctorCard {...data} style={styles.doctorCard} imageStyle={styles.doctorImage}
       contentContainerStyle={styles.contentContainerStyle}/>
       <View>
       <Text style={[styles.doctorHeading,{marginTop:10}]}>Appointment For</Text>
       <TextInput value={appointmentDetails.patient.name} onChangeText={(text)=> onChangeTextField('name',text)} style={styles.input} placeholder='Patient Name' editable={false}     /> 
       {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
       <TextInput value={appointmentDetails.patient.phoneNumber} onChangeText={(text)=> onChangeTextField('phoneNumber',text)} style={styles.input} placeholder='Contact Number' keyboardType='numeric' maxLength={10} editable={false}/> 
       {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
       <TextInput value={appointmentDetails.patient.email} editable={false} selectTextOnFocus={false} style={[styles.input, { backgroundColor: '#f5f5f5' }]} placeholder='Email' />
       {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
       <TextInput value={appointmentDetails.patient.dateOfBirth} onChangeText={(text)=> onChangeTextField('dateOfBirth',text)} style={styles.input} placeholder='YYYY-MM-DD' keyboardType='numeric' maxLength={10}/> 
       {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
       <TextInput value={appointmentDetails.patient.gender} onChangeText={(text)=> onChangeTextField('gender',text)} style={styles.input} placeholder='Male or Female'/> 
       {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

       <Text style={[styles.doctorHeading,{marginTop:10}]}>Describe Your Health Issue</Text>
       <TextInput
         value={appointmentDetails.patient.concern}
         onChangeText={(text)=> onChangeTextField('concern', text)}
         style={[styles.input, styles.textarea]}
         placeholder='Type here...'
         multiline
         numberOfLines={6}
         textAlignVertical='top'
       />
       {errors.concern && <Text style={styles.errorText}>{errors.concern}</Text>}

       </View>
       
      </View>
     
      <View style={{position:'absolute',bottom:0,width:'100%',padding:10}}>
        {!!formError && (
          <Text style={[styles.errorText, { marginBottom: 8 }]}>{formError}</Text>
        )}
        {(errors.patientId || errors.doctorId) && (
          <Text style={[styles.errorText, { marginBottom: 8 }]}>
            {errors.patientId || errors.doctorId}
          </Text>
        )}
        {mutation.isError && (
          <Text style={[styles.errorText, { marginBottom: 8 }]}>
            {String(mutation.error?.response?.data || mutation.error?.message || 'Failed to request appointment')}
          </Text>
        )}
        <Button
          onPress={onPressNext}
          label={mutation.isLoading ? 'Requesting…' : 'Request'}
          // disabled={mutation.isLoading || !patientId || !doctorId}
          style={{backgroundColor:COLORS.PRIMARY}}
        />
      </View>
      <ConfirmationModal modalText={`You request an appointment with ${data.name}.`} onClose={()=> setDisplayModal(false)} visible={displayModal}/>
    </View>
  )
}

export default BookAppointment

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'white',
        
    },
    doctorHeading:{
        fontSize:16,
        fontWeight:'500'
    },
    doctorCard:{
        flexDirection:'row',
        paddingVertical:10,
        justifyContent:'space-between',
        borderRadius:10,
        borderWidth:1,
        width:'100%',
        flex:0,
        paddingHorizontal:10,
        alignContent:'center',
        alignItems:'center',
        borderColor:'#EDEDFC',
        marginTop:10

    },
    doctorImage:{
        width:80,
        height:80,
        borderRadius:10,
        marginRight:10
    },
    contentContainerStyle:{
        flexDirection:'column',
        justifyContent:'flex-start',
        width:'100%',
        gap:8
    },
    input:{
        height:48,
        borderWidth:1,
        borderColor:'#76809F',
        borderRadius:5,
        marginVertical:10,
        padding:10
    },
    errorText:{
        marginBottom:20,
        color:'red'
    },
    textarea:{
        height:140,
        paddingTop:12,
    }
})
import { Image, ImageBackground, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import Button from '../../components/Button/Button';
import { useQuery } from '@tanstack/react-query';
import CallEnd from '../../assets/img/call_end.png';
import CallStart from '../../assets/img/call_start.png';
import MicOn from '../../assets/img/microphone.png';
import MicOff from '../../assets/img/microphone_off.png';
import SpeakerOn from '../../assets/img/speaker_on.png';
import SpeakerOff from '../../assets/img/speaker_off.png';
import { fetchDoctorById } from '../../api/doctors';

const CallScreen = ({doctorId,userId,isDoctor,endCall,callStatus,answerCall,rejectCall,callActive,isIncoming}) => {
  const navigation = useNavigation();
  const [callDuration,setCallDuration] = useState(0);
  const timeRef = useRef(null);
  const {data,isError,error} = useQuery({
    queryKey:['doctorById',doctorId],
    queryFn:()=> fetchDoctorById(doctorId)
  });
  
  useEffect(()=>{
    navigation.setOptions({
      headerShown: false,  
    })
    return ()=> navigation.setOptions({
      headerShown: true,  
    })
  },[]);

  useEffect(()=>{
    if(callActive){
      setCallDuration(0);
      timeRef.current = setInterval(()=>{
        setCallDuration(prev=> prev+1);
      },1000);
    }
    else{
      clearInterval(timeRef.current);
    }

    return ()=> clearInterval(timeRef.current);
  },[callActive]);

  const formatTime = (seconds)=>{
    const mins = Math.floor(seconds/60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
  }
  return (
    <View  style={{flex:1,backgroundColor:'#0B3DA9'}}>
    <View style={{position:'absolute',top:50,width:'100%',alignItems:'center'}}>
      <Text style={{color:'white',fontSize:18}}>{callStatus}</Text>
    </View>

    <View style={{position:'absolute',top:80,width:'100%',alignItems:'center'}}>
      {callDuration>0 && <Text style={{color:'white',fontSize:16}}>{formatTime(callDuration)}</Text>}
    </View>
     <View style={{alignItems:'center',justifyContent:'center',flex:1}}>
     <View>
          <Image source={!isDoctor ? {uri:data?.image} :require('../../assets/img/avatar.png')} style={{height:120,width:120,borderRadius:'50%'}}/>
          <Text style={{alignSelf:'center',marginTop:10,color:'white',fontSize:22}}>{data?.name}</Text>
          </View>
     </View>
     <View style={{position:'absolute',bottom:80, alignItems:'center',justifyContent:'center',width:'100%'}}>
      {(!isIncoming || callActive) && <View style={{flexDirection:'row',flexWrap:'wrap',gap:24}}>
        <Button><Image source={SpeakerOff}/></Button>
        <Button onPress={endCall}><Image source={CallEnd}/></Button>
        <Button><Image source={MicOn}/></Button>
      </View>}

      {isIncoming && !callActive && <View style={{flexDirection:'row',flexWrap:'wrap',gap:24}}>
        <Button onPress={answerCall}><Image source={CallStart}/></Button>
        <Button onPress={rejectCall}><Image source={CallEnd}/></Button>
      </View>}

     </View>
    </View>
  )
}

export default CallScreen

const styles = StyleSheet.create({})
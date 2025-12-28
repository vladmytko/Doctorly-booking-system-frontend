import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useQuery } from '@tanstack/react-query';
import { fetchDoctorById } from '../../api/doctors';
import DoctorCard from '../../components/DoctorList/DoctorCard';
import { metricsDoctor } from './constant';
import Button from '../../components/Button/Button';
import { COLORS } from '../../styles/color';
import { useNavigation } from '@react-navigation/native';

const DoctorDetails = ({route}) => {
  const {doctorId} = route?.params;
  const {data,isError,error} = useQuery({
    queryKey:['doctorById',doctorId],
    queryFn:()=> fetchDoctorById(doctorId)
  });
  const {navigate} = useNavigation();
  return (
    <View style={{flex:1}}>
    <ScrollView style={styles.container}>
      {/* <View style={styles.header}>
        <Button onPress={()=> navigation.goBack()}><Image source={require('../../assets/img/back.png')}/></Button>
      </View> */}
      <View>
        <DoctorCard {...data} style={{width:'100%'}} imageStyle={{height:280}} displayAll/>
      </View>
      <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',paddingVertical:10}}>
        {metricsDoctor.map((item,i)=>(
          <View key={i} style={{alignItems:'center'}}>
          <View style={styles.imageContainer}>
            <Image source={item.icon} />
            </View>
            <Text>{item.label}</Text>
            <Text>{item.title}</Text>
          </View>
        ))}
      </View>
      <Text style={{fontSize:18, paddingVertical:10,fontWeight:'500'}}>{'About Me'}</Text>
      <Text style={{paddingVertical:5}}>{data?.bio}</Text>
      
    </ScrollView>
    <View style={{position:'absolute',bottom:0,width:'100%',padding:10}}>
        <Button onPress={()=> navigate('bookAppointment',{doctorId:doctorId})} label={'Book an Appointment'} style={{backgroundColor:COLORS.PRIMARY}}/>
      </View>
    </View>
  )
}

export default DoctorDetails

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
      marginBottom:5
    }
})
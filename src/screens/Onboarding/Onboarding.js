import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Button from '../../components/Button/Button'
import { useNavigation } from '@react-navigation/native'



const Onboarding = () => {
  const {navigate} = useNavigation();  
  return (
    <View style={{flex:1}}>
      <ImageBackground  style={{flex:1, justifyContent: 'center', backgroundColor: 'white'}}>     
                <View style={{flex:0.3,justifyContent:'center', marginTop: 120, alignItems:'center'}}>
                    {/* <Image source={require('../../assets/img/doctor.png')} style={{width:'100%'}} resizeMode='contain'/> */}
                    <Image source={require('../../assets/img/logo.png')} style={{width:'100%'}} resizeMode='contain'/>
                </View>
                <View style={{flex:0.45, backgroundColor:'white', borderTopLeftRadius:20, borderTopRightRadius:20, marginBottom: 30}}>
                    <View style={{justifyContent:'center', alignItems:'center'}}>
                        <Text style={{fontSize:24, fontWeight:'bold', paddingVertical:10}}>Welcome to Medikart</Text>
                        <Text style={{fontSize:18, paddingVertical:10, alignSelf:'center', paddingHorizontal:10, textAlign:'center', color:'grey'}}>{'Book appointment with your favourite doctor'}</Text>
                    </View>
                    <View style={{bottom:150,position:'absolute',width:'100%' ,padding:10}}>
                        <Button label={'Get Started'} onPress={()=>navigate('loginScreen2')} style={{backgroundColor:'#0B3DA9'}} />
                    </View>
                </View>
      </ImageBackground>
    </View>
  )
}

export default Onboarding

const styles = StyleSheet.create({})
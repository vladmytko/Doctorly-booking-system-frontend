import { Image, ImageBackground, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Button from '../../components/Button/Button'
import { useNavigation } from '@react-navigation/native';
import GoogleSignIn from '../../components/GoogleSignIn';



const LoginScreen3 = () => {

  const [mobileNumber, setMobileNumber] = useState('');
  const {navigate} = useNavigation();
  
  const onPressLogin = useCallback(()=>{
    if(mobileNumber?.length === 10){
        navigate("OtpVerify", {mobileNumber:mobileNumber})
    }
  },[mobileNumber, navigate]);

  return (
    <View style={{flex:1}}>
      <View style={{flex:1, justifyContent: 'center', backgroundColor:'#0B3DA9'}}>     
            <View style={{flex:0.6,justifyContent:'center', marginTop: 50, alignItems:'center'}}>
                <Image source={require('../../assets/img/facility.png')} style={{width:'100%'}} resizeMode='contain'/>
            </View>

            <View style={{flex:0.45, backgroundColor:'white', borderTopLeftRadius:20, borderTopRightRadius:20}}>                    
                <View style={{justifyContent:'center', alignItems:'center'}}>
                    <Text style={{fontSize:24, fontWeight:'bold', paddingVertical:10}}>Login or Sign up</Text>
                </View>

                <View style={{flexDirection:'row', height:50, borderColor:'gray', borderWidth:1, alignItems:'center', margin:10, borderRadius:10}}>
                    <Text style={{fontSize:18, paddingHorizontal:10}}>{'+44'}</Text>
                    <TextInput style={{padding:10, fontSize:18}} onChangeText={setMobileNumber} keyboardType='numeric' placeholder='Phone Number' maxLength={10} />
                </View>

                <View style={{width:'100%',paddingVertical:15, paddingHorizontal:10}}>
                    <Button onPress={onPressLogin} label={'Login with mobile'} style={{backgroundColor:'#0B3DA9'}} />
                </View>
                
                <View style={{bottom:0,position:'absolute',width:'100%',paddingVertical:15, paddingHorizontal:10}}>
                    <GoogleSignIn />   
                 
                </View>
            </View>
        </View>
    </View>
  )
}

export default LoginScreen3

const styles = StyleSheet.create({})
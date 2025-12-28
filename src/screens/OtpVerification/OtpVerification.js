import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { OtpInput } from 'react-native-otp-entry'
import Button from '../../components/Button/Button';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../../context/AppProvider';

const OtpVerification = ({route}) => {

    const {mobileNumber} = route?.params;
    const [counter, setCounter] = useState(30);
    const {navigate} = useNavigation();
    const {values, setValues} = useAppContext();

    // const countDown = useCallback(()=>{
    //   if(counter > 0) {
    //     setCounter(counter-1);
    //   }
    // }, [counter]);

    // useEffect(()=>{
    //   const timer = setInterval(countDown,1000);
    //   return ()=> clearInterval(timer);
    // }, [counter]);

    useEffect(() => {
      const timer = setInterval(() => {
        setCounter(prev => {
          if (prev <= 0) {
            clearInterval(timer)
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return ()=> clearInterval(timer);
    }, []);

    const onChangeText = useCallback((text)=>{
        
    },[]);

    const onOTPFilled = useCallback((text)=>{
        console.log("Recived ",text);
        navigate("tabNavigator");

        setValues({
          ...values,
          isDoctor:true
        })
    },[]);

    const handleResend = useCallback(() => {
      setCounter(30);
    }, []);

  return (
    <View style={{flex:1, backgroundColor:'white'}}>
      <View style={{marginTop:20, justifyContent:'center', alignItems:'center'}}>
        <Text style={{fontSize:18}}>{"Verfication code is sent to"}</Text>
        <Text style={{fontSize:18, fontWeight:'bold'}}>+44{mobileNumber}</Text>
      </View>

      <View style={{marginTop:20}}>
        <OtpInput numberOfDigits={6} onTextChange={onChangeText} onFilled={onOTPFilled}/>
      </View>

      {/* {counter > 0 && <Text style={{alignSelf:'center', marginTop:20}}>Resend OTP in {counter}s</Text>}
      {counter <= 0 && <Button style={{backgroundColor:'gray'}}><Text style={{fontSize:18, color:'#0B3DA9'}}>{'Resend'}</Text></Button>} */}
      {counter > 0 && <Text style={{alignSelf:'center', marginTop:20}}>Resend OTP in {counter}s</Text>}

      {counter <= 0 && 
        <Button style={{backgroundColor:'gray'}} onPress={handleResend}>
          <Text style={{fontSize:18, color:'#0B3DA9'}}>{'Resend'}</Text>
        </Button>
      }
    </View>
  )
}

export default OtpVerification

const styles = StyleSheet.create({})
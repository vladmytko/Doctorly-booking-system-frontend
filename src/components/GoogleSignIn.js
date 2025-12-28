import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Button from './Button/Button';
import {GoogleSignin, isSuccessResponse} from '@react-native-google-signin/google-signin'
import { useNavigation } from '@react-navigation/native';
import { authenticate } from '../api/auth';
import * as Keychain from 'react-native-keychain';

const GoogleSignIn = () => {
  const {navigate} = useNavigation();

 GoogleSignin.configure({
    iosClientId:process.env.GOOGLE_AUTH_CLIENT_ID,
    webClientId:process.env.GOOGLE_AUTH_CLIENT_ID,
 })

  const signInWithGoogle = async ()=>{
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            console.log("response ",response);

            if(isSuccessResponse(response)){
              //If API Server not running bypass security
              // console.log("process.env.USE_MOCK_DATA",process.env);
              // if(process.env.USE_MOCK_DATA){
              //   navigate("tabNavigator");
              //   return Promise.resolve();
              // }

            //   authenticate(response.data).then(async (res)=>{
            //     await Keychain.setGenericPassword('authToken',res?.token);
            //     navigate("tabNavigator");
            //   }).catch((err)=>{
            //     console.log("Error ",err);
            //   })

            const idToken = response.data.idToken;

            await authenticate({ idToken }); // optional onboarding

            await Keychain.setGenericPassword('authToken', idToken);
            navigate('tabNavigator');
              
                //call our backend API to register or sign in
            }
        } catch (error) {
            console.log(error);
        }
  }
  return (
    <Button
      onPress={signInWithGoogle}
      style={{
        backgroundColor: 'white',
        flexDirection: 'row',
        gap: 4,
        borderColor: '#939393',
        borderWidth: 1,
      }}>
      <Image source={require('../assets/img/google_icon.png')} />
      <Text style={{color: 'black', fontSize: 18}}>Continue with Google</Text>
    </Button>
  );
};

export default GoogleSignIn;

const styles = StyleSheet.create({});

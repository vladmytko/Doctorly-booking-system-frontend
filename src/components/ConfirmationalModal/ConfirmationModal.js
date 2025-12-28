import {Image, Modal, StyleSheet, Text, View} from 'react-native';
import React, { useCallback } from 'react';
import Button from '../Button/Button';
import { COLORS } from '../../styles/color';
import { useNavigation } from '@react-navigation/native';

const ConfirmationModal = ({visible, onClose, modalText}) => {

  const {navigate} = useNavigation();

  const onPress = useCallback(()=>{
    onClose && onClose();
    navigate('tabNavigator');
  },[onClose,navigate]);
  
  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          onClose && onClose();
        }}>
        <View style={styles.container}>
          <View style={styles.modalView}>
            <View style={styles.imageContainer}>
                <Image source={require('../../assets/img/like.png')}/>
            </View>
            <View style={{alignItems:'center'}}>
                <Text style={{fontSize:28,paddingVertical:10,fontWeight:'400'}}>{'Thank You !'}</Text>
                <Text style={{fontSize:18,color:'gray'}}>{'Your Appointment Successful'}</Text>
                <Text style={{paddingVertical:10,fontSize:16,alignSelf:'center'}}>{modalText}</Text>
            </View>
            <View style={{width:'100%',bottom:20,position:'absolute'}}>
                <Button onPress={onPress} label={'Done'} style={{backgroundColor:COLORS.PRIMARY}}></Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 40,
    flex: 1,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    height: '80%',
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer:{
    backgroundColor:'#EDEDFC',
    height:120,
    width:120,
    borderRadius:'50%',
    alignItems:'center',
    justifyContent:'center'
  }
});

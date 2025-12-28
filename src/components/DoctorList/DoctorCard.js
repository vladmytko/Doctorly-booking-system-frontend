import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchSpecialityById } from '../../api/specialities';
const cardGap = 16;
const cardWidth = (Dimensions.get('window').width - cardGap * 3)/2;
const DoctorCard = ({id,name,image,specialityId,consultationFee,horizontal,style,imageStyle,displayAll,contentContainerStyle, ...props}) => {
  
  const {navigate} = useNavigation();
  const resolvedSpecialityId =
    specialityId ??
    props?.specialityId ??
    props?.doctor?.specialityId ??
    props?.speciality?.id ??
    null;

  const { data: speciality } = useQuery({
    queryKey: ['specialityById', resolvedSpecialityId],
    queryFn: () => fetchSpecialityById(resolvedSpecialityId),
    enabled: !!resolvedSpecialityId,
  });

  // Normalize id from various possible shapes, now including userId and more debug logs
  const resolvedId =
    id ??
    props?.id ??
    // props?.doctorId ??
    props?.userId ??
    // props?._id ??
    props?.doctor?.id ??
    null;
  if (__DEV__) {
    console.log('[DoctorCard] props snapshot:', props);
    console.log('[DoctorCard] incoming ids', {
      id,
      userId: props?.userId,
    });
    console.log('[DoctorCard] speciality ids', {
      resolvedSpecialityId
    });
  }

  const specialityTitle = speciality?.title || '';

  return (
    <TouchableOpacity
      onPress={() => {
        if (!resolvedId) {
          console.warn('[DoctorCard] Cannot navigate: missing doctor id. Props:', props);
          return;
        }
        console.log('Navigating with doctorId:', resolvedId);
        navigate('doctorDetails', {
          doctorId: resolvedId,
          doctor: { ...props, id: resolvedId, name, image, specialityId, consultationFee },
        });
      }}
      style={[styles.container, style]}
    >
      <Image source={{uri:image}} style={[styles.image,!horizontal?{height:220}:{},imageStyle]}/>
      <View style={[{flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap',padding:5},contentContainerStyle]}>
        <Text style={styles.nameText}>{name}</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:displayAll?8:2}}>
            <Image source={require('../../assets/img/star.png')} />
            <Text>{props.rating}</Text>
        </View>
        <View style={{flexDirection:'row',paddingVertical:5}}>
        {displayAll && <Text style={{paddingRight:10}}>{specialityTitle}</Text>}
        {!displayAll && <Text>Fee ₹{consultationFee}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default DoctorCard

const styles = StyleSheet.create({
    container:{
        borderTopLeftRadius:10,
        borderTopRightRadius:10,
        width:cardWidth,
    },
    image:{
        height:140,
        width:'100%',
        maxHeight:'100%',
        borderTopLeftRadius:10,
        borderTopRightRadius:10,
        resizeMode: 'cover'
    },
    nameText:{
        fontSize:16,
        fontWeight:'400',
        width:'70%'
    }
})
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import { COLORS } from '../../styles/color';

const Chip = ({name,description,index,onChange,selected}) => {


  const onPress = useCallback(()=>{
    onChange && onChange(index);
  },[index])
  return (
          <TouchableOpacity onPress={onPress}
           style={[styles.container,index === selected? {backgroundColor:COLORS.PRIMARY}:{}]}>
              <Text style={index === selected && {color:COLORS.SECONDARY}}>{name}</Text>
          </TouchableOpacity>
      )
}

export default Chip

const styles = StyleSheet.create({
    container:{
       
        backgroundColor:'#E9E9FE',
        padding:10,
        borderRadius:8,
        alignSelf:'center',
    }
})
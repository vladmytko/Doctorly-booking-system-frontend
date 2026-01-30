import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { COLORS } from '../../styles/color'

const SectionHeader = ({title, onPress}) => {
  return (
    <View style={styles.container}>
        <Text style={styles.textTitle}>{title}</Text>
        <TouchableOpacity onPress={onPress}><Text style={styles.textButton}>See all</Text></TouchableOpacity>
    </View>
  )
}

export default SectionHeader

const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        padding:10,
        justifyContent: 'space-between'
    },
    textTitle:{
        fontSize:20,
        fontWeight:'700',
        color: '#1c1c1E',
        letterSpacing: 0.3,
    },
    textButton:{
       fontSize: 20,
       fontWeight: '600',
       color: '#2F80ED'
    }
})
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { COLORS } from '../../styles/color'

const SectionHeader = ({title, onPress}) => {
  return (
    <View style={styles.container}>
        <Text style={styles.textButton}>{title}</Text>
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
        fontSize:18,
        fontWeight:'bold'
    },
    textButton:{
        color:COLORS.PRIMARY
    }
})
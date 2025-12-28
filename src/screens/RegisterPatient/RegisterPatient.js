import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const RegisterPatient = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your</Text>
      <Text style={styles.title}>Account</Text>
    </View>
  )
}

export default RegisterPatient

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    title: { fontSize: 35, fontWeight: '700', marginLeft: 20, backgroundColor: "gray"}
})
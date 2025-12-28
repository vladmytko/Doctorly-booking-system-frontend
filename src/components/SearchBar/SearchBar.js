import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'
import Button from '../Button/Button'
import { useNavigation } from '@react-navigation/native';

const SearchBar = ({onChange, value, placeholder= 'Search Doctor'}) => {

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Button onPress={()=> navigation.goBack()} style={styles.backButton}><Text>Back</Text></Button>
      
      <TextInput 
        style={styles.input} 
        placeholder={placeholder}
        clearButtonMode='always' 
        autoCapitalize='none' 
        autoCorrect={false} 
        onChangeText={onChange}
      />
    </View>
  );
};

export default SearchBar

const styles = StyleSheet.create({
    container:{
        backgroundColor:'white',
        flexDirection:'row',
        borderRadius:10,
        margin:10,
        height:48,
        width:'95%',
        alignItems:'center',
        marginTop: 80
    },
    backButton:{
      paddingHorizontal:10
    },
    input:{
      width:'80%'
    }
})
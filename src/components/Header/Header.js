import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS } from '../../styles/color'
import Button from '../Button/Button'
import { useNavigation } from '@react-navigation/native'
import { useAppContext } from '../../context/AppProvider'

const Header = () => {

  const { profile } = useAppContext();  

  const {navigate} = useNavigation(); 

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <View style={{flexDirection:'row'}}>
            <Image 
                style={styles.image} 
                source={profile?.imageUrl ? {uri: profile.imageUrl } : require('../../assets/img/avatar.png')
            }
            onError={(e) => 
                console.log('[Header] Failed to load profile image:', profile?.imageUrl, e?.nativeEvent)
            }
            
            />
            <View style={styles.bio}>
                <Text style={styles.text}>Welcome</Text>
                    <Text style={[styles.text,{paddingTop:5}]}> 
                        {profile?.firstName || profile?.lastName
                        ? `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim()
                        : 'Loading...'}
                </Text>
            </View>
        </View>

        <View style={styles.bellIcon}>
            <Button>
                <Image source={require('../../assets/img/icon.png')} />
            </Button>
        </View>
      </View>
      
        <TouchableOpacity onPress={()=> navigate("searchScreen")} style={styles.searchBar}>
            <Image style={styles.searchImage} source={require('../../assets/img/search.png')}/>
            <Text style={styles.searchText}>{'Search doctor'}</Text>
        </TouchableOpacity>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
    container:{
        height:170,
        backgroundColor: COLORS.PRIMARY
    },
    profile:{
        padding:20,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    image:{
        height:48,
        backgroundColor:'gray',
        width: 48,
        borderRadius:50,
        alignSelf:'center'
    },
    bio:{
        flexDirection:'column',
        paddingLeft:10,
        paddingTop:5
    },
    text:{
        color:COLORS.SECONDARY,
        fontSize:18
    },
    bellIcon:{
        alignSelf:'center'
    },
    searchBar:{
        flexDirection:'row',
        borderWidth:0.5,
        height:45,
        borderRadius:20,
        margin: 10,
        borderColor:'#EDEDFC'                                        
    },
    searchImage:{
        alignSelf: 'center',
        marginHorizontal: 10
    },
    searchText:{
        alignSelf:'center',
        fontSize: 16,
        color:COLORS.SECONDARY
    }
})
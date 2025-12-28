import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import { symptomsList } from './constants'
import { COLORS } from '../../styles/color';


const Categories = ({onChangeCategory}) => {

  const [selected, setSelected] = useState(0);

  const onPress = useCallback((index)=>{
    setSelected(index)
    onChangeCategory && onChangeCategory(index);
  },[])
    
  const RenderItem = ({name,description,index})=>{
    return(
        <TouchableOpacity onPress={()=> onPress(index)} 
        style={[styles.categoryItem, index === selected? {backgroundColor:COLORS.PRIMARY}:{}]}>
            <Text style={index === selected && {color:COLORS.SECONDARY}}>{name}</Text>
        </TouchableOpacity>
    )
  }

  return (
    <View>
      <FlatList 
        data={symptomsList}
        horizontal={true}
        style={styles.flatList}
        contentContainerStyle={{gap:8}}
        showsHorizontalScrollIndicator={false}
        renderItem={({item,index})=> <RenderItem {...item} index={index} key={index}/> }
      />
    </View>
  )
}

export default Categories

const styles = StyleSheet.create({
    flatList:{
        padding:10
    },
    categoryItem:{
        backgroundColor:'#E9E9FE',
        padding:10,
        borderRadius:8,
        alignSelf:'center'
    }
})
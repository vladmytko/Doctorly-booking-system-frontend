import { View, Text, StyleSheet, FlatList, Image } from 'react-native'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchDoctors, fetchDoctorsBySpeciality } from '../../api/doctors'
import DoctorCard from './DoctorCard'
import Button from '../Button/Button'
import { useNavigation, useRoute } from '@react-navigation/native'

const DoctorList = ({
    horizontal,
    // optional speciality filter
    specialityTitle, // prefer this name; we will also accept legacy `speciality` from route
    // data fetching controls
    queryKey,
    queryFn,
    fetchBySpeciality = fetchDoctorsBySpeciality,
    showHeader,
    ListEmptyComponent
}) => {
    const navigation = useNavigation();
    
    const route = useRoute();
    const params = route?.params || {};
    console.log('[DoctorList] ROUTE:', route )
    console.log('[DoctorList] ROUTE?.PARAMS:', route?.params )
    console.log('[DoctorList] SPECIALITY_TITLE:', route?.params?.specialityTitle )
    console.log('[DoctorList] SPECIALITY_ID:', route?.params?.specialityId )  

    const titleFilter = route?.params?.specialityTitle;
    const specialityId = route?.params?.specialityId;

    const computedQueryKey = specialityId
      ? ['doctors', 'bySpecialityId', String(specialityId)]
      : titleFilter
        ? ['doctors', 'bySpecialityTitle', String(titleFilter)]
        : ['doctors', 'all'];

    const effectiveQueryFn = queryFn
      ? queryFn
      : specialityId
        ? () => fetchBySpeciality({ specialityId })
        : titleFilter
          ? () => fetchBySpeciality({ specialityTitle: titleFilter })
          : fetchDoctors;

    console.log('[DoctorList] props:', { specialityId, specialityTitle: titleFilter, horizontal });
    console.log('[DoctorList] queryKey:', computedQueryKey);
    console.log('[DoctorList] using fetcher:', queryFn ? 'custom queryFn' : (specialityId ? 'fetchBySpeciality (by id)' : (titleFilter ? 'fetchBySpeciality (by title)' : 'fetchDoctors (all)')));

    const { data, isLoading, error } = useQuery({
        queryKey: computedQueryKey,
        queryFn: effectiveQueryFn,
        keepPreviousData: true,
    });

    console.log('[DoctorList] raw query result:', { data, isLoading, error });
    if (Array.isArray(data)) {
      console.log('[DoctorList] data is array, length:', data.length);
    } else if (data && typeof data === 'object') {
      console.log('[DoctorList] data keys:', Object.keys(data));
      if (Array.isArray(data.content)) {
        console.log('[DoctorList] data.content length:', data.content.length);
      }
    }

    const listData = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
    
    return (
        <View style={styles.container}>
            {/* {(showHeader ?? !horizontal) && (
                <View style={styles.header}>
                    <Button onPress={() => navigation.goBack()}><Image source={require('../../assets/img/back.png')} /></Button>
                </View>
            )} */}
            {isLoading && (
                <View style={{ padding: 16 }}>
                    <Text>Loading doctors… {specialityId ? `(by id)` : titleFilter ? `(by title)` : `(all)`}</Text>
                </View>
            )}
            {!!error && (
                <View style={{ padding: 16 }}>
                    <Text>Failed to load doctors. Check logs.</Text>
                </View>
            )}
            <FlatList
                data={listData}
                showsHorizontalScrollIndicator={false}
                horizontal={horizontal}
                numColumns={!horizontal && 2}
                columnWrapperStyle={!horizontal && { justifyContent: 'space-between', flex: 1, gap: 16 }}
                contentContainerStyle={{ gap: 16 }}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => <DoctorCard horizontal={horizontal} key={item.id} {...item} />}
                ListEmptyComponent={ListEmptyComponent}
            />
        </View>
    )
}

export default DoctorList

const styles = StyleSheet.create({
    container:{
        padding:8,
        flex:1,
        backgroundColor:'white'
    },
    header:{flexDirection:'row',backgroundColor:'white',height:60,paddingHorizontal:5}
})
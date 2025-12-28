/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { View } from 'react-native';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navigation from './Navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './src/store/store'
import { Provider } from 'react-redux';
import AppProvider from './src/context/AppProvider';

const queryClient = new QueryClient();

function App(): React.JSX.Element {

  const [values,setValues] = useState({isDoctor:false});

  return (
    <View style={{flex:1}}>
    <SafeAreaView style={{flex:0,backgroundColor:'#0B3DA9'}}/>
    <SafeAreaView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
         <AppProvider values={{values,setValues}}>
         <Navigation />
         </AppProvider>
        </Provider>
      </QueryClientProvider>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

export default App;

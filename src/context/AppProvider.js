import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext({
    values:{},
    setValues:(value)=>{}
});

export const useAppContext = ()=> React.useContext(AppContext);

const AppProvider = ({children,values}) => {
  return (
    <AppContext.Provider value={values}>
        {children}
    </AppContext.Provider>
  )
}

export default AppProvider
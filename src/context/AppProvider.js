import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const useAppContext = () => useContext(AppContext);

const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null); // patient or doctor

  return (
    <AppContext.Provider value={{
      currentUser, 
      setCurrentUser,
      profile,
      setProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
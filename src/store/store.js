import { combineReducers, configureStore } from "@reduxjs/toolkit";
import appointmentReducer from './features/appointment'

const rootReducer = combineReducers({
    appointment : appointmentReducer,
});

const store = configureStore({
    reducer: rootReducer
});

export default store;
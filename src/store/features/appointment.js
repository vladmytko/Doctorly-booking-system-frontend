import { createSlice } from "@reduxjs/toolkit";

const initialState ={
    appointments:[

    ]
}

const appointmentSlice = createSlice({
    name:'appointment',
    initialState, 
    reducers:{
        setAppointment:(state,action)=>{
            const data = [...state.appointments,action.payload];
            return{
                ...state,
                appointment:data
            }
        },
        resetAppointments : (state,action)=>{
            state.appointments = initialState.appointments;
        },
        updateAppointment : (state,action)=>{
            return {
                ...state, 
                appointments:state.appointment.forEach((appointment)=>{
                    if(appointment.id === action.payload?.id){
                        return action.payload;
                    }
                    else {
                        return appointment;
                    }
                })
            }
        }
    }
})

export const { setAppointment, resetAppointments, updateAppointment} = appointmentSlice.actions;
export default appointmentSlice.reducer;
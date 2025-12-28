import React from "react"
import LinearGradient from "react-native-linear-gradient"

export default function Background({ children }) {
    return (
        <LinearGradient
            colors={['#B6202A', '#14002E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            {children}
        </LinearGradient>
    )
}
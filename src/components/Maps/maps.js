import { Linking, Platform } from "react-native";

export async function OpenClinicInMaps(clinic) {
    if (!clinic) throw new Error("Clinic is required");

    const {
        name, 
        address,
        postCode,
        latitude,
        longitude
    } = clinic;

    // Build a strong query to reduce ambiguity (name + address + postcode)
    const query = encodeURIComponent( 
    [name, address, postCode].filter(Boolean).join(", ")
    );

    // Coordinate fallback (reliable exact spot)
    const hasCoords = 
        typeof latitude === 'number' && 
        typeof longitude === 'number' && 
        !Number.isNaN(latitude) &&
        !Number.isNaN(longitude);
    
    let url;
    




    if(Platform.OS === 'ios'){
        // Apple Maps: search by text; include ll if you have coords for better focus
        url = hasCoords
         ? `http://maps.apple.com/?q=${query}&ll=${latitude},${longitude}`
         : `http://maps.apple.com/?q=${query}`;
    } else if (Platform.OS === 'android') {

    }

    // Open the URL
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen){
        //As a last resort, try opening without canOpenUrl (some android setupcs can be weird)
        await Linking.openURL(url)
        return;
    }
    await Linking.openURL(url);
}
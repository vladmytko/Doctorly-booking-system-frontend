import { FlatList, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client';
import {mediaDevices, RTCPeerConnection, RTCSessionDescription} from 'react-native-webrtc';
import CallScreen from './CallScreen';
const SERVER_URL= 'http://localhost:8082';
const AudioCall = ({route}) => {

  const {doctorId,userId,isDoctor} = route.params;

  const socket = useRef(null);
  const [users,setUsers] = useState([]);
  const [incomingCall,setIncomingCall] = useState(null);
  const [callStatus,setCallStatus] = useState();
  const peerConnection = useRef(null);
  const [callActive,setCallActive] = useState(false);
  const [registered,setRegistered] = useState(false);
  const [remoteUserId,setRemoteUserId] = useState();
  const [localStream, setLocalStream] = useState(null);
  const [calling,setCalling] = useState(false);
  const [speakerOn,setSpeakerOn] = useState(false);
  const [micOn,setMicOn] = useState(true);
  const remoteStream = useRef(null);

  console.log("user list",users);

  useEffect(()=>{
    socket.current = io(SERVER_URL);
    socket.current.on('users_list',(userList)=>{
      const filterUser = userList.filter((user)=> user.socketId !== socket.current.id);
      setUsers(filterUser);
    });

    socket.current.on('incoming_call', (data) => {
      console.log('Incoming call:', data);
      setIncomingCall(data);
      setCalling(true);
      setCallStatus('Incoming call...');
    });

    socket.current.on('call_accepted', (signal) => {
      console.log('call accepted :', signal);
      setCallActive(true);
      setCallStatus('Connected');

      // Set remote description when call is accepted
      const desc = new RTCSessionDescription(signal);
      peerConnection.current.setRemoteDescription(desc)
        .catch(err => console.error("Error setting remote description:", err));
    });

    socket.current.on('call_rejected', (data) => {
      setCalling(false);
      setCallStatus(`Call rejected: ${data.reason}`);
      cleanupCall();
    });

    socket.current.on('call_ended', () => {
      setCallStatus('Call ended');
      setCalling(false);
      cleanupCall();
    });

    socket.current.on('ice_candidate', (candidate) => {
      // Add received ICE candidate
      if (peerConnection.current) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(err => console.error("Error adding received ICE candidate:", err));
      }
    });

    

    // Cleanup function
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
      cleanupCall();
    };
    
  },[userId,doctorId,isDoctor]);

  useEffect(()=>{
    registerUser();
  },[]);

  const registerUser = ()=>{
    let id = isDoctor ? doctorId :userId;
    socket.current.emit('register',id);
    setRegistered(true);
  }

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        return (
          granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.error('Failed to request permissions:', err);
        return false;
      }
    } else {
      return true; // iOS will prompt for permissions automatically
    }
  };

  const initializeMedia = async ()=>{
    try {
      const hasPermission = await requestPermissions();

      if (!hasPermission) {
        setCallStatus('Permission denied');
        return null;
      }

      // Get user media - audio only for voice calls
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setCallStatus('Failed to access microphone');
      return null;
    }
  }

  const initializePeerConnection = (stream)=>{
    const configuration = {
      iceServers:[
        {
          urls:['stun:stun.l.google.com:19302']
        }
      ]
    };

    const pc= new RTCPeerConnection(configuration);
    stream.getTracks().forEach(track=>{
      pc.addTrack(track,stream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit('ice_candidate', {
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = (event) => {
      switch (pc.connectionState) {
        case 'connected':
          setCallStatus('Connected');
          break;
        case 'disconnected':
        case 'failed':
          setCallStatus('Connection failed or disconnected');
          cleanupCall();
          break;
        case 'closed':
          setCallStatus('Connection closed');
          cleanupCall();
          break;
      }
    };

    // Handle incoming tracks (remote audio)
    pc.ontrack = (event) => {
      remoteStream.current = event.streams[0];
    };

    return pc;

  }

  const makeCall = async (userId)=>{
      try{
        setCalling(true);
        setCallStatus('Intiliazing Calling..');
        setRemoteUserId(userId);

        //Initialize media and peer connection
        const stream = await initializeMedia();
        if(!stream) return;

        peerConnection.current = initializePeerConnection(stream);

        const offer = await peerConnection.current.createOffer({
          offerToReceiveAudio:true,
          offerToReceiveVideo:false
        });
        await peerConnection.current.setLocalDescription(offer);

        socket.current.emit('call_user',{
          userToCall:userId,
          from:socket.current.id,
          signal : peerConnection.current.localDescription,
        });
        setCallStatus('Calling..');

      }
      catch(e){
        console.log("Error making call ",err);
        setCallStatus("Call failed");
      }
  }

  const answerCall = async ()=>{
    try {
      setCallStatus('Connecting..');
      console.log("incomingCall",incomingCall);
      setRemoteUserId(incomingCall?.from);

      //Intialize media and peer connect connection
      const stream = await initializeMedia();
      if(!stream) return;

      peerConnection.current = initializePeerConnection(stream);
      console.log("incomingCall",incomingCall);
      const desc = new RTCSessionDescription(incomingCall?.signal);
      console.log("desc",desc);
      await peerConnection.current.setRemoteDescription(desc);

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.current.emit('answer_call',{
        to:incomingCall?.from,
        signal:peerConnection.current.localDescription,
      });

      setCallActive(true);
      setIncomingCall(null);
      setCallStatus('Connected');
      
    } catch (error) {
      console.error(error);
    }
  }

  const cleanupCall = ()=>{
      if(peerConnection.current){
        peerConnection.current.close();
        peerConnection.current = null;
      }

      if(localStream){
        localStream.getTracks().forEach(track=> track.stop());
        setLocalStream(null);
      }

      setCallActive(false);
      setRemoteUserId(null);
      setIncomingCall(null);
      setCalling(false);
  }

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => makeCall(item.socketId)}
      disabled={callActive}
    >
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.callButton}>Call</Text>
    </TouchableOpacity>
  );
  const rejectCall = ()=> {
      setCalling(false);
      socket.current.emit('reject_call',{
          from:incomingCall?.from,
          reason:'User Busy',
      });
      setIncomingCall(null);
      setCallStatus('');

  }

  const endCall = () => {
    setCalling(false);
    if (remoteUserId) {
      socket.current.emit('end_call', { to: remoteUserId });
    }
    cleanupCall();
  };

  return (
    <View style={styles.container}>
      {!calling && <View style={styles.usersContainer}>
              <Text style={styles.subtitle}>Available Users</Text>
              {users?.length > 0 ? (
                <FlatList
                  data={users}
                  renderItem={renderUserItem}
                  keyExtractor={(item) => item.socketId}
                />
              ) : (
                <Text style={styles.noUsersText}>No users available</Text>
              )}
            </View>
      }
      {calling && <CallScreen callActive={callActive} callStatus={callStatus} answerCall={answerCall} rejectCall={rejectCall} isIncoming={incomingCall} doctorId={doctorId} userId={userId} isDoctor={isDoctor} endCall={endCall}/>}
    </View>
  )
}

export default AudioCall

const styles = StyleSheet.create({
  container:{
    flex:1
  },
  usersContainer: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  callButton: {
    color: '#2196F3',
    fontWeight: '600',
  },
})
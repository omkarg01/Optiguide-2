import React, { useState, useEffect } from 'react';
// import * as firebase from "firebase/app";
import 'firebase/firestore';
import { db } from "../../firebase/index";

const ChatApp = () => {
    // State for input values
    const [senderUid, setSenderUid] = useState('');
    const [receiverUid, setReceiverUid] = useState('');
    const [roomId, setRoomId] = useState('');

    // State for displaying new messages
    const [newMessage, setNewMessage] = useState('');

    // Initialize Firebase app
    //   useEffect(() => {
    //     const firebaseConfig = {
    //       // Your Firebase config
    //     };
    //     firebase.initializeApp(firebaseConfig);
    //   }, []);

    // Function to send roomId to the receiver
    const sendRoomIdViaChat = () => {
        if (senderUid && receiverUid && roomId) {
            db.collection('messages').add({
                senderUid: senderUid,
                receiverUid: receiverUid,
                roomId: roomId,
                // timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log('Room ID sent successfully!');
            }).catch((error) => {
                console.error('Error sending Room ID:', error);
            });
        } else {
            console.error('Sender UID, Receiver UID, and Room ID are required.');
        }
    };

    // Function to listen for new chat messages
    const listenForNewMessages = () => {
        db.collection('messages')
            .where('receiverUid', '==', receiverUid)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const message = change.doc.data();
                        const roomId = message.roomId;
                        setNewMessage(`Received Room ID: ${roomId}`);
                    }
                });
            });
    };

    return (
        <div>
            <h1>Chat App</h1>

            <label htmlFor="senderUid">Sender UID:</label>
            <input type="text" id="senderUid" value={senderUid} onChange={(e) => setSenderUid(e.target.value)} /><br />

            <label htmlFor="receiverUid">Receiver UID:</label>
            <input type="text" id="receiverUid" value={receiverUid} onChange={(e) => setReceiverUid(e.target.value)} /><br />

            <label htmlFor="roomId">Room ID:</label>
            <input type="text" id="roomId" value={roomId} onChange={(e) => setRoomId(e.target.value)} /><br />

            <button onClick={sendRoomIdViaChat}>Send Room ID</button>

            <div id="messageDisplay">{newMessage}</div>
        </div>
    );
};

export default ChatApp;

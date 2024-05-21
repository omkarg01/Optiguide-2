import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db, app } from "../../firebase";
import { schemas } from "../../firebase/configs";
import { getUserUid, updateUserInDB, updateUserInfo } from "../../firebase/firebaseActions";
import { getLSValue } from "../../utils/localstorage";
import { useDispatch, useSelector } from "react-redux";
// import * as firebase from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
// import { setUserDetails } from "../../redux/actions/userActions";

// Initialize WebRTC
const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);

function Videos() {
  const [roomId, setRoomId] = useState("");
  const [userdata, setUserdata] = useState()
  const user = useSelector(state => state.user.userDetails);
  const dispatch = useDispatch();

  const localRef = useRef();
  const remoteRef = useRef();

  useEffect(() => {
    let userOBJ = typeof user === 'string' ? JSON.parse(user) : user;
    // if (typeof user === 'string') {
    //   console.log("string");
    setUserdata(userOBJ);
    console.log(userOBJ);
    // } else {
    //   setUserdata(user);
    //   console.log(user);
    // }

    let database = getDatabase(app);

    let databaseRef = ref(database, 'users/8wsmxgkiH5qFNTGmWzMm');
    console.log("databaseRef", databaseRef);

    onValue(databaseRef, (snapshot) => {
      const data = snapshot.val();
      console.log("onValue", data); // Handle the data update here
    });

  }, [])

  const setupSources = async (mode) => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const remoteStream = new MediaStream();

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    localRef.current.srcObject = localStream;
    remoteRef.current.srcObject = remoteStream;

    if (mode === "create") {
      const callCollection = collection(db, schemas.calls);
      const callDoc = doc(callCollection);
      const offerCandidates = collection(callDoc, "offerCandidates");
      const answerCandidates = collection(callDoc, "answerCandidates");
      const callInvitationsCollectionRef = collection(db, 'callInvitations');

      setRoomId(callDoc.id);

      try {
        console.log("userdata", userdata.nearestVolunteer);
        const volunteer = await getUserUid(userdata.nearestVolunteer);
        console.log("volunteer", volunteer);
        await updateUserInDB({ ...volunteer, roomID: callDoc.id })
        console.log("Room Id updated successfully!");

        sendCallInvitation(userdata.uid, userdata.nearestVolunteer, callInvitationsCollectionRef, callDoc.id);

      } catch (e) {
        throw e;
      }

      pc.onicecandidate = async (event) => {
        event.candidate &&
          (await addDoc(offerCandidates, event.candidate.toJSON()));
      };

      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      await setDoc(callDoc, { offer });

      onSnapshot(callDoc, (snapshot) => {
        const data = snapshot.data();
        console.log("Hi", data);
        if (!pc.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
      });

      onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          console.log("ID", change);
          if (change.type === "added") {
            console.log(change.doc.data());
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
      });
    } else if (mode === "join") {
      const id = prompt("Enter Id");
      setRoomId(id);
      const callDoc = doc(collection(db, schemas.calls), id);
      const offerCandidates = collection(callDoc, "offerCandidates");
      const answerCandidates = collection(callDoc, "answerCandidates");

      pc.onicecandidate = async (event) => {
        event.candidate &&
          (await addDoc(answerCandidates, event.candidate.toJSON()));
      };

      const callData = (await getDoc(callDoc)).data();
      console.log(callData);
      const offerDescription = callData.offer;
      await pc.setRemoteDescription(
        new RTCSessionDescription(offerDescription)
      );

      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await updateDoc(callDoc, { answer });

      onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            let data = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    }

    pc.onconnectionstatechange = (event) => {
      if (pc.connectionState === "disconnected") {
        hangUp();
      }
    };
  };



  const sendCallInvitation = async (currentUserUid, receiverUid, callRef, roomId) => {
    const invitationData = {
      callerUid: currentUserUid, // Assuming you have the caller's UID
      receiverUid: receiverUid,
      roomId: roomId
    };

    console.log("invitationData", invitationData);
    await addDoc(callRef, invitationData);
  };

  async function deleteSubcollection(collectionRef) {
    const subcollectionQuery = query(collectionRef);
    const subcollectionDocs = await getDocs(subcollectionQuery);

    // Delete all documents in the subcollection
    subcollectionDocs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    return true;
  }

  const hangUp = async () => {
    if (roomId) {
      pc.close();
      let roomRef = doc(collection(db, schemas.calls), roomId);
      try {
        await deleteSubcollection(collection(roomRef, "answerCandidates"));
        await deleteSubcollection(collection(roomRef, "offerCandidates"));
        await deleteDoc(roomRef);
      } catch (e) {
        console.log(e);
      }
      window.location.reload();
    }
  };
  console.log(roomId);


  return (
    <div className="videos">
      <video
        ref={localRef}
        autoPlay
        playsInline
        className="local"
        muted
        height={100}
      />
      <video ref={remoteRef} autoPlay playsInline className="remote" />

      <div className="modalContainer">
        <div className="modal">
          <h3>Turn on your camera and microphone and start the call</h3>
          <div className="container">
            <button onClick={hangUp} className="secondary">
              Cancel
            </button>
            <button onClick={() => setupSources("create")}>Start</button>
            <button onClick={() => setupSources("join")}>Join</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Videos;

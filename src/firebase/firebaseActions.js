import {
  query,
  getDocs,
  collection,
  where,
  addDoc,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";
import { db } from ".";
import { schemas } from "./configs";

// Function to send the roomId to the receiver via chat message
export const sendRoomIdViaChat = async (senderUid, receiverUid, roomId) => {
  try {
    // Add a new document with the message data
    await db.collection("messages").add({
      senderUid: senderUid,
      receiverUid: receiverUid,
      roomId: roomId,
      // timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("Room ID sent successfully!");
  } catch (error) {
    console.error("Error sending Room ID:", error);
  }
}

// Function to listen for new chat messages
export const listenForNewMessages = (receiverUid) => {
  db.collection("messages")
    .where("receiverUid", "==", receiverUid)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const message = change.doc.data();
          const roomId = message.roomId;
          console.log("Received Room ID:", roomId);
          // Now you have the roomId, you can use it to join the call or perform any other action
        }
      });
    });
}


export const getAllVolunteers = async () => {
  // const q = query(collection(db, schemas.users));
  const q = query(collection(db, schemas.users), where("isVolunteer", "==", true));
  const querySnapshot = await getDocs(q);

  const users = [];
  querySnapshot.forEach((doc) => {
    users.push(doc.data());
  });

  return users;
};

export const getAllUsers = async (user) => {
  // const q = query(collection(db, schemas.users));
  const q = query(collection(db, schemas.users));
  const querySnapshot = await getDocs(q);

  const users = [];
  
  querySnapshot.forEach((doc) => {
    users.push(doc.data());
  });

  return users;
};

export const getUserUid = async (uid) => {
  const q = query(collection(db, schemas.users), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);

  const users = [];
  // console.log("querySnapshot", querySnapshot);
  console.log("qS", querySnapshot.docs[0].id);
  querySnapshot.forEach((doc) => {
    users.push(doc.data());
  });

  return users[0];
}

export const addUserInDB = async (user) => {
  if (!user) throw "Add user info object";

  const q = query(collection(db, schemas.users), where("uid", "==", user.uid));
  const docs = await getDocs(q);

  if (docs.docs.length === 0) {

    await addDoc(collection(db, schemas.users), {
      ...user,
    });

  } else {
    //user trying diffrent way of login, toggle isVolunteer
    const existingUser = docs.docs[0].data();
    const refId = docs.docs[0].id;
    if (existingUser.isVolunteer !== user.isVolunteer) {
      updateUserInfo(refId, { isVolunteer: user.isVolunteer });
    }
  }
};

export const updateUserInDB = async (user) => {
  if (!user) throw "Add user info object";

  const q = query(collection(db, schemas.users), where("uid", "==", user.uid));
  const docs = await getDocs(q);

  console.log('db updating...');
  // const existingUser = docs.docs[0].data();
  const refId = docs.docs[0].id;
  console.log("doc refId", refId);
  updateUserInfo(refId, user);
};

export const updateUserInfo = async (refId, updateInfo) => {
  const userRef = doc(db, schemas.users, refId);
  console.log("user refId", userRef);
  await updateDoc(userRef, {
    ...updateInfo,
  });
};

export const deleteUserByUid = async (uid) => {
  if (!uid) throw "Provide UID of the user to delete";

  const q = query(collection(db, schemas.users), where("uid", "==", uid));
  const docs = await getDocs(q);

  if (docs.docs.length === 0) {
    throw "User not found";
  } else {
    const docId = docs.docs[0].id;
    await deleteDoc(doc(db, schemas.users, docId));
  }
};
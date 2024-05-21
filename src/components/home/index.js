import React, { useEffect, useState } from "react";
import VideoCall from "../videoCall";
import "./style.css"; // import the CSS file
import { deleteUserByUid, getAllUsers, getAllVolunteers, getUserUid, updateUserInDB } from "../../firebase/firebaseActions";
import { getLSValue } from "../../utils/localstorage";
import ChatApp from "../chatApp";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails } from "../../redux/actions/userActions";

const Home = () => {
  const [uid, setUid] = useState("");
  const [userdata, setUserdata] = useState()
  const user = useSelector(state => state.user.userDetails);
  const dispatch = useDispatch();
  const [roomId, setRoomId] = useState("")

  useEffect(() => {
    let userOBJ = typeof user === 'string' ? JSON.parse(user) : user;

    setUserdata(userOBJ);
    console.log(userOBJ);
    getUsers(userOBJ);
    getRoomId(userOBJ.uid)

  }, [])

  const getRoomId = async (uid) => {
    console.log("uid", uid);
    const currentVolunteer = await getUserUid(uid);
    console.log("currentVolunteer", currentVolunteer);
    setRoomId(currentVolunteer.roomID)
    // return currentVolunteer.roomID;
  }

  const getUsers = async (currentUser) => {
    try {
      const users = await getAllVolunteers();
      // const users = await getAllUsers();
      console.log("getAllVolunteers", users);
      // setUserdata(users);
      console.log("getUsers", currentUser);
      let user = findNearestVolunteer(users, currentUser)

      let userObj = { ...currentUser, nearestVolunteer: user.uid }
      dispatch(setUserDetails(userObj))

    } catch (e) {
      throw e;
    }
  }

  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371.0; // Earth radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  }

  const findNearestVolunteer = (users, currentUser) => {

    // Sender's coordinates
    const senderLat = currentUser.latitude;
    const senderLon = currentUser.longitude;

    console.log("senderLat", senderLat, "senderLon", senderLon);
    // User data
    // const users = [
    //   {
    //     authProvider: "google",
    //     email: "goshs91439@gmail.com",
    //     isVolunteer: true,
    //     name: "Suman ghosh CS",
    //     photo: "https://lh3.googleusercontent.com/a/AGNmyxYlj_iH51UkNZ5WUlRKSC8MDM82OM1ONYUhh3qw=s96-c",
    //     uid: "cahqSwjkrVMfvPzbZ4Pi9yefs7n1",
    //     latitude: 12.234565,
    //     longitude: 85.125636
    //   },
    //   // Add more users as needed
    // ];

    // Initialize variables for nearest user
    let minDistance = Infinity;
    let nearestUser = null;

    // Calculate distance for each user
    for (const user of users) {
      if (user.latitude !== undefined && user.longitude !== undefined) {
        const distance = haversine(senderLat, senderLon, user.latitude, user.longitude);
        if (distance < minDistance) {
          minDistance = distance;
          nearestUser = user;
        }
      }
    }

    // Output nearest user
    if (nearestUser !== null) {
      console.log("uid", nearestUser.uid);
      console.log(`The nearest user to the sender is ${JSON.stringify(nearestUser)} with a distance of ${minDistance.toFixed(2)} kilometers.`);
      return nearestUser;
    } else {
      console.log("No user found.");
    }

  }


  const handleDelete = async () => {
    try {
      await deleteUserByUid(uid);
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };




  return (
    <div className="home-container">
      <button className="call-button">
        <span className="call-label">Instant call to volunteer</span>
        <div className="phone-icon">
          <i className="fa-solid fa-phone-volume "></i>
        </div>
        <p className="call-msg">Use this whenever you need any instant help</p>
      </button>
      {/* 
      <button onClick={getUsers}>Get All Volunteers from DB</button>

      <label htmlFor="uidInput">Enter UID:</label>
      <input
        type="text"
        id="uidInput"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
      />
      <button onClick={handleDelete}>Delete User</button> */}

      <button className="talk-button">
        <div className="talk-button-labels">
          <p className="call-label">Call Someone to Talk </p>
          <p className="call-msg">
            Call and connect when feeling alone.
          </p>
        </div>
        <div className="phone-icon">
          <i className="fa-solid fa-user-group"></i>
        </div>
      </button>
      <div>
        <p><span>(Refresh the page to see the updated room id)</span></p>
        <h3>Room ID : </h3>
        {userdata?.isVolunteer && roomId ? roomId : "Create A New Room"}
      </div>
      <VideoCall />
    </div>
  );
};

export default Home;

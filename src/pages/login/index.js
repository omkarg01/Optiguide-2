import { GoogleAuthProvider } from "firebase/auth";
import React from "react";
import { addUserInDB, GSignin } from "../../firebase";
import logo from "../../assets/logo.png";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../../redux/actions/userActions";
import { setIsLoggedIn } from "../../redux/actions/authActions";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { getUserUid } from "../../firebase/firebaseActions";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleSignIn = async (config) => {
    const { isVolunteer = false } = config || {};
    try {

      GSignin()
        .then(async (result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          const user = result.user;
          console.log("user signing", user);
          const { displayName: name, email, photoURL: photo, uid } = user || {};

          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            console.log('latitude', latitude, 'longitude', longitude);
            // this.lat = latitude;
            // this.long = longitude;.
            // location = { latitude, longitude }

            // console.log("userdata", userdata.nearestVolunteer);
            const volunteer = await getUserUid(uid);
            console.log("volunteer", volunteer);
            // await updateUserInDB({ ...volunteer, roomID: callDoc.id })
            const userInfo = {
              uid,
              name,
              email,
              photo,
              isVolunteer,
              authProvider: "google",
              latitude,
              longitude,
              roomID: volunteer["roomID"],
            };

            dispatch(setIsLoggedIn(token));
            dispatch(setUserDetails(userInfo));

            try {
              await addUserInDB(userInfo);
            } catch (e) {
              throw e;
            }

            navigate("/", {
              replace: true,
            });
          }
          )

        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="login-container">
      <div className="login-logo-container">
        <img src={logo} alt="OptiGuide Logo" />
        <h1>OptiGuide</h1>
        <p>
          We help visual impared people to connect with volunteers around them
        </p>
      </div>
      <div className="google-signin-container">
        <button
          className="google-signin-button"
          onClick={() => handleGoogleSignIn()}
        >
          Sign in as Visual Impared
        </button>
        <button
          className="google-signin-button"
          onClick={() => handleGoogleSignIn({ isVolunteer: true })}
        >
          Sign in as Volunteer
        </button>
        <p className="privacy-policy-text">
          By signing in, you agree with our{" "}
          <a href="#" target="_blank" rel="noopener noreferrer">
            privacy policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Login;

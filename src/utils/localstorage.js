import { redirect } from "react-router-dom";

const getLSValue = (key) => {
  const v = localStorage.getItem(key);
  const value = typeof v === "string" ? v : JSON.parse(v);
  return value;
};

const setLSValue = (key, value) => {
  const stringifyValue =
    typeof value !== "object" ? value : JSON.stringify(value);
  localStorage.setItem(key, stringifyValue);
};

const clearLS = () => {
  localStorage.clear();
};

const removeLsValue = (keys) => {
  const isArray = Array.isArray(keys);
  if (isArray) {
    keys.forEach((each_key) => {
      localStorage.removeItem(each_key);
    });
  } else {
    localStorage.removeItem(keys);
  }
};

const isAuth = ({ isProtected }) => {
  const userToken = getLSValue("token");
  if (isProtected) {
    if (!userToken) {
      return null;
    } else {
      return redirect("/");
    }
  }
  if (userToken) {
    return null;
  } else {
    return redirect("/login");
  }
};

export { getLSValue, setLSValue, clearLS, isAuth, removeLsValue };

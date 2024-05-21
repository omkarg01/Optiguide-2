import React from "react";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import store from "./redux";
import { ROUTES } from "./routes";

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={ROUTES} />
    </Provider>
  );
}

export default App;

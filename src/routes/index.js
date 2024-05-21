import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/home'
import Login from '../pages/login'
import NotFound from '../pages/not-found'
import { isAuth } from '../utils/localstorage'

export const ROUTES = createBrowserRouter([
  {
    path: '/',
    element:<Home/>,
    loader:isAuth
  },
  {
    path: '/login',
    element: <Login/>,
    
    loader:()=>isAuth({isProtected:true})
  },
  {
    path:'*',
    element:<NotFound/>
  }
])

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './Login.jsx'
import SplashScreen from './SplashScreen.jsx'
import LoginSuccess from './LoginSuccess.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './Reduxtoolkit/store.js'
import MediGLayout from './MediGLayout.jsx'
import Home from './Home.jsx'
import './App.css'


const router = createBrowserRouter([
  {
    path: '/',
    element: <SplashScreen />
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "login/loginSuccess",
    element: <LoginSuccess/>
  },
  {
    path: "login/loginSuccess/layout",
    element: <MediGLayout />,
    children: [
      {
        path: "",
        element: <Home />
      },
      {
        path: "dashboard",
        element: <Home />
      }
    ]
  }
  
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store = {store}>
    <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './Login.jsx'
import SplashScreen from './SplashScreen.jsx'
import LoginSuccess from './LoginSuccess.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './Reduxtoolkit/store.js'
import {MediGLayout , MediGLayout2} from './MediGLayout.jsx'
import Home from './Home.jsx'
import './App.css'
import DoctorSchedule from './Schedule.jsx'
import DoctorWeeklySchedule from './WeeklySchedule.jsx'
import PatientSearch from './PatientSearch.jsx'
import Loader from './Loader.jsx'
import PatientDetails from './PatientDetails.jsx'
import MedicalDocuments from './MedicalDocuments.jsx'
import DocumentViewer, { HistoryViewer } from './DocumentViewer.jsx'
import PharmacyReceiptConfirmationScreen from './PharmacyReceiptConfirmationScreen.jsx'
import Application from './Application.jsx'
import PrescriptionUI from './MedicalPrescriptionUI.jsx'
import MedicalHistory from './Prescription.jsx'


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
      },
      {
        path: "schedule",
        element: <DoctorSchedule />
      },
      {
        path: "patients",
        element: <PatientSearch />
      },
      {
        path: "applications",
        element: <Application />
      }
    ]
  },
  {
    path: "login/loginSuccess/layout/schedule/scheduleTable",
    element: <MediGLayout2 />,
    children: [
      {
        path: "",
        element: <DoctorWeeklySchedule />
      }
    ]

  },
  {
    path: "login/loginSuccess/layout/patients/patientLoader",
    element: <MediGLayout />,
    children: [
      {
        path: "",
        element: <Loader />
      },
      {
        path: "patientDetails",
        element: <PatientDetails />
      },
      {
        path: "patientDetails/medicalDocuments",
        element: <MedicalDocuments />,
      },
      {
        path: 'patientDetails/medicalDocuments/:folderName',
        element: <DocumentViewer />
      },
      {
        path: 'patientDetails/medicalHistory',
        element: <MedicalHistory />
      },
      {
        path: 'patient/medicalHistory/:folderName',
        element: <HistoryViewer />
      }
    ]
  },
  {
    path: 'login/loginSuccess/layout/patients/patientLoader/patientDetails/pharmacyConfirmation',
    element: <MediGLayout2 />,
    children: [
      {
        path: "",
        element: <PharmacyReceiptConfirmationScreen />
      },
      {
        path: "receiptForwardSuccess",
        element: <PrescriptionUI />
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


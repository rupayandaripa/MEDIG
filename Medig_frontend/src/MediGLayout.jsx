import React from "react";
import MedicalHeader from "./MedicalHeader.jsx";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Home";
import { changeData } from "./Reduxtoolkit/MediGSlice.js";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function MediGLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const mappedData = JSON.parse(localStorage.getItem('mappedData'));
    if (mappedData) {
      dispatch(changeData(mappedData));
    }
  }, []);
  return (
    <div className="flex flex-col h-screen">
      <MedicalHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 ">
          <Outlet />
        </main>
      </div>
    </div>
  );

}

function MediGLayout2() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const mappedData = JSON.parse(localStorage.getItem('mappedData'));
    if (mappedData) {
      dispatch(changeData(mappedData));
    }
  }, []);
  return (
    <div className="flex flex-col h-screen">
      <MedicalHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 ">
          <Outlet />
        </main>
    </div>
  );
}

export {MediGLayout , MediGLayout2};
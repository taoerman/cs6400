'use client'
import React from "react";
import { useView } from '@/contexts/ViewContext';
import { getCookie } from "../utils";
export const Router = () => {
  const userType = getCookie('loginType')
  return (
    <div className="space-y-1">
      {userType == 3?(
        <>
      <Route title="Dog Dashboard" num = {1}/>
      <Route title="Add Dog" num = {2}/>
      <Route title="Expenses" num = {4}/>
      <Route title="Add Adoption" num = {5}/>
      <Route title="Adoption Review" num = {9}/>
      <Route title="Report" num = {6}/>
      <Route title="DrillDown" num = {7}/>
      <Route title="Volunteer" num = {8}/>
      </>
      ):(<>
      <Route title="Dog Dashboard" num = {1}/>
      <Route title="Add Dog" num = {2}/>
      <Route title="Expenses" num = {4}/>
      <Route title="Add Adoption" num = {5}/>
      </>
      )}
    </div>
  );
};
const Route = ({
  title,
  num
}) => {
  const { setCurrentView, currentView } = useView();
  const handleClick = (num) => {
    setCurrentView(num)
  }
  const selected = num === currentView ? true : false;
  return (
    <button
      onClick={()=>handleClick(num)}
      className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow,_background-color,_color] ${
        selected
          ? "bg-white text-stone-950 shadow"
          : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"
      }`}
    >
      <span>{title}</span>
    </button>
  );
};
import React from "react";


export const Account = ({
  email,
  name,
  isExec,
  logoutHandler,
}) => {

  return (
    <div className="border-b mb-4 mt-2 pb-4 border-stone-300">
      <div className="text-start">
        <span className="text-sm font-bold block">
          {isExec ? 'Admin' : 'Volunteer'}
        </span>
        <span className="text-xs block text-stone-500">{name}</span>
        <span className="text-xs block text-stone-500">{email}</span>
        <br></br>
        <button
          className="text-xs block text-stone-500"
          type="button"
          onClick={logoutHandler}>
          Logout
        </button>
      </div>
    </div>
  );
};
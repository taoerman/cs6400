import React from "react";
import { Account } from "./Account";
import { Router } from "./Router";


export const Sidebar = ({
    email,
    name,
    isExec,
    logout,
}) => {
    return (
        <div>
            <div className="overflow-y-scroll sticky top-4 h-[calc(100vh-32px-48px)]">
                <Account email={email} logoutHandler={logout} name={name} isExec={isExec} />
                <Router />
            </div>
        </div>
    )
}
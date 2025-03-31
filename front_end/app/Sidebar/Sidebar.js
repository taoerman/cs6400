import React from "react";
import { Account } from "./Account";
import { Router } from "./Router"; 
export const Sidebar = () => {
    return (
        <div>
        <div className="overflow-y-scroll sticky top-4 h-[calc(100vh-32px-48px)]">
                <Account />
                <Router />
        </div>
        </div>
    )
}
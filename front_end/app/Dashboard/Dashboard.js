'use client'
import React from "react";
import { Dogdashboard } from "../Dog/Dogdashboard";
import { AddDog } from "../Dog/Adddog";
import { DogDetail } from "../Dog/Dogdetail";
import { Expense } from "../Expense/Expense";
import { Adoption } from "../Adoption/Adoption";
import { useView } from '@/contexts/ViewContext';
import { Report } from "../Report/Report";
import { Volunteer } from "../Volunteer/Volunteer";
export const Dashboard = () => {
  const { currentView } = useView();
  const renderView = () => {
    switch (currentView) {
      case 1: return <Dogdashboard />;
      case 2: return <AddDog />;
      case 3: return <DogDetail />;
      case 4: return <Expense />;
      case 5: return <Adoption />;
      case 6: return <Report />;
      case 7: return <Volunteer />;
      default: return null;
    }
  };
  return (
    <div className="bg-white rounded-lg pb-4 shadow">
      {renderView()}
    </div>
  );
};
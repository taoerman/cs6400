import React, { useEffect, useState } from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
import { getDollarAmountFormat, getDataFromBackEnd } from "./../utils";

export const DrillDown = ({ view }) => {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const date = new Date();

  const {
    setCurrentView,
    currentView,
    currentReport,
    reportMonth,
    reportYear,
  } = useView();

  const [animalControlSurrenders, setAnimalControlSurrenders] = useState([]);
  const [oldDogs, setOldDogs] = useState([]);
  const [totalExpense, setTotalExpense] = useState([]);

  const handleClick = (num) => {
    setCurrentView(num)
  }

  useEffect(() => {
    async function loadAnimalControlReport() {
      const res = await getDataFromBackEnd('report/animal_control_monthly_details/', {
        month: reportMonth,
        year: reportYear,
      });
      const result = await res.json();
      setAnimalControlSurrenders(result.animal_control_surrenders ?? []);
      setOldDogs(result.adopted_60_plus_days ?? []);
      setTotalExpense(result.adoption_expenses ?? []);
    }
    loadAnimalControlReport();
  }, []);

  return (
    <main className={styles["main-content"]}>
      <div className={styles["dashboard-header"]}>
        <h1 className={styles["page-title"]}>
          {monthNames[reportMonth - 1] + " " + reportYear}
        </h1>
        <div className={styles["dashboard-actions"]}>
          <button onClick={() => handleClick(6)} className={`${styles["action-btn"]} ${styles["secondary-btn"]}`}>
            Back to Report
          </button>
        </div>
      </div>

      <div className={styles["report-date"]}>
        Report generated: <span id="currentDate">{date.toLocaleDateString()}</span>
      </div>

      {/* Animal Control Surrenders View */}
      <div className={currentReport == "surrenderView" ? styles["report-section.active"] : styles["report-section"]} id="surrenderView">
        <h2 className={styles["section-title"]}>Animal Control Surrenders</h2>
        <div className={styles["report-table-container"]}>
          <table className={styles["report-table"]}>
            <thead>
              <tr>
                <th>Dog ID</th>
                <th>Breed</th>
                <th>Sex</th>
                <th>Altered</th>
                <th>Microchip ID</th>
                <th>Surrender Date</th>
              </tr>
            </thead>
            <tbody>
              {animalControlSurrenders.map((row, index) => {
                return (
                  <tr key={index}>
                    <td>{row.dogID}</td>
                    <td>{row.breed}</td>
                    <td>{row.sex}</td>
                    <td>{row.altered ? "Yes" : "No"}</td>
                    <td>{row.microchipID}</td>
                    <td>{row.surrenderDate}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dogs Adopted (60+ Days) View */}
      <div className={currentReport == "adoptionView" ? styles["report-section.active"] : styles["report-section"]} id="adoptionView">
        <h2 className={styles["section-title"]}>Dogs Adopted (60+ Days in Rescue)</h2>
        <div className={styles["report-table-container"]}>
          <table className={styles["report-table"]}>
            <thead>
              <tr>
                <th>Dog ID</th>
                <th>Breed</th>
                <th>Sex</th>
                <th>Microchip ID</th>
                <th>Surrender Date</th>
                <th>Days in Rescue</th>
              </tr>
            </thead>
            <tbody>
              {oldDogs.map((row, index) => {
                return (
                  <tr key={index}>
                    <td>{row.dogID}</td>
                    <td>{row.breed}</td>
                    <td>{row.sex}</td>
                    <td>{row.microchipID}</td>
                    <td>{row.surrenderDate}</td>
                    <td>{row.daysInRescue}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Expenses View */}
      <div className={currentReport == "expenseView" ? styles["report-section.active"] : styles["report-section"]} id="expenseView">
        <h2 className={styles["section-title"]}>Total Expenses for Adopted Dogs</h2>
        <div className={styles["report-table-container"]}>
          <table className={styles["report-table"]}>
            <thead>
              <tr>
                <th>Dog ID</th>
                <th>Breed</th>
                <th>Sex</th>
                <th>Microchip ID</th>
                <th>Surrender Date</th>
                <th>AC</th>
                <th>Total Expenses</th>
              </tr>
            </thead>
            <tbody>
              {totalExpense.map((row, index) => {
                return (
                  <tr key={index}>
                    <td>{row.dogID}</td>
                    <td>{row.breed}</td>
                    <td>{row.sex}</td>
                    <td>{row.microchipID}</td>
                    <td>{row.surrenderDate}</td>
                    <td>{row.surrenderedByAnimalControl ? "Yes" : "No"}</td>
                    <td>{getDollarAmountFormat(row.totalExpenses)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
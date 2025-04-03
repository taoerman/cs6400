import React from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
export const DrillDown = () => {
    const { setCurrentView, currentView } = useView();
    const handleClick = (num) => {
        setCurrentView(num)
      }    
    return (
        <main className={styles["main-content"]}>
        <div className={styles["dashboard-header"]}>
          <h1 className={styles["page-title"]}>March 2024</h1>
          <div className={styles["dashboard-actions"]}>
            <button onClick = {()=>handleClick(6)} className={`${styles["action-btn"]} ${styles["secondary-btn"]}`}>
              Back to Report
            </button>
          </div>
        </div>
  
        <div className={styles["report-date"]}>
          Report generated: <span id="currentDate">March 15, 2024</span>
        </div>
  
        {/* Animal Control Surrenders View */}
        <div className={styles["report-section"]} id="surrenderView">
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
                <tr>
                  <td>AC1001</td>
                  <td>German Shepherd, Husky</td>
                  <td>Male</td>
                  <td>Yes</td>
                  <td>985141123456789</td>
                  <td>2024-03-01</td>
                </tr>
                <tr>
                  <td>AC1002</td>
                  <td>Labrador Retriever, Pit Bull</td>
                  <td>Female</td>
                  <td>No</td>
                  <td>985141123456790</td>
                  <td>2024-03-05</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Dogs Adopted (60+ Days) View */}
        <div className={styles["report-section"]} id="adoptionView">
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
                <tr>
                  <td>AC1003</td>
                  <td>Australian Shepherd, Border Collie</td>
                  <td>Female</td>
                  <td>985141123456791</td>
                  <td>2023-12-15</td>
                  <td>85</td>
                </tr>
                <tr>
                  <td>AC1004</td>
                  <td>Beagle, Dachshund</td>
                  <td>Male</td>
                  <td>985141123456792</td>
                  <td>2023-12-20</td>
                  <td>80</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Total Expenses View */}
        <div className={styles["report-section"]} id="expenseView">
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
                  <th>AC Surrender</th>
                  <th>Total Expenses</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AC1005</td>
                  <td>Boxer, Pit Bull</td>
                  <td>Male</td>
                  <td>985141123456793</td>
                  <td>2024-01-10</td>
                  <td>Yes</td>
                  <td>$850.00</td>
                </tr>
                <tr>
                  <td>AC1006</td>
                  <td>Chihuahua, Yorkshire Terrier</td>
                  <td>Female</td>
                  <td>985141123456794</td>
                  <td>2024-01-15</td>
                  <td>No</td>
                  <td>$720.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    )
}
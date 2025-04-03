import React from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
export const Report = () => {
    const [page, setPage] = React.useState(1)
    const { setCurrentView, currentView } = useView();
    const handleClick = (e, num) => {
        e.preventDefault()
        setCurrentView(num)
      }    
    return (
        <main className={styles["main-content"]}>
        <div className={styles["dashboard-header"]}>
          <h1 className={styles["page-title"]}>Shelter Reports</h1>
        </div>
  
        <div className={styles["report-tabs"]}>
          <button onClick = {()=>setPage(1)} className={page===1?`${styles["tab-btn"]} ${styles["active"]}`:`${styles["tab-btn"]}`} data-tab="animal-control">
            Animal Control Report
          </button>
          <button onClick = {()=>setPage(2)} className={page===2?`${styles["tab-btn"]} ${styles["active"]}`:`${styles["tab-btn"]}`} data-tab="adoption">
            Monthly Adoption Report
          </button>
          <button onClick = {()=>setPage(3)} className={page===3?`${styles["tab-btn"]} ${styles["active"]}`:`${styles["tab-btn"]}`} data-tab="expense">
            Expense Analysis
          </button>
        </div>
  
        {/* Animal Control Report Section */}
        <div className={page===1?`${styles["report-section"]} ${styles["active"]}`:`${styles["report-section"]}`} id="animal-control-report">
          <div className={styles["report-container"]}>
            <div className={styles["report-table-container"]}>
              <table className={styles["report-table"]}>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Dogs from Animal Control</th>
                    <th>Dogs Adopted (60+ days)</th>
                    <th>Total Expenses for Adopted Dogs</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: "March 2024", data: [12, 8, "$4,520"], m: 3, y: 2024 },
                    { month: "February 2024", data: [15, 10, "$5,850"], m: 2, y: 2024 },
                    { month: "January 2024", data: [18, 12, "$6,720"], m: 1, y: 2024 },
                    { month: "December 2023", data: [14, 9, "$4,980"], m: 12, y: 2023 },
                    { month: "November 2023", data: [16, 11, "$5,340"], m: 11, y: 2023 },
                    { month: "October 2023", data: [13, 7, "$3,890"], m: 10, y: 2023 },
                    { month: "September 2023", data: [17, 13, "$7,150"], m: 9, y: 2023 },
                  ].map(({ month, data, m, y }) => (
                    <tr key={month}>
                      <td>
                        <a
                          onClick = {(e)=>handleClick(e, 7)}
                          className={styles["month-link"]}
                        >
                          {month}
                        </a>
                      </td>
                      <td>
                        <a
                          href={`drill-down.html?month=${m}&year=${y}&category=surrender`}
                          className={styles["data-link"]}
                        >
                          {data[0]}
                        </a>
                      </td>
                      <td>
                        <a
                          href={`drill-down.html?month=${m}&year=${y}&category=adoption`}
                          className={styles["data-link"]}
                        >
                          {data[1]}
                        </a>
                      </td>
                      <td>
                        <a
                          href={`drill-down.html?month=${m}&year=${y}&category=expenses`}
                          className={styles["data-link"]}
                        >
                          {data[2]}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td>105</td>
                    <td>70</td>
                    <td>$38,450</td>
                  </tr>
                </tfoot>
              </table>
            </div>
  
            <div className={styles["report-summary"]}>
              <div className={styles["summary-card"]}>
                <h3>Monthly Average</h3>
                <div className={styles["summary-stats"]}>
                  <div className={styles["stat-item"]}>
                    <label>Dogs from AC:</label>
                    <span>15</span>
                  </div>
                  <div className={styles["stat-item"]}>
                    <label>Adoptions (60+ days):</label>
                    <span>10</span>
                  </div>
                  <div className={styles["stat-item"]}>
                    <label>Expenses per Month:</label>
                    <span>$5,493</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Monthly Adoption Report Section */}
        <div className={page===2?`${styles["report-section"]} ${styles["active"]}`:`${styles["report-section"]}`} id="adoption-report">
          <div className={styles["report-container"]}>
            <div className={styles["report-table-container"]}>
              <table className={styles["report-table"]}>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Breed</th>
                    <th>Dogs Surrendered</th>
                    <th>Dogs Adopted</th>
                    <th>Total Expenses</th>
                    <th>Adoption Fees</th>
                    <th>Net Profit*</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Render data manually or map through a data array similarly to above */}
                  <tr>
                    <td rowSpan={3}>March 2023</td>
                    <td>Beagle, Dachshund</td>
                    <td>2</td>
                    <td>1</td>
                    <td>$850</td>
                    <td>$250</td>
                    <td className={styles["negative"]}>-$600</td>
                  </tr>
                  <tr>
                    <td>German Shepherd</td>
                    <td>3</td>
                    <td>2</td>
                    <td>$1,200</td>
                    <td>$500</td>
                    <td className={styles["negative"]}>-$700</td>
                  </tr>
                  <tr>
                    <td>Labrador Retriever, Pit Bull</td>
                    <td>2</td>
                    <td>2</td>
                    <td>$950</td>
                    <td>$500</td>
                    <td className={styles["negative"]}>-$450</td>
                  </tr>
                  <tr className={styles["month-total"]}>
                    <td colSpan={2}>March 2023 Total</td>
                    <td>7</td>
                    <td>5</td>
                    <td>$3,000</td>
                    <td>$1,250</td>
                    <td className={styles["negative"]}>-$1,750</td>
                  </tr>
                  {/* April 2023 data */}
                  <tr>
                    <td rowSpan={2}>April 2023</td>
                    <td>Border Collie</td>
                    <td>2</td>
                    <td>1</td>
                    <td>$750</td>
                    <td>$250</td>
                    <td className={styles["negative"]}>-$500</td>
                  </tr>
                  <tr>
                    <td>Husky, Shepherd</td>
                    <td>1</td>
                    <td>2</td>
                    <td>$900</td>
                    <td>$500</td>
                    <td className={styles["negative"]}>-$400</td>
                  </tr>
                  <tr className={styles["month-total"]}>
                    <td colSpan={2}>April 2023 Total</td>
                    <td>3</td>
                    <td>3</td>
                    <td>$1,650</td>
                    <td>$750</td>
                    <td className={styles["negative"]}>-$900</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>12-Month Total</td>
                    <td>85</td>
                    <td>76</td>
                    <td>$42,500</td>
                    <td>$19,000</td>
                    <td className={styles["negative"]}>-$23,500</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className={styles["report-note"]}>
              * Net Profit excludes expenses for Animal Control surrendered dogs
            </div>
          </div>
        </div>
  
        {/* Expense Analysis Section */}
        <div className={page===3?`${styles["report-section"]} ${styles["active"]}`:`${styles["report-section"]}`} id="expense-report">
          <div className={styles["report-container"]}>
            <div className={styles["report-table-container"]}>
              <table className={styles["report-table"]}>
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Number of Transactions</th>
                    <th>Total Expenses</th>
                    <th>Average per Transaction</th>
                    <th>Last Transaction Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <a href="vendor-detail.html?id=1" className={styles["vendor-link"]}>
                        City Veterinary Clinic
                      </a>
                    </td>
                    <td className={styles["text-right"]}>156</td>
                    <td className={styles["text-right"]}>$45,680</td>
                    <td className={styles["text-right"]}>$292.82</td>
                    <td>Mar 12, 2024</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="vendor-detail.html?id=2" className={styles["vendor-link"]}>
                        PetMed Supplies
                      </a>
                    </td>
                    <td className={styles["text-right"]}>89</td>
                    <td className={styles["text-right"]}>$12,450</td>
                    <td className={styles["text-right"]}>$139.89</td>
                    <td>Mar 15, 2024</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="vendor-detail.html?id=3" className={styles["vendor-link"]}>
                        Animal Emergency Hospital
                      </a>
                    </td>
                    <td className={styles["text-right"]}>45</td>
                    <td className={styles["text-right"]}>$8,920</td>
                    <td className={styles["text-right"]}>$198.22</td>
                    <td>Mar 10, 2024</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="vendor-detail.html?id=4" className={styles["vendor-link"]}>
                        Pet Food Wholesale
                      </a>
                    </td>
                    <td className={styles["text-right"]}>78</td>
                    <td className={styles["text-right"]}>$6,540</td>
                    <td className={styles["text-right"]}>$83.85</td>
                    <td>Mar 14, 2024</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total All Vendors</td>
                    <td className={styles["text-right"]}>368</td>
                    <td className={styles["text-right"]}>$73,590</td>
                    <td className={styles["text-right"]}>$200.00</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </main>
    )
}
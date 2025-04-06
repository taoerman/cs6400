import React, { useEffect } from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';


export const Report = () => {
  const [page, setPage] = React.useState(1);
  const [animalControlReport, setAnimalControlReport] = React.useState([]);
  const [expenseAnalysis, setExpenseAnalysis] = React.useState([]);
  const { setCurrentView, currentView } = useView();
  const handleClick = (e, num) => {
    e.preventDefault()
    setCurrentView(num)
  }

  useEffect(() => {
    async function loadAnimalControlReport() {
      const res = await fetch('http://127.0.0.1:8000/report/animal_control_report/');
      const result = await res.json();
      const map = result.report.map(row => {
        return {
          month: row.month,
          data: [
            row.surrendered_by_animal_control,
            row.adopted_60plus_days,
            row.total_expenses,
          ],
          m: row.month.split('-')[1],
          y: row.month.split('-')[0],
        };
      });
      setAnimalControlReport(map);
    }
    loadAnimalControlReport();

  }, []);

  useEffect(() => {
    async function loadExpenseAnalysis() {
      const res = await fetch('http://127.0.0.1:8000/report/expense_analysis/');
      const result = await res.json();
      setExpenseAnalysis(result.data);
    }
    loadExpenseAnalysis();
  }, []);


  return (
    <main className={styles["main-content"]}>
      <div className={styles["dashboard-header"]}>
        <h1 className={styles["page-title"]}>Shelter Reports</h1>
      </div>

      <div className={styles["report-tabs"]}>
        <button onClick={() => setPage(1)} className={page === 1 ? `${styles["tab-btn"]} ${styles["active"]}` : `${styles["tab-btn"]}`} data-tab="animal-control">
          Animal Control Report
        </button>
        <button onClick={() => setPage(2)} className={page === 2 ? `${styles["tab-btn"]} ${styles["active"]}` : `${styles["tab-btn"]}`} data-tab="adoption">
          Monthly Adoption Report
        </button>
        <button onClick={() => setPage(3)} className={page === 3 ? `${styles["tab-btn"]} ${styles["active"]}` : `${styles["tab-btn"]}`} data-tab="expense">
          Expense Analysis
        </button>
      </div>

      {/* Animal Control Report Section */}
      <div className={page === 1 ? `${styles["report-section"]} ${styles["active"]}` : `${styles["report-section"]}`} id="animal-control-report">
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
                {animalControlReport.map(({ month, data, m, y }) => (
                  <tr key={month}>
                    <td>
                      <a
                        onClick={(e) => handleClick(e, 7)}
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
                        {'$ ' + data[2]}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{animalControlReport.reduce((acc, row) => acc + parseInt(row.data[0]), 0)}</td>
                  <td>{animalControlReport.reduce((acc, row) => acc + parseInt(row.data[1]), 0)}</td>
                  <td>{'$ ' + animalControlReport.reduce((acc, row) => acc + Number(row.data[2]), 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Adoption Report Section */}
      <div className={page === 2 ? `${styles["report-section"]} ${styles["active"]}` : `${styles["report-section"]}`} id="adoption-report">
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
      <div className={page === 3 ? `${styles["report-section"]} ${styles["active"]}` : `${styles["report-section"]}`} id="expense-report">
        <div className={styles["report-container"]}>
          <div className={styles["report-table-container"]}>
            <table className={styles["report-table"]}>
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th></th>
                  <th>Total Expenses</th>
                </tr>
              </thead>
              <tbody>
                {expenseAnalysis.map((row, index) => {
                  return (<tr key={index}>
                    <td>{row.expenseVendor}</td>
                    <td></td>
                    <td>{'$ ' + row.totalSpent}</td>
                  </tr>);
                })}

              </tbody>
              <tfoot>
                <tr>
                  <td>Total All Vendors</td>
                  <td></td>
                  <td>{'$ ' + expenseAnalysis.reduce((acc, row) =>
                    acc + row.totalSpent, 0)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div >
    </main >
  )
}
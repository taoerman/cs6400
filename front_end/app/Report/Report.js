import React, { useEffect, useState } from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';


export const Report = () => {
  const [page, setPage] = useState(1);
  const [animalControlReport, setAnimalControlReport] = useState([]);
  const [monthlyAdoptionReport, setMonthlyAdoptionReport] = useState([]);
  const [expenseAnalysis, setExpenseAnalysis] = useState([]);
  const { setCurrentView, setCurrentReport, setReportMonth, setReportYear } = useView();
  const handleClick = (e, num, report, month, year) => {
    e.preventDefault();
    setCurrentReport(report);
    setReportMonth(month);
    setReportYear(year);
    setCurrentView(num);
  }

  useEffect(() => {
    async function loadmonthlyAdoptionReport() {
      const res = await fetch('http://127.0.0.1:8000/report/monthly_adoption_report/');
      const result = await res.json();

      setMonthlyAdoptionReport(result.report);
    }
    loadmonthlyAdoptionReport();

  }, []);

  console.log(monthlyAdoptionReport);

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
                        className={styles["month-link"]}
                      >
                        {month}
                      </a>
                    </td>
                    <td>
                      <a
                        onClick={(e) => handleClick(e, 7, 'surrenderView', m, y)}
                        className={styles["data-link"]}
                      >
                        {data[0]}
                      </a>
                    </td>
                    <td>
                      <a
                        onClick={(e) => handleClick(e, 7, 'adoptionView', m, y)}
                        className={styles["data-link"]}
                      >
                        {data[1]}
                      </a>
                    </td>
                    <td>
                      <a
                        onClick={(e) => handleClick(e, 7, 'expenseView', m, y)}
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
                {Object.entries(monthlyAdoptionReport).map(([month, breeds]) => {
                  const sortedBreeds = [...breeds].sort((a, b) =>
                    a.breed.localeCompare(b.breed)
                  );

                  const summary = sortedBreeds.reduce((acc, curr) => {
                    acc.totalSurrendered += curr.totalSurrendered;
                    acc.totalAdopted += curr.totalAdopted;
                    acc.totalAdoptionFees += curr.totalAdoptionFees;
                    acc.totalExpenses += curr.totalExpenses;
                    acc.netProfit += curr.netProfit;
                    return acc;
                  },
                    {
                      totalSurrendered: 0,
                      totalAdopted: 0,
                      totalAdoptionFees: 0,
                      totalExpenses: 0,
                      netProfit: 0,
                    }
                  );

                  return (
                    <React.Fragment key={month}>
                      {sortedBreeds.map((item, index) => (
                        <tr key={index}>
                          <td>{index === 0 ? month : ""}</td>
                          <td>{item.breed}</td>
                          <td>{item.totalSurrendered}</td>
                          <td>{item.totalAdopted}</td>
                          <td>{item.totalExpenses.toFixed(2)}</td>
                          <td>{item.totalAdoptionFees.toFixed(2)}</td>
                          <td>{item.netProfit.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#fffacc', fontWeight: 'bold' }}>
                        <td>{month} Summary</td>
                        <td>--</td>
                        <td>{summary.totalSurrendered}</td>
                        <td>{summary.totalAdopted}</td>
                        <td>{summary.totalExpenses.toFixed(2)}</td>
                        <td>{summary.totalAdoptionFees.toFixed(2)}</td>
                        <td>{summary.netProfit.toFixed(2)}</td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
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
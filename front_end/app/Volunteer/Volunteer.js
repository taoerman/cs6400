import React from "react";
import styles from "./volunteer.module.css";

export const Volunteer = () => {
    const [page, setPage] = React.useState(1)
    return (
        <main className={styles["main-content"]}>
        <div className={styles["dashboard-header"]}>
          <h1 className={styles["page-title"]}>Volunteer Management</h1>
        </div>
  
        <div className={styles["report-tabs"]}>
          <button onClick = {()=>setPage(1)} className={page===1?`${styles["tab-btn"]} ${styles["active"]}`:`${styles["tab-btn"]}`} data-tab="lookup">
            Volunteer Lookup
          </button>
          <button onClick = {()=>setPage(2)} className={page===2?`${styles["tab-btn"]} ${styles["active"]}`:`${styles["tab-btn"]}`} data-tab="birthdays">
            Volunteer Birthdays
          </button>
        </div>
  
        {/* Volunteer Lookup Section */}
        <div className={page===1?`${styles["report-section"]} ${styles["active"]}`:`${styles["report-section"]}`} id="lookup-report">
          <div className={styles["report-container"]}>
            <div className={styles["search-section"]}>
              <div className={styles["search-group"]}>
                <input
                  type="text"
                  id="volunteerSearch"
                  className={styles["search-input"]}
                  placeholder="Search by name, email, or phone number"
                />
                <button className={styles["search-btn"]}>
                  <i className="fas fa-search"></i> Search
                </button>
              </div>
            </div>
  
            {/* Search results will be dynamically injected here */}
            <div className={styles["search-results"]}>
              {/* Results go here */}
            </div>
          </div>
        </div>
  
        {/* Birthday Report Section */}
        <div className={page===2?`${styles["report-section"]} ${styles["active"]}`:`${styles["report-section"]}`} id="birthdays-report">
          <div className={styles["report-container"]}>
            <div className={styles["filter-section"]}>
              <div className={styles["filter-group"]}>
                <label htmlFor="monthSelect">Month:</label>
                <select id="monthSelect" className={styles["filter-select"]} defaultValue="3">
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              <div className={styles["filter-group"]}>
                <label htmlFor="yearSelect">Year:</label>
                <select id="yearSelect" className={styles["filter-select"]} defaultValue="2024">
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>
  
            <div className={styles["report-table-container"]}>
              <table className={styles["report-table"]}>
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email Address</th>
                    <th className={styles["text-center"]}>Milestone Birthday</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { first: "Sarah", last: "Johnson", email: "sarah.j@email.com", milestone: true },
                    { first: "Michael", last: "Smith", email: "m.smith@email.com", milestone: false },
                    { first: "Emily", last: "Davis", email: "emily.davis@email.com", milestone: true },
                    { first: "James", last: "Wilson", email: "j.wilson@email.com", milestone: false },
                  ].map((vol, i) => (
                    <tr key={i}>
                      <td>{vol.first}</td>
                      <td>{vol.last}</td>
                      <td>{vol.email}</td>
                      <td className={styles["text-center"]}>
                        <span
                          className={`${styles["status-badge"]} ${
                            vol.milestone ? styles["milestone"] : ""
                          }`}
                        >
                          {vol.milestone ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
            <div className={styles["no-data-message"]} style={{ display: "none" }}>
              No volunteer birthdays this month!
            </div>
          </div>
        </div>
      </main>
    )
}
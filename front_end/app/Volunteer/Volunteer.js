import { useEffect, useState } from "react";
import React from "react";
import styles from "@/app/styles.module.css"

export const Volunteer = () => {
  const [page, setPage] = React.useState(1);
  const [data, setData] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filtered, setFiltered] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  useEffect(() => {
    async function loadData() {
      const res = await fetch('http://127.0.0.1:8000/accounts/volunteers');
      const result = await res.json();
      const sortedRes = [...result.volunteers].sort((a, b) => {
        if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) return -1;
        if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) return 1;
        if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) return -1;
        if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return 1;
        return 0;
      });
      setData(sortedRes);
    }
    loadData();
  }, []);
  useEffect(() => {
    if (keyword === "")
      setFiltered(false)
    else {
      setFiltered(true)
      const filtered = data.filter((volunteer) => {
        const fullName = `${volunteer.firstName} ${volunteer.lastName}`.toLowerCase();
        return fullName.includes(keyword.toLowerCase());
      });
      setFilteredData(filtered);
    }
  }, [keyword])

  const handleChange = (e) => {
    setKeyword(e.target.value)
  }

  const isMilestoneBirthday = (birthDate) => {
    if (!birthDate) return false;

    const today = new Date();
    const birthDateObj = new Date(birthDate);

    if (isNaN(birthDateObj.getTime())) return false;

    const birthYear = birthDateObj.getFullYear();
    const currentYear = today.getFullYear();
    let age = currentYear - birthYear;

    return age > 0 && age % 10 === 0;
  };

  const filterByBirthMonth = (volunteers, targetMonth) => {

    const parseDate = (dateStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return { year, month, day };
    };

    return volunteers.filter((volunteer) => {
      if (!volunteer.birthDate) {
        return false;
      }
      const { year, month, day } = parseDate(volunteer.birthDate);
      const birthMonth = new Date(year, month - 1, day).getMonth() + 1;
      return birthMonth.toString() === targetMonth;
    });
  };

  const filteredVolunteers = filterByBirthMonth(data, selectedMonth);

  return (
    <main className={styles["main-content"]}>
      <div className={styles["dashboard-header"]}>
        <h1 className={styles["page-title"]}>Volunteer Management</h1>
      </div>

      <div className={styles["report-tabs"]}>
        <button onClick={() => setPage(1)} className={page === 1 ? `${styles["tab-btn"]} ${styles["active"]}` : `${styles["tab-btn"]}`} data-tab="lookup">
          Volunteer Lookup
        </button>
        <button onClick={() => setPage(2)} className={page === 2 ? `${styles["tab-btn"]} ${styles["active"]}` : `${styles["tab-btn"]}`} data-tab="birthdays">
          Volunteer Birthdays
        </button>
      </div>

      {/* Volunteer Lookup Section */}
      <div className={page === 1 ? `${styles["report-section"]} ${styles["active"]}` : `${styles["report-section"]}`} id="lookup-report">
        <div className={styles["report-container"]}>
          <div className={styles["search-section"]}>
            <div className={styles["search-group"]}>
              <input
                type="text"
                id="volunteerSearch"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className={styles["search-input"]}
                placeholder="Search by name"
              />
            </div>
          </div>
          <div className={styles["search-results"]}>
            <table className={styles["dogs-table"]}>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {
                  filtered ? filteredData.map((volunteer) => {
                    return (
                      <tr key={volunteer.userEmail}>
                        <td>{volunteer.firstName}</td>
                        <td>{volunteer.lastName}</td>
                        <td>{volunteer.userEmail}</td>
                        <td>{volunteer.phoneNumber}</td>
                      </tr>
                    )
                  }) : data.map((volunteer) => {
                    return (
                      <tr key={volunteer.userEmail}>
                        <td>{volunteer.firstName}</td>
                        <td>{volunteer.lastName}</td>
                        <td>{volunteer.userEmail}</td>
                        <td>{volunteer.phoneNumber}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Birthday Report Section */}
      <div className={page === 2 ? `${styles["report-section"]} ${styles["active"]}` : `${styles["report-section"]}`} id="birthdays-report">
        <div className={styles["report-container"]}>
          <div className={styles["filter-section"]}>
            <div className={styles["filter-group"]}>
              <label htmlFor="monthSelect">Month:</label>
              <select id="monthSelect" className={styles["filter-select"]} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
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
              <select id="yearSelect" className={styles["filter-select"]} defaultValue={new Date().getFullYear().toString()}>
                <option >{new Date().getFullYear().toString()}</option>
                <option >{(new Date().getFullYear() - 1).toString()}</option>
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
                {filteredVolunteers.length > 0 ? (
                  filteredVolunteers.map((volunteer) => (
                    <tr key={volunteer.userEmail}>
                      <td>{volunteer.firstName}</td>
                      <td>{volunteer.lastName}</td>
                      <td>{volunteer.userEmail}</td>
                      <td className={styles["text-center"]}>
                        <span
                          className={`${styles["status-badge"]} ${isMilestoneBirthday(volunteer.birthDate) ? styles["milestone"] : ""
                            }`}
                        >
                          {isMilestoneBirthday(volunteer.birthDate) ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={styles["no-birthdays"]} >
                      No volunteers have birthdays this month.
                    </td>
                  </tr>
                )}
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
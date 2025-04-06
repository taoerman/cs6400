import React, { useState, useEffect } from "react";
import styles from "@/app/styles.module.css"

export const AdoptionApplicationReview = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filtered, setFiltered] = useState(false)
  const [filter, setFilter] = useState('pending');
  useEffect(() => {
    if (keyword === "")
      setFiltered(false)
    else {
      setFiltered(true)
      setFilteredData(data.filter((item) => item.adopterName.toLowerCase().includes(keyword.toLowerCase())))
    }
  }, [keyword])
  const handleChange = (e) => {
    setKeyword(e.target.value)
  }
  useEffect(() => {
    async function loadData() {
      const res = await fetch('http://127.0.0.1:8000/adoptions/get_all_applications/');
      const result = await res.json();
      setData(result.applications);
    }
    loadData();
  }, []);

  const filteredApplication = data.filter(application => {
    if (filter === 'all') return true;
    const { isApproved, isRejected } = application;
    if (isApproved === 1) {
      return filter === 'approved';
    } else if (isRejected === 1) {
      return filter === 'rejected';
    } else if (isApproved === 0 && isRejected === 0) {
      return filter === 'pending';
    }

    return false;
  });

  const handleClick = async (type, adopterEmail, applicationDate) => {
    const body = {
      adopterEmail: adopterEmail,
      applicationDate: applicationDate,
      applicationStatus: type === 1 ? "approved" : "rejected"
    }
    const res = await fetch('http://127.0.0.1:8000/adoptions/update_application_status/', { method: 'POST', body: JSON.stringify(body) });
    if (res.ok) {
      setData(data.map((item) => {
        if (
          item.adopterEmail === adopterEmail &&
          item.applicationDate === applicationDate
        ) {
          return {
            ...item,
            isApproved: type === 1 ? 1 : 0,
            isRejected: type === 2 ? 1 : 0
          };
        }
        return item;
      }));
    } else {
      alert("Failed to update application status");
    }
  }
  return (
    <main className={styles["main-content"]}>
      <div className={styles["dashboard-header"]}>
        <h1 className={styles["page-title"]}>Adoption Application Review</h1>
      </div>
      <div className={styles["controls-section"]}>
        <div className={styles["controls-wrapper"]}>
          <div className={styles["filter-group"]}>
            <label>Filter by Application Status:</label>
            <select id="statusFilter" className={styles["filter-dropdown"]}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Applications</option>
              <option value="approved">Approved Applications</option>
              <option value="rejected">Rejected Applications</option>
              <option value="pending">Pending Applications</option>
            </select>
          </div>

          <div className={styles["search-group"]}>
            <label>Search Adopter Name:</label>
            <div className={styles["search-input-wrapper"]}>
              <input value={keyword} onChange={(e) => handleChange(e)} type="text" id="searchInput" />
              <button type="button" className={styles["search-button"]}>
                <i className={styles["fas fa-search"]}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles["table-container"]}>
        <table className={styles["dogs-table"]}>
          <thead>
            <tr>
              <th>Adopter Name</th>
              <th>Adopter Email</th>
              <th>Adopter Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              filteredApplication.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.adopterFirstName + " " + item.adopterLastName}</td>
                    <td>{item.adopterEmail}</td>
                    <td>{item.adopterPhoneNumber.replace(/\D/g, '')
                      .replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</td>
                    <td>
                      {item.isApproved === 0 && item.isRejected === 0 ? (
                        <>
                          <button onClick={() => handleClick(1, item.adopterEmail, item.applicationDate)} className={styles["detail-link"]}>Approve</button>
                          <button onClick={() => handleClick(2, item.adopterEmail, item.applicationDate)} className={styles["detail-link"]}>Reject</button>
                        </>
                      ) : (
                        <span className={styles["reviewed-text"]}>Application Reviewed</span>
                      )}
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </main>
  )
}
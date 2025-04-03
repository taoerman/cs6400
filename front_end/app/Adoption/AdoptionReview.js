import React, {useState, useEffect} from "react";
import styles from "@/app/styles.module.css"

export const AdoptionReview = () => {
    const [data, setData] = useState([]);
      useEffect(() => {
        async function loadData() {
          const res = await fetch('http://127.0.0.1:8000/adoptions/review_pending_applications/');
          const result = await res.json();
          setData(result);
        }
        loadData();
      }, []);
    const handleClick = async (type, appid) => {
        const body = {applicationID: appid, applicationStatus: type === 1?"approved":"rejected"}
        const res = await fetch('http://127.0.0.1:8000/adoptions/review_pending_applications/',{method:'POST', body:JSON.stringify(body)});
        setData(data.filter((item)=>item.applicationID!==appid))
    }
    return (
        <main className={styles["main-content"]}>
        <div className={styles["dashboard-header"]}>
          <h1 className={styles["page-title"]}>Adoption Review</h1>
        </div>
  
        <div className={styles["table-container"]}>
          <table className={styles["dogs-table"]}>
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Dog ID</th>
                <th>Adopter Name</th>
                <th>Dog Name</th>
                <th>Adopter Email</th>
                <th>Adopter Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {
                data.map((item, index) => {
                  return (
                    <tr key={item.applicationID}>
                      <td>{item.dogID}</td>
                      <td>{item.firstName} {item.lastName}</td>
                      <td>{item.dogName}</td>
                      <td>{item.adopterEmail}</td>
                      <td>{item.phoneNumber}</td>
                      <td>
                        <button onClick={() => handleClick(1, applicationID)} className={styles["detail-link"]}>approved</button>
                        <button onClick={() => handleClick(2, applicationID)} className={styles["detail-link"]}>rejected</button>
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
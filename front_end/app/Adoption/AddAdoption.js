import React, {useState, useEffect} from "react";
import Modal from "../Common/Modal";
export const AddAdoption = () => {
      const [data, setData] = useState([]);
      const [filteredData, setFilteredData] = useState([]);
      const [keyword, setKeyword] = useState('')
      const [filtered, setFiltered] = useState(false)
      useEffect(()=>{
        if(keyword === "")
          setFiltered(false)
        else{
          setFiltered(true)
          setFilteredData(data.filter((item)=>item.adopterName.toLowerCase().includes(keyword.toLowerCase())))
        }
      },[keyword])
      const handleChange = (e) =>{
        setKeyword(e.target.value)
      }
        useEffect(() => {
          async function loadData() {
            const res = await fetch('http://127.0.0.1:8000/adoptions/review_pending_applications/');
            const result = await res.json();
            setData(result.applications);
          }
          loadData();
        }, []);
      const handleClick = async (type, appid) => {
          const body = {applicationID: appid, applicationStatus: type === 1?"approved":"rejected"}
          const res = await fetch('http://127.0.0.1:8000/adoptions/update_application_status/',{method:'POST', body:JSON.stringify(body)});
          setData(data.filter((item)=>item.applicationID!==appid))
      }
    return (
        <main className={styles["main-content"]}>
        <div className={styles["dashboard-header"]}>
          <h1 className={styles["page-title"]}>Adoption Review</h1>
        </div>
        <div className={styles["controls-section"]}>
        <div className={styles["controls-wrapper"]}>

          <div className={styles["search-group"]}>
            <label>Search Adopter Name:</label>
            <div className={styles["search-input-wrapper"]}>
              <input value={keyword} onChange={(e)=>handleChange(e)} type="text" id="searchInput" />
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
                filtered?filteredData.map((item) => {
                  return (
                    <tr key={item.applicationID}>
                      <td>{item.applicationID}</td>
                      <td>{item.dogID}</td>
                      <td>{item.adopterName}</td>
                      <td>{item.dogName}</td>
                      <td>{item.adopterEmail}</td>
                      <td>{item.phoneNumber}</td>
                      <td>
                        <button onClick={() => handleClick(1, applicationID)} className={styles["detail-link"]}>select</button>
                      </td>
                    </tr>
                  )
                }):data.map((item) => {
                  return (
                    <tr key={item.applicationID}>
                      <td>{item.applicationID}</td>
                      <td>{item.dogID}</td>
                      <td>{item.adopterName}</td>
                      <td>{item.dogName}</td>
                      <td>{item.adopterEmail}</td>
                      <td>{item.phoneNumber}</td>
                      <td>
                        <button onClick={() => handleClick(1, applicationID)} className={styles["detail-link"]}>select</button>
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
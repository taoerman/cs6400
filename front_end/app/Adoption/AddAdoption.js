import React, {useState, useEffect} from "react";
import Modal from "../Common/Modal";
import styles from "@/app/styles.module.css"
export const AddAdoption = () => {
      const [data, setData] = useState([]);
      const [filteredData, setFilteredData] = useState([]);
      const [keyword, setKeyword] = useState('')
      const [filtered, setFiltered] = useState(false)
      const [modalOpen, setModalOpen] = useState(false)
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
      const handleClick = async () => {
          setModalOpen(true)
      }
    return (
        <main className={styles["main-content"]}>
        <div className={styles["dashboard-header"]}>
          <h1 className={styles["page-title"]}>Add Adoption</h1>
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
                        <button onClick={() => handleClick()} className={styles["detail-link"]}>select</button>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
        <div>
        <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)}>
          <div>
          <form id="addExpenseForm" className={styles["expense-form"]}>
                    <div className={styles["form-section"]}>
                        <h2>Adoption Details</h2>
                        <div className={styles["form-grid"]}>
                            <div className={styles["form-group"]}>
                                <label htmlFor="expenseDate">Date</label>
                                <input type="date" id="expenseDate" name="expenseDate"
                                    onChange={handleChange} required />
                            </div>

                        </div>
                        <div className={styles["form-grid"]}>
                            <div className={styles["form-group"]}>
                                <label>Dog's Name</label>
                                <div>TEST</div>
                            </div>
                        </div>
                        <div className={styles["form-grid"]}>
                            <div className={styles["form-group"]}>
                                <label>Adopter's Name</label>
                                <div>TEST</div>
                            </div>
                        </div>
                        <div className={styles["form-grid"]}>
                            <div className={styles["form-group"]}>
                                <label>Adopter's Email</label>
                                <div>example@example.com</div>
                            </div>
                        </div>
                        <div className={styles["form-grid"]}>
                            <div className={styles["form-group"]}>
                                <label>Adopter's Phone</label>
                                <div>000-000-0000</div>
                            </div>
                        </div>
                        <div className={styles["form-grid"]}>
                            <div className={styles["form-group"]}>
                                <label>Adoption Fee</label>
                                <div>TEST</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles["form-actions"]}>
                        <button onClick={() => handleClick(3)} type="button" className={styles["secondary-btn"]}
                        >Cancel</button>
                        <button type="submit" className={styles["primary-btn"]}>Submit</button>
                    </div>
                </form>
          </div>
        </Modal>
        </div>
      </main>
    )
}
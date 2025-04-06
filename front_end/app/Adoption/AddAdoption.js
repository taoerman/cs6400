import React, { useState, useEffect } from "react";
import Modal from "../Common/Modal";
import styles from "@/app/styles.module.css"
import { useView } from "@/contexts/ViewContext";
export const AddAdoption = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [keyword, setKeyword] = useState('')
  const [filtered, setFiltered] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [screen, setScreen] = useState(1);
  const [fullData, setFullData] = useState([]);
  const [application, setApplication] = useState({});
  const [adoptionFee, setAdoptionFee] = useState(0);
  const { dogId, dogName } = useView();
  const [finalDate, setFinalDate] = useState(new Date().toISOString().split('T')[0])
  useEffect(() => {
    if (keyword === "")
      setFiltered(false)
    else {
      setFiltered(true)
      setFilteredData(data.filter((item) => item.adopterLastName.toLowerCase().includes(keyword.toLowerCase())))
    }
  }, [keyword])
  const handleChange = (e) => {
    setKeyword(e.target.value)
  }

  const handleDateInput = (e) => {
    setFinalDate(e.target.value)
  }
  useEffect(() => {
    fetch('http://127.0.0.1:8000/adoptions/get_adoption_fee_by_dogid/' + dogId)
      .then((res) => res.json())
      .then((data) => setAdoptionFee(data['adoptionFee']))
  }, [])
  useEffect(() => {
    async function loadData() {
      const res = await fetch('http://127.0.0.1:8000/adoptions/get_all_applications/');
      const result = await res.json();
      const data = result.applications
        .filter((item) => item.isApproved == 1);
      setFullData(data)

      // keep the most recent record
      const map = new Map();
      data.forEach(item => {
        const email = item['adopterEmail'];
        if (!map.has(email) || map.get(email) < item.applicationDate) {
          map.set(email, item);
        }
      });
      setData([...map.values()]);
    }
    loadData();
  }, []);
  const handleClick = (email) => {
    const appData = fullData.filter((item) => item.adopterEmail == email).sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))[0];
    setScreen(1)
    setApplication(appData)
    setModalOpen(true)
  }
  const handleSubmit = async (email) => {
    const body = {
      dogID: dogId,
      adopterEmail: email,
      adoptionDate: finalDate
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/adoptions/finalize_adoption/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      alert('Adoption added!')
    } catch (error) {
      alert('add adoption failed at ' + error)
    }
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
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              filtered ? filteredData.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.adopterFirstName} {item.adopterLastName}</td>
                    <td>{item.adopterEmail}</td>
                    <td>{item.adopterPhoneNumber}</td>
                    <td>{item.applicationDate}</td>
                    <td>
                      <button onClick={() => handleClick(item.adopterEmail)} className={styles["detail-link"]}>select</button>
                    </td>
                  </tr>
                )
              }) : data.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.adopterFirstName} {item.adopterLastName}</td>
                    <td>{item.adopterEmail}</td>
                    <td>{item.adopterPhoneNumber}</td>
                    <td>{item.applicationDate}</td>
                    <td>
                      <button onClick={() => handleClick(item.adopterEmail)} className={styles["detail-link"]}>select</button>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
      <div>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          {screen === 1 ? (<div>
            <form id="app detail" className={styles["expense-form"]}>
              <div className={styles["form-section"]}>
                <h2>Application Details</h2>
                <div className={styles["form-grid"]}>
                  <div className={styles["form-group"]}>
                    <label>Adopter Name</label>
                    <div>{application.adopterFirstName} {application.adopterLastName}</div>
                  </div>
                </div>
                <div className={styles["form-grid"]}>
                  <div className={styles["form-group"]}>
                    <label>Application Date</label>
                    <div>{application.applicationDate}</div>
                  </div>
                </div>
                <div className={styles["form-grid"]}>
                  <div className={styles["form-group"]}>
                    <label>Adopter Email</label>
                    <div>{application.adopterEmail}</div>

                  </div>
                </div>
                <div className={styles["form-grid"]}>
                  <div className={styles["form-group"]}>
                    <label>Adopter Phone</label>
                    <div>{application.adopterPhoneNumber}</div>
                  </div>
                </div>
                <div className={styles["form-grid"]}>
                  <div className={styles["form-group"]}>
                    <label>Adopter Address</label>
                    <div> {application.AdopterStreet}, {application.adopterCity}, {application.adopterState} {application.adopterZipCode}</div>
                  </div>
                </div>
                <div className={styles["form-actions"]}>
                  <button onClick={() => setScreen(2)} type="button" className={styles["secondary-btn"]}
                  >Confirm</button>
                </div>
              </div>
            </form>

          </div>) :
            (<div>
              <form id="addApplicationForm" className={styles["expense-form"]}>
                <div className={styles["form-section"]}>
                  <h2>Adoption Details</h2>
                  <div className={styles["form-grid"]}>
                    <div className={styles["form-group"]}>
                      <label htmlFor="applicationDate">Date</label>
                      <input type="date" id="expenseDate" value={finalDate} name="applicationDate"
                        onChange={(e) => handleDateInput(e)} required />
                    </div>

                  </div>
                  <div className={styles["form-grid"]}>
                    <div className={styles["form-group"]}>
                      <label>Dog's Name</label>
                      <div>{dogName}</div>
                    </div>
                  </div>
                  <div className={styles["form-grid"]}>
                    <div className={styles["form-group"]}>
                      <label>Adopter's Name</label>
                      <div>{application.adopterFirstName} {application.adopterLastName}</div>
                    </div>
                  </div>
                  <div className={styles["form-grid"]}>
                    <div className={styles["form-group"]}>
                      <label>Adopter's Email</label>
                      <div>{application.adopterEmail}</div>
                    </div>
                  </div>
                  <div className={styles["form-grid"]}>
                    <div className={styles["form-group"]}>
                      <label>Adopter's Phone</label>
                      <div>{application.adopterPhoneNumber}</div>
                    </div>
                  </div>
                  <div className={styles["form-grid"]}>
                    <div className={styles["form-group"]}>
                      <label>Adoption Fee</label>
                      <div>{adoptionFee}</div>
                    </div>
                  </div>
                </div>

                <div className={styles["form-actions"]}>
                  <button onClick={() => setModalOpen(false)} type="button" className={styles["secondary-btn"]}
                  >Cancel</button>
                  <button onClick={() => handleSubmit(application.adopterEmail)} className={styles["primary-btn"]}>Submit</button>
                </div>
              </form>
            </div>)}
        </Modal>
      </div>
    </main>
  )
}
import React, { useEffect, useState } from "react"
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
export const Dogdashboard = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('all');
  const maxDogNum = process.env.NEXT_PUBLIC_MAX_SHELTER_CAPACITY
  useEffect(() => {
    async function loadData() {
      const res = await fetch('http://127.0.0.1:8000/dogs/get_all_dogs/');
      const result = await res.json();
      setData(result);
    }
    loadData();
  }, []);
  const { setCurrentView, currentView, dogId, setDogId } = useView();
  const handleClick = (num) => {
    setCurrentView(num)
  }
  const checkAdoptable = (dog) => {
    if (dog.altered && dog.microchipID != null)
      return 'Yes'
    else
      return 'No'
  }

  const filteredData = data.filter(dog => {
    if (filter === 'all') return true;
    const isAdoptable = dog.altered && dog.microchipID != null;
    return filter === 'adoptable' ? isAdoptable : !isAdoptable;
  });

  return (
    <main className={styles["main-content"]}>
      <div className={styles["dashboard-header"]}>
        <h1 className={styles["page-title"]}>Dog Dashboard</h1>
        <div>
          <span >Dog Capacity: 5 </span>
          {data.length < maxDogNum && <div className={styles["dashboard-actions"]}>
            <button onClick={() => handleClick(2)} className={styles["primary-btn"]}>Add New Dog</button>
          </div>}
        </div>
      </div>

      <div className={styles["controls-section"]}>
        <div className={styles["controls-wrapper"]}>
          <div className={styles["filter-group"]}>
            <label>Filter by Status:</label>
            <select id="adoptabilityFilter" className={styles["filter-dropdown"]}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Dogs</option>
              <option value="adoptable">Adoptable</option>
              <option value="not-adoptable">Not Adoptable</option>
            </select>
          </div>

          <div className={styles["search-group"]}>
            <label>Search:</label>
            <div className={styles["search-input-wrapper"]}>
              <input type="text" id="searchInput" placeholder="Search by name, breed..." />
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
              <th>Name</th>
              <th>Breed</th>
              <th>Sex</th>
              <th>Altered</th>
              <th>Age For Months</th>
              <th>Adoptable</th>
              <th>Surrender Date</th>
              <th>Expense Incurred</th>
              <th>Application</th>
            </tr>
          </thead>
          <tbody>
            {
              filteredData.map((dog) => {
                return (
                  <tr key={dog.id} onClick={() => {
                    handleClick(3);
                    setDogId(dog.id);
                  }} >
                    <td>{dog.name}</td>
                    <td>{dog.breed ? JSON.parse(dog.breed).join(', ') : ''}</td>
                    <td>{dog.sex}</td>
                    <td>{dog.altered ? 'Yes' : 'No'}</td>
                    <td>{dog.ageForMonths}</td>
                    <td>{checkAdoptable(dog)}</td>
                    <td>{dog.surrenderDate}</td>
                    <td>
                      <button onClick={() => {
                        handleClick(4);
                        setDogId(dog.id);
                      }}
                        className={styles["detail-link"]}>Add Expense</button>
                    </td>

                    <td>
                      <button onClick={() => {
                        if (dog.altered && dog.microchipID != null) {
                          handleClick(5);
                          setDogId(dog.id);
                        }
                      }}
                        disabled={!(dog.altered && dog.microchipID != null)}
                        className={dog.altered && dog.microchipID != null ? styles["detail-link"] : `${styles["action-btn"]} ${styles["disabled-btn"]}`}
                      >  {dog.altered && dog.microchipID != null
                        ? "Adoption Application"
                        : "Not Available for Adoption"}</button>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </main >
  )
}
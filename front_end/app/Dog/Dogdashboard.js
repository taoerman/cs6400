import React, { useEffect, useState } from "react"
import styles from './dogdashboard.module.css'
import { useView } from '@/contexts/ViewContext';
export const Dogdashboard = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    async function loadData() {
      const res = await fetch('http://localhost:8080/dogs/get_all_dogs/'); 
      const result = await res.json();
      setData(result);
    }
    loadData();
  }, []);
    const { setCurrentView, currentView } = useView();
    const handleClick = (num) => {
      setCurrentView(num)
    }
  const checkAdoptable = (dog) => {
    if(dog.altered&&dog.microchip_ID)
    return 'Yes'
    else
    return 'No'
  }
  return (
<main className={styles["main-content"]}>
        <div className={styles["dashboard-header"]}>
            <h1 className={styles["page-title"]}>Dog Dashboard</h1>
            <div className={styles["dashboard-actions"]}>
                <button onClick = {()=>handleClick(2)} className={styles["primary-btn"]}>Add New Dog</button>
                <button onClick = {()=>handleClick(5)} className={styles["secondary-btn"]}>Adoption Application</button>
            </div>
        </div>
        
        <div className={styles["controls-section"]}>
            <div className={styles["controls-wrapper"]}>
                <div className={styles["filter-group"]}>
                    <label>Filter by Status:</label>
                    <select id="adoptabilityFilter" className={styles["filter-dropdown"]}>
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
                        <th>Age</th>
                        <th>Adoptable</th>
                        <th>Shelter</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                  {
                    data.map((dog)=>{ return (
                    <tr>
                        <td>{dog.name}</td>
                        <td>{dog.breed? JSON.parse(dog.breed).join(', ') : ''}</td>
                        <td>{dog.sex}</td>
                        <td>{dog.altered ? 'Yes' : 'No'}</td>
                        <td>{dog.age_for_months}</td>
                        <td>{checkAdoptable(dog)}</td>
                        <td>{dog.shelter??''}</td>
                        <td>
                            <button onClick = {()=>handleClick(3)} className={styles["detail-link"]}>Details</button>
                        </td>
                    </tr>
                    )})
                    }
                </tbody>
            </table>
        </div>
    </main>
  )
}
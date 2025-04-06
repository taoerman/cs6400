import React, { useEffect, useState } from "react"
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
export const Dogdashboard = () => {
  const [data, setData] = useState([]);
  const [capacity, setCapacity] = useState({
    remainingSpace: 0
  });
  const [filter, setFilter] = useState('current');
  const maxDogNum = process.env.NEXT_PUBLIC_MAX_SHELTER_CAPACITY
  useEffect(() => {
    async function loadData() {
      const res = await fetch('http://127.0.0.1:8000/dogs/get_all_dogs/');
      const result = await res.json();
      const sortedRes = [...result].sort((a, b) =>
        new Date(a.surrenderDate) - new Date(b.surrenderDate)
      );
      setData(sortedRes);
    }
    loadData();
  }, []);
  useEffect(() => {
    async function loadData() {
      const res = await fetch('http://127.0.0.1:8000/dogs/shelter_capacity/');
      const result = await res.json();
      setCapacity(result);
    }
    loadData();
  }, []);

  const { setCurrentView, currentView, dogId, setDogId, setDogName } = useView();
  const handleClick = (num) => {
    setCurrentView(num)
  }
  const checkAdoptable = (dog) => {
    if (!dog.is_adopted && dog.altered && dog.microchipID != null)
      return 'Yes'
    else
      return 'No'
  }

  const filteredData = data.filter(dog => {
    if (filter === 'all') return true;
    if (filter === 'adopted') return dog.is_adopted;
    if (filter === 'current') return !dog.is_adopted;
    if (filter === 'adoptable') return !dog.is_adopted && dog.altered && dog.microchipID != null;
    if (filter === 'not-adoptable') return !dog.is_adopted && (!dog.altered || dog.microchipID == null);
  });

  return (
    <main className={styles["main-content"]}>
      <div className={styles["dashboard-header"]}>
        <h1 className={styles["page-title"]}>Dog Dashboard</h1>
        <div>
          <button onClick={() => handleClick(5)} className={styles["primary-btn"]}>Add Adoption Application</button>
          <span >Dog Capacity: {capacity.remainingSpace}  </span>
          {capacity?.remainingSpace > 0 && <div className={styles["dashboard-actions"]}>
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
              <option value="adopted">Adopted</option>
              <option value="current">Dogs in Shelter</option>
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
            </tr>
          </thead>
          <tbody>
            {
              filteredData.map((dog) => {
                return (
                  <tr key={dog.id} onClick={() => {
                    handleClick(3);
                    setDogId(dog.id);
                    setDogName(dog.name);
                  }} >
                    <td>{dog.name}</td>
                    <td>{dog.breeds ? dog.breeds.join(' / ') : ''}</td>
                    <td>{dog.sex}</td>
                    <td>{dog.altered ? 'Yes' : 'No'}</td>
                    <td>{dog.ageForMonths}</td>
                    <td>{checkAdoptable(dog)}</td>
                    <td>{dog.surrenderDate}</td>
                    <td>
                      {!dog.is_adopted ? (
                        <button onClick={(e) => {
                          e.stopPropagation();
                          handleClick(4);
                          setDogId(dog.id);
                        }}
                          className={styles["detail-link"]}>Add Expense</button>

                      ) : (
                        <span className={styles["reviewed-text"]}>No Expense Tracked</span>
                      )


                      }
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
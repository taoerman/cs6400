import React, { useState, useEffect } from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
export const DogDetail = () => {
    const { setCurrentView, currentView, dogId, setDogId } = useView();
    const [data, setData] = useState();
    const [editing, setEditing] = useState(false)
    const [editData, setEditData] = useState({})
    const loadData = async () => {
        const res = await fetch('http://127.0.0.1:8000/dogs/get_dog/' + dogId);
        const result = await res.json();
        setData(result);
        const tempData = {
            sex: result.sex,
            microchipID: result.microchipID,
            breed: JSON.parse(result.breed).join(', '),
            altered: result.altered,
        };
        setEditData(tempData);
    };
    useEffect(() => {
        loadData();
    }, [dogId]);
    const handleSave = async () => {
        const body = JSON.stringify({ ...editData, breed: editData.breed.split(",").map(item => item.trim()) })
        const res = await fetch('http://127.0.0.1:8000/dogs/edit_dog/' + dogId + '/', { method: 'PUT', body: body })
        //if success, reload dog data
        if (res.ok) {
            loadData()
        }
    }
    const handleInput = (e, type) => {
        const keyMap = {
            sex: 'sex',
            breed: 'breed',
            altered: 'altered',
            chip: 'microchipID',
        };

        const key = keyMap[type];
        let value = e.target.value
        if (key) {
            setEditData({ ...editData, [key]: value });
        }
    }
    const handleEdit = () => {
        //reset edit data
        const tempData = {
            sex: data.sex,
            microchipID: data.microchipID,
            breed: JSON.parse(data.breed).join(', '),
            altered: data.altered,
        };
        setEditData(tempData);
        setEditing(!editing)
    }
    const handleClick = (num) => {
        setCurrentView(num)
    }
    const checkAdoptable = (data) => {
        if (data == null) return '';
        if (data.altered && data.microchipID != null)
            return 'Yes'
        else
            return 'No'
    }
    return (
        <main className={styles["main-content"]}>
            <div className={styles["dashboard-header"]}>
                <h1 className={styles["page-title"]}>Dog Details</h1>
                <div className={styles["dashboard-actions"]}>
                    <button onClick={() => handleClick(1)} className={styles["secondary-btn"]}>Back to Dashboard</button>
                </div>
            </div>

            <div className={styles["detail-container"]}>
                <div className={styles["detail-section"]}>
                    <h2>Basic Information</h2>
                    <div className={styles["detail-grid"]}>
                        <div className={styles["detail-item"]}>
                            <label>Name</label>
                            <span>{data != null ? data.name : ""}</span>
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Breed</label>
                            {editing && ['Unknown', 'Mixed'].includes(JSON.parse(data.breed).join(', ')) ? <input type='text' value={editData.breed} onChange={(e) => handleInput(e, 'breed')} /> : <span>{data != null && data.breed ? JSON.parse(data.breed).join(', ') : ''}</span>}
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Sex</label>
                            {editing && data?.sex === 'Unknown' ? <input type='text' value={editData.sex} onChange={(e) => handleInput(e, 'sex')} /> : <span>{data != null ? data.sex : ""}</span>}
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Age</label>
                            <span>{data != null ? data.ageForMonths : ""}</span>
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Altered</label>
                            {editing && data.altered === false ? <input value={editData.altered} onChange={(e) => handleInput(e, 'altered')} /> : <span>{data != null ? (data.altered ? 'Yes' : 'No') : 'Unknown'}</span>}
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Adoptable</label>
                            <span>{checkAdoptable(data)}</span>
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Shelter</label>
                            <span>Main Shelter</span>
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Description</label>
                            <span>{data != null ? data.description : ""}</span>
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Microchip ID</label>
                            {editing && data?.microchipID === null ? <input type='text' value={editData.microchipID} onChange={(e) => handleInput(e, 'chip')} /> : <span>{data != null ? data.microchipID : ""}</span>}
                        </div>
                    </div>
                </div>

                <div className={styles["detail-section"]}>
                    <h2>Surrender Information</h2>
                    <div className={styles["detail-grid"]}>
                        <div className={styles["detail-item"]}>
                            <label>Surrender Date</label>
                            <span>{data != null ? data.surrenderDate : ""}</span>
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Surrender Type</label>
                            <span>{data != null ? data.surrenderDate : ""}</span>
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Surrenderer Phone</label>
                            <span>{data != null ? data.surrenderPhone : ""}</span>
                        </div>
                    </div>
                </div>

                <div className={styles["detail-section"]}>
                    <h2>Expenses</h2>
                    <div className={styles["expenses-chart"]}>
                        <table className={styles["expenses-table"]}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>2024-01-15</td>
                                    <td>Medical</td>
                                    <td>Initial Checkup</td>
                                    <td>$75.00</td>
                                </tr>
                                <tr>
                                    <td>2024-01-20</td>
                                    <td>Supplies</td>
                                    <td>Food and Treats</td>
                                    <td>$45.00</td>
                                </tr>
                                <tr>
                                    <td>2024-02-01</td>
                                    <td>Medical</td>
                                    <td>Vaccinations</td>
                                    <td>$120.00</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td>Total Expenses</td>
                                    <td>$240.00</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className={styles["detail-actions"]}>
                    <button onClick={() => handleEdit()} className={styles["secondary-btn"]}>{editing ? 'Cancel' : 'Edit'}</button>
                    <button onClick={() => handleSave()} className={styles["secondary-btn"]}>Save</button>
                    <button onClick={() => handleClick(4)} className={styles["secondary-btn"]}>
                        Add Expense
                    </button>
                    <button onClick={() => handleClick(5)} className={styles["primary-btn"]}>
                        Add Adoption
                    </button>
                </div>
            </div>
        </main>
    )
}
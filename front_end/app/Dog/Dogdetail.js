import React, { useState, useEffect, useMemo } from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
export const DogDetail = () => {
    const { setCurrentView, currentView, dogId, setDogId } = useView();
    const [data, setData] = useState();
    const [expensesData, setExpensesData] = useState({
        expenses: []
    });
    const [editing, setEditing] = useState(false)
    const [editData, setEditData] = useState({})
    const [breedType, setBreedType] = useState([])
    const loadData = async () => {
        const res = await fetch('http://127.0.0.1:8000/dogs/get_dog/' + dogId);
        const result = await res.json();
        setData(result);
        const exp = await fetch('http://127.0.0.1:8000/expenses/' + dogId);
        const expdata = await exp.json();
        setExpensesData(expdata);
        const tempData = {
            sex: result.sex,
            microchipID: result.microchipID,
            altered: result.altered,
        };
        setEditData(tempData);
        loadData();
    };
    useEffect(() => {
        //fetch breed type
        const data = ['Affenpinscher', 'Boykin Spaniel', 'Finnish Spitz', 'Manchester Terrier']
        setBreedType(data)
    }, [])

    const { categoryTotals, grandTotal } = useMemo(() => {
        const totals = {};
        let grandTotal = 0;

        expensesData.expenses.forEach(expense => {
            const category = expense.expenseCategory;
            const amount = expense.expenseAmount;

            totals[category] = (totals[category] || 0) + amount;
            grandTotal += amount;
        });

        return { categoryTotals: totals, grandTotal };
    }, [expensesData]);

    const categoryLabels = {
        medical: "Medical",
        supplies: "Supplies",
        food: "Food",
        grooming: "Grooming",
        training: "Training"
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
        if (!data.is_adopted && data.altered && data.microchipID != null)
            return 'Yes'
        else
            return 'No'
    }
    const checkAdopted = (data) => {
        if (data == null) return false;
        return data.is_adopted;
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
                            {editing && ['Unknown', 'Mixed'].includes(JSON.parse(data.breed).join(', ')) ? <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg" value={editData.breed} onChange={(e) => handleInput(e, 'breed')}>
                                {breedType.map((breed) => (
                                    <option key={breed} value={breed}>
                                        {breed}
                                    </option>
                                ))}
                            </select> : <span>{data != null && data.breed ? JSON.parse(data.breed).join(', ') : ''}</span>}
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Sex</label>
                            {editing ? (data?.sex === 'Male' ? <input className="outline-solid" type='text' value={editData.sex} onChange={(e) => handleInput(e, 'sex')} /> : <span className="outline-solid">{data != null ? data.sex : ""}</span>) : <span>{data != null ? data.sex : ""}</span>}
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Age</label>
                            <span>{data != null ? data.ageForMonths : ""}</span>
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Altered</label>
                            {editing ? (data.altered === false ? <input className="outline-solid" value={editData.altered} onChange={(e) => handleInput(e, 'altered')} /> : <span className="outline-solid">{data != null ? (data.altered ? 'Yes' : 'No') : 'Unknown'}</span>) : <span>{data != null ? (data.altered ? 'Yes' : 'No') : 'Unknown'}</span>}
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
                            {editing ? (data?.microchipID === null ? <input className="outline-solid" type='text' value={editData.microchipID} onChange={(e) => handleInput(e, 'chip')} /> : <span className="outline-solid">{data != null ? data.microchipID : ""}</span>) : <span>{data != null ? data.microchipID : ""}</span>}
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
                                    <th>Vendor</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expensesData.expenses?.length > 0 ? (
                                    expensesData.expenses.map((expense, index) => (
                                        <tr key={index}>
                                            <td>{expense.expenseDate}</td>
                                            <td>{expense.expenseCategory}</td>
                                            <td>{expense.expenseVendor}</td>
                                            <td>${expense.expenseAmount.toFixed(2)}</td>
                                        </tr>
                                    )
                                    )) :
                                    <tr><td colSpan="4">No expenses found</td></tr>
                                }
                            </tbody>
                            <tfoot>
                                {Object.entries(categoryTotals).map(([category, total]) => (
                                    <tr key={`total-${category}`}>
                                        <td colSpan="2"></td>
                                        <td><strong>Total {categoryLabels[category] || category}:</strong></td>
                                        <td><strong>${total.toFixed(2)}</strong></td>
                                    </tr>
                                ))}

                                <tr>
                                    <td colSpan="2"></td>
                                    <td><strong>Grand Total:</strong></td>
                                    <td><strong>${grandTotal.toFixed(2)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className={styles["detail-actions"]}>
                    {!checkAdopted(data) && (
                        <>
                            <button onClick={() => handleEdit()} className={styles["secondary-btn"]}>
                                {editing ? 'Cancel' : 'Edit'}
                            </button>
                            <button onClick={() => handleSave()} className={styles["secondary-btn"]}>
                                Save
                            </button>
                            <button onClick={() => handleClick(4)} className={styles["secondary-btn"]}>
                                Add Expense
                            </button>
                        </>
                    )}
                    {checkAdoptable(data) === 'Yes' && (
                        <button onClick={() => handleClick(10)} className={styles["primary-btn"]}>
                            Add Adoption
                        </button>
                    )}
                </div>
            </div>
        </main >
    )
}
import React, { useState, useEffect, useMemo } from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
import { DropdownSelect } from '@/app/Common/Dropdown'
import { getDataFromBackEnd, postDataToBackEnd, getDollarAmountFormat, getCookie } from "./../utils";


export const DogDetail = () => {
    const { setCurrentView, currentView, dogId, setDogId } = useView();
    const [data, setData] = useState({});
    const [expensesData, setExpensesData] = useState({
        expenses: []
    });
    const [vendors, setVendors] = useState([]);
    const [editing, setEditing] = useState(false)
    const [editData, setEditData] = useState({
        altered: data.altered ?? '',
        sex: data.sex ?? '',
        microchipID: data.microchipID ?? '',
        microchipVendor: data.microchipVendor ?? '', // drop-down list, single selection
    })
    const [breedType, setBreedType] = useState([])
    const [multiselect, setMultiselect] = useState(false)
    const loadData = async () => {
        const res = await getDataFromBackEnd('dogs/get_dog/' + dogId);
        const result = await res.json();
        setData(result);

        const exp = await getDataFromBackEnd('expenses/' + dogId);
        const expdata = await exp.json();
        setExpensesData(expdata);
        const tempData = {
            sex: result.sex ?? '',
            microchipID: result.microchipID ?? '',
            microchipVendor: result.microchipVendor ?? '',
            altered: result.altered ?? '',
            breeds: result.breeds ?? [],
        };
        setEditData(tempData);
    };
    useEffect(() => {
        getDataFromBackEnd('dogs/get_vendors/')
            .then((data) => data.json())
            .then((data) => {
                setVendors(data['vendors']);
            })
        getDataFromBackEnd('dogs/get_breeds/')
            .then((data) => data.json())
            .then((data) => {
                setBreedType(data['breeds']);
            })
    }, [])

    console.log(data);

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

    const handleVendorChange = (event) => {
        const { name, value } = event.target;
        setEditData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSave = async () => {
        const { breeds, ...dataWithoutBreed } = editData;
        const body = JSON.stringify({
            ...dataWithoutBreed,
            is_exec: getCookie('loginType') === 3,
            user_email: getCookie('userEmail'),
        })
        const body_breed = {
            dogID: dogId,
            breed: breeds
        };
        const shouldSaveBreed = breeds.some(breed => breed !== "Unknown" || breed !== "Mixed");
        const [res1, res2] = await Promise.all([
            postDataToBackEnd('dogs/edit_dog/' + dogId + '/', body),
            shouldSaveBreed ? postDataToBackEnd('dogs/save_breed/', body_breed) : Promise.resolve({ ok: true })
        ]);
        //if success, reload dog data
        if (res1.ok && res2.ok) {
            loadData()
        } else {
            const errorRes1 = res1.ok ? "" : await res1.text();
            const errorRes2 = res2.ok ? "" : await res2.text();

            alert(errorRes1 + errorRes2);
        }
    }
    const handleMicrochipIDChange = (e) => {
        setEditData({ ...editData, microchipID: e.target.value });
    };
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
    const handleBreedChange = (value) => {
        if (value.includes('Unknown'))
            value = ['Unknown']
        else if (value.includes('Mixed'))
            value = ['Mixed']
        setEditData((prevData) => ({
            ...prevData,
            breeds: value
        }));
    }
    const handleEdit = () => {
        //reset edit data
        const tempData = {
            altered: data.altered ?? '',
            sex: data.sex ?? '',
            microchipID: data.microchipID ?? '',
            microchipVendor: data.microchipVendor ?? '',
            breeds: data.breeds,
        };
        setEditData(tempData);
        setEditing(!editing)
    }
    const handleClick = (num) => {
        setCurrentView(num)
    }
    const checkBreedType = (data) => {
        if (data == null || !Array.isArray(data.breeds)) return false;
        for (let breed of data.breeds) {
            if (breed === "Unknown" || breed === "Mixed") {
                return true;
            }
        }
        return false;
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
                            {editing && checkBreedType(data) ? <DropdownSelect selected={editData.breeds} onChange={handleBreedChange} options={breedType} multiselect={multiselect} setMultiselect={setMultiselect} /> : <span>{data != null && data.breeds ? data.breeds.join(', ') : ''}</span>}
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Sex</label>
                            {editing && data.sex === 'Unknown'
                                ? (<select id="sex" name="sex"
                                    value={editData.sex}
                                    onChange={handleChange} >
                                    <option value="" disabled hidden>
                                        Select Gender
                                    </option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="female">Unknown</option>
                                </select>)
                                : (<span >
                                    {data.sex}
                                </span>)}
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Age</label>
                            <span>{data != null ? data.ageForMonths : ""}</span>
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Altered</label>
                            {
                                editing && data.altered === 0
                                    ? (<select
                                        value={editData.altered}
                                        onChange={(e) => handleInput(e, 'altered')}>
                                        <option value={0}>No</option>
                                        <option value={1}>Yes</option>
                                    </select>)
                                    : (<span>{data.altered === 1 ? "Yes" : "No"}</span>)
                            }
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
                            {editing && data.microchipID == null
                                ? (<input
                                    className="outline-solid"
                                    type='text'
                                    value={editData.microchipID}
                                    onChange={handleMicrochipIDChange}
                                />)
                                : (<span>
                                    {data != null ? data.microchipID : ""}
                                </span>
                                )}
                        </div>
                        <div className={styles["detail-item"]}>
                            <label>Microchip Vendor</label>
                            {editing && data.microchipID == null
                                ? (<select id="microchipVendor" name="microchipVendor"
                                    defaultValue=""
                                    // value={editData.microchipVendor}
                                    // required={editData.microchipID !== ''}
                                    onChange={handleVendorChange} >
                                    <option value="" disabled hidden>
                                        Please select vendor
                                    </option>
                                    {vendors.map((vendor, index) =>
                                        <option key={index} value={vendor}>
                                            {vendor}
                                        </option>)}
                                </select>)
                                : (<span>
                                    {data != null ? data.microchipVendor : ""}
                                </span>)}
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
                                            <td>{getDollarAmountFormat(expense.expenseAmount)}</td>
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
                                        <td><strong>{getDollarAmountFormat(total)}</strong></td>
                                    </tr>
                                ))}

                                <tr>
                                    <td colSpan="2"></td>
                                    <td><strong>Grand Total:</strong></td>
                                    <td><strong>{getDollarAmountFormat(grandTotal)}</strong></td>
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
                            {getCookie('isAdult') === 'true' && (
                                <button onClick={() => handleClick(4)}
                                    className={styles["secondary-btn"]}>
                                    Add Expense
                                </button>
                            )
                            }
                        </>
                    )}
                    {checkAdoptable(data) === 'Yes' && getCookie('loginType') === "3" && (
                        <button onClick={() => handleClick(10)}
                            className={styles["primary-btn"]}
                        >
                            Add Adoption
                        </button>
                    )}
                </div>
            </div>
        </main >
    )
}
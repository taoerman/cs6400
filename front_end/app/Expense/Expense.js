import React, { useState, useEffect } from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
export const Expense = () => {
    const { setCurrentView, currentView, dogId, setDogId } = useView();
    const [categories, setCategories] = useState([]);

    const handleClick = (num) => {
        setCurrentView(num)
    }

    useEffect(() => {
        fetch('http://127.0.0.1:8000/expenses/get_all_categories/')
            .then(response => response.json())
            .then(data => {
                setCategories(data.categories || []);
            })
            .catch(error => {
                console.error('Failed to load categories:', error);
            });
    }, []);

    const [formData, setFormData] = useState({
        expenseDate: "",
        expenseVendor: "",
        expenseCategory: "",
        expenseAmount: "",
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedData = {
            dogID: dogId,
            expenseDate: formData.expenseDate,
            expenseVendor: formData.expenseVendor,
            expenseCategory: formData.expenseCategory,
            expenseAmount: formData.expenseAmount,
        };
        try {
            const response = await fetch('http://127.0.0.1:8000/expenses/add_expense/', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formattedData)
            });

            if (!response.ok) {
                throw new Error("Failed to add expense");
            }

            alert("Expense added successfully!");
            setCurrentView(1);
        } catch (error) {
            console.error("Error:", error);
            alert("Error adding expense: Expense date must be on or after surrenderDate / Duplicate expense entered");
        }
    };

    return (
        <main className={styles["main-content"]}>
            <div className={styles["dashboard-header"]}>
                <h1 className={styles["page-title"]}>Add Expense</h1>
                <div className={styles["dashboard-actions"]}>
                    <button onClick={() => handleClick(3)} className={styles["secondary-btn"]}>Back to Dog Details</button>
                </div>
            </div>

            <div className={styles["form-container"]}>
                <form id="addExpenseForm" className={styles["expense-form"]} onSubmit={handleSubmit}>
                    <div className={styles["form-section"]}>
                        <h2>Expense Details</h2>
                        <div className={styles["form-grid"]}>
                            <div className={styles["form-group"]}>
                                <label htmlFor="expenseDate">Date</label>
                                <input type="date" id="expenseDate" name="expenseDate"
                                    onChange={handleChange} required />
                            </div>

                            <div className={styles["form-group"]}>
                                <label htmlFor="expenseCategory">Category</label>
                                <select id="expenseCategory" name="expenseCategory"
                                    onChange={handleChange}
                                    defaultValue=""
                                    required>
                                    <option value="" disabled hidden>
                                        Please enter category
                                    </option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles["form-group"]}>
                                <label htmlFor="expenseAmount">Amount ($)</label>
                                <input type="number" id="expenseAmount" name="expenseAmount"
                                    step="0.01" min="0"
                                    onChange={handleChange} required
                                    placeholder="0.00" />
                            </div>

                            <div className={styles["form-group"]}>
                                <label htmlFor="expenseVendor">Vendor</label>
                                <input type="text" id="expenseVendor" name="expenseVendor"
                                    onChange={handleChange}
                                    required placeholder="Enter vendor name" />
                            </div>
                        </div>
                    </div>

                    <div className={styles["form-actions"]}>
                        <button onClick={() => handleClick(3)} type="button" className={styles["secondary-btn"]}
                        >Cancel</button>
                        <button type="submit" className={styles["primary-btn"]}>Save Expense</button>
                    </div>
                </form>
            </div>
        </main>
    )
}
import React from "react";
import styles from "./expense.module.css"
export const Expense = () => {
    return (
        <main className={styles["main-content"]}>
        <div className={styles["dashboard-header"]}>
            <h1 className={styles["page-title"]}>Add Expense</h1>
            <div className={styles["dashboard-actions"]}>
                <button href="dog-detail.html" className={styles["secondary-btn"]}>Back to Dog Details</button>
            </div>
        </div>

        <div className={styles["form-container"]}>
            <form id="addExpenseForm" className={styles["expense-form"]}>
                <div className={styles["form-section"]}>
                    <h2>Expense Details</h2>
                    <div className={styles["form-grid"]}>
                        <div className={styles["form-group"]}>
                            <label htmlFor="expenseDate">Date*</label>
                            <input type="date" id="expenseDate" name="expenseDate" required />
                        </div>

                        <div className={styles["form-group"]}>
                            <label htmlFor="expenseCategory">Category*</label>
                            <select id="expenseCategory" name="expenseCategory" required>
                                <option value="">Select Category</option>
                                <option value="medical">Medical</option>
                                <option value="supplies">Supplies</option>
                                <option value="food">Food</option>
                                <option value="grooming">Grooming</option>
                                <option value="training">Training</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className={styles["form-group"]}>
                            <label htmlFor="expenseAmount">Amount ($)*</label>
                            <input type="number" id="expenseAmount" name="expenseAmount" 
                                   step="0.01" min="0" required 
                                   placeholder="0.00" />
                        </div>

                        <div className={styles["form-group"]}>
                            <label htmlFor="expenseVendor">Vendor*</label>
                            <input type="text" id="expenseVendor" name="expenseVendor" 
                                   required placeholder="Enter vendor name" />
                        </div>

                        <div className={styles["form-group full-width"]}>
                            <label htmlFor="expenseDescription">Description*</label>
                            <textarea id="expenseDescription" name="expenseDescription" 
                                      rows="3" required 
                                      placeholder="Enter expense details..."></textarea>
                        </div>
                    </div>
                </div>

                <div className={styles["form-actions"]}>
                    <button type="button" className={styles["secondary-btn"]} 
                            onclick="window.location.href='dog-detail.html'">Cancel</button>
                    <button type="submit" className={styles["primary-btn"]}>Save Expense</button>
                </div>
            </form>
        </div>
    </main>
    )
}
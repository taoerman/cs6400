import React from "react";
import styles from './dogdetail.module.css'
export const DogDetail = () => {
    return (
        <main className={styles["main-content"]}>
        <div className={styles["dashboard-header"]}>
            <h1 className={styles["page-title"]}>Dog Details</h1>
            <div className={styles["dashboard-actions"]}>
                <button className={styles["secondary-btn"]}>Back to Dashboard</button>
            </div>
        </div>

        <div className={styles["detail-container"]}>
            <div className={styles["detail-section"]}>
                <h2>Basic Information</h2>
                <div className={styles["detail-grid"]}>
                    <div className={styles["detail-item"]}>
                        <label>Name</label>
                        <span>Max</span>
                    </div>
                    <div className={styles["detail-item"]}>
                        <label>Breed</label>
                        <span>Golden Retriever</span>
                    </div>
                    <div className={styles["detail-item"]}>
                        <label>Sex</label>
                        <span>Male</span>
                    </div>
                    <div className={styles["detail-item"]}>
                        <label>Age</label>
                        <span>2 years</span>
                    </div>
                    <div className={styles["detail-item"]}>
                        <label>Altered</label>
                        <span>Yes</span>
                    </div>
                    <div className={styles["detail-item"]}>
                        <label>Adoptable</label>
                        <span>Yes</span>
                    </div>
                    <div className={styles["detail-item"]}>
                        <label>Shelter</label>
                        <span>Main Shelter</span>
                    </div>
                    <div className={styles["detail-item full-width"]}>
                        <label>Description</label>
                        <span>Friendly and energetic Golden Retriever. Good with children and other dogs. Loves to play fetch and go for long walks. House trained and knows basic commands.</span>
                    </div>
                    <div className={styles["detail-item"]}>
                        <label>Microchip ID</label>
                        <span>985141123456789</span>
                    </div>
                </div>
            </div>

            <div className={styles["detail-section"]}>
                <h2>Surrender Information</h2>
                <div className={styles["detail-grid"]}>
                    <div className={styles["detail-item"]}>
                        <label>Surrender Date</label>
                        <span>2024-01-15</span>
                    </div>
                    <div className={styles["detail-item"]}>
                        <label>Surrender Type</label>
                        <span>Owner Surrender</span>
                    </div>
                    <div className={styles["detail-item"]}>
                        <label>Surrenderer Phone</label>
                        <span>123-456-7890</span>
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
                <a href="add-expense.html" className={styles["secondary-btn"]}>
                    Add Expense
                </a>
                <a href="adoption-application.html" className={styles["primary-btn"]}>
                    Add Adoption
                </a>
            </div>
        </div>
    </main>
    )
}
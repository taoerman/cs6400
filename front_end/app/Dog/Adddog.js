import React from "react";
import styles from './adddog.module.css'
import { useView } from '@/contexts/ViewContext';
export const AddDog = () => {
        const { setCurrentView, currentView } = useView();
        const handleClick = (num) => {
          setCurrentView(num)
        }
    return (
        <main className={styles["main-content"]}>
        <div className={styles["dashboard-header"]}>
            <h1>Add New Dog</h1>
        </div>

        <form id="addDogForm" className={styles["add-dog-form"]}>
            <div className={styles["form-section"]}>
                <h2>Basic Information</h2>
                <div className={styles["form-grid"]}>
                    <div className={styles["form-group"]}>
                        <label htmlFor="dogName">Dog Name*</label>
                        <input type="text" id="dogName" name="dogName" required />
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="breed">Breed*</label>
                        <input type="text" id="breed" name="breed" required />
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="age">Age*</label>
                        <input type="number" id="age" name="age" required />
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="gender">Gender*</label>
                        <select id="gender" name="gender" required>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles["form-section"]}>
                <h2>Health Information</h2>
                <div className={styles["form-grid"]}>
                    <div className={styles["form-group"]}>
                        <label htmlFor="weight">Weight (lbs)*</label>
                        <input type="number" id="weight" name="weight" required />
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="altered">Altered*</label>
                        <select id="altered" name="altered" required>
                            <option value="">Select Status</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="microchip">Microchip Number</label>
                        <input type="text" id="microchip" name="microchip" />
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="microchipVendor">Microchip Vendor</label>
                        <input type="text" id="microchipVendor" name="microchipVendor" />
                    </div>
                    <div className={styles["form-group full-width"]}>
                        <label htmlFor="medicalHistory">Medical History</label>
                        <textarea id="medicalHistory" name="medicalHistory" rows="4"></textarea>
                    </div>
                </div>
            </div>

            <div className={styles["form-section"]}>
                <h2>Surrender Information</h2>
                <div className={styles["form-grid"]}>
                    <div className={styles["form-group"]}>
                        <label htmlFor="surrenderDate">Surrender Date*</label>
                        <input type="date" id="surrenderDate" name="surrenderDate" required />
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="surrenderType">Surrender Type*</label>
                        <select id="surrenderType" name="surrenderType" required>
                            <option value="">Select Type</option>
                            <option value="owner">Owner Surrender</option>
                            <option value="animalControl">Animal Control</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="surrendererPhone">Surrenderer Phone Number</label>
                        <input type="tel" id="surrendererPhone" name="surrendererPhone" 
                               pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" 
                               placeholder="123-456-7890" />
                    </div>
                    <div id="animalControlFields" className={styles["form-group full-width"]}>
                        <label htmlFor="animalControlInfo">Animal Control Information</label>
                        <textarea id="animalControlInfo" name="animalControlInfo" 
                                  rows="3" 
                                  placeholder="Enter animal control officer name, badge number, and additional details"></textarea>
                    </div>
                </div>
            </div>

            <div className={styles["form-section"]}>
                <h2>Additional Information</h2>
                <div className={styles["form-grid"]}>
                    <div className={styles["form-group full-width"]}>
                        <label htmlFor="description">Description*</label>
                        <textarea id="description" name="description" rows="4" required></textarea>
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="status">Status*</label>
                        <select id="status" name="status" required>
                            <option value="">Select Status</option>
                            <option value="available">Available</option>
                            <option value="pending">Adoption Pending</option>
                            <option value="adopted">Adopted</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles["form-actions"]}>
                <button type="button" className={styles["secondary-btn"]} onClick = {()=>handleClick(1)}>Cancel</button>
                <button type="submit" className={styles["primary-btn"]}>Submit</button>
            </div>
        </form>
    </main>
    )
}
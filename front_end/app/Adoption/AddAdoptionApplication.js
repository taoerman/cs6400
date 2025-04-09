import React, { useState } from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
import { postDataToBackEnd } from "./../utils";

export const Adoption = () => {
  const { setCurrentView, currentView, dogId, setDogId } = useView();
  const handleClick = (num) => {
    setCurrentView(num)
  }
  const [formData, setFormData] = useState({
    adopterEmail: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    householdSize: "",
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
      adopterEmail: formData.adopterEmail,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      householdSize: parseInt(formData.householdSize),
      dogID: dogId,
      applicationDate: new Date().toISOString().split('T')[0]
    };
    try {
      const response = await postDataToBackEnd(
        'adoptions/add_adoption_application/',
        formattedData
      );

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      alert("Application submitted successfully!");
      setCurrentView(1);
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting application");
    }
  };
  return (
    <main className={styles["main-content"]}>
      <div className={styles["dashboard-header"]}>
        <h1 className={styles["page-title"]}>Adoption Application</h1>
        <div className={styles["dashboard-actions"]}>
          <button onClick={() => handleClick(3)} className={styles["action-btn"] + " " + styles["secondary-btn"]}>
            Back to Dog Details
          </button>
        </div>
      </div>

      <div className={styles["form-container"]}>
        <form id="adoptionForm" className={styles["adoption-form"]} onSubmit={handleSubmit}>
          <div className={styles["form-section"]}>
            <h2>Adopter Information</h2>
            <div className={styles["form-grid"]}>
              <div className={styles["form-group"]}>
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" onChange={handleChange} required />
              </div>
              <div className={styles["form-group"]}>
                <label htmlFor="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" onChange={handleChange} required />
              </div>
              <div className={styles["form-group"]}>
                <label htmlFor="email">Email</label>
                <input type="adopterEmail" id="adopterEmail" name="adopterEmail" onChange={handleChange} required />
              </div>
              <div className={styles["form-group"]}>
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  placeholder="123-456-7890"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles["form-section"]}>
            <h2>Address</h2>
            <div className={styles["form-grid"]}>
              <div className={`${styles["form-group"]} ${styles["full-width"]}`}>
                <label htmlFor="street">Street Address</label>
                <input type="text" id="street" name="street" onChange={handleChange} required />
              </div>
              <div className={styles["form-group"]}>
                <label htmlFor="city">City</label>
                <input type="text" id="city" name="city" onChange={handleChange} required />
              </div>
              <div className={styles["form-group"]}>
                <label htmlFor="state">State</label>
                <select id="state" name="state" onChange={handleChange} required>
                  <option value="">Select State</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  {/* Add other states here */}
                </select>
              </div>
              <div className={styles["form-group"]}>
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  pattern="[0-9]{5}"
                  placeholder="12345"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles["form-section"]}>
            <h2>Living Situation</h2>
            <div className={styles["form-grid"]}>


              <div className={`${styles["form-group"]} ${styles["full-width"]}`}>
                <label htmlFor="otherPets">Household Size</label>
                <input
                  type="number"
                  id="householdSize"
                  name="householdSize"
                  onChange={handleChange}
                  placeholder="Please include any other pets in your household..."
                />
              </div>
            </div>
          </div>

          <div className={styles["form-actions"]}>
            <button
              type="button"
              className={`${styles["action-btn"]} ${styles["secondary-btn"]}`}
              onClick={() => handleClick(3)}
            >
              Cancel
            </button>
            <button type="submit" className={`${styles["action-btn"]} ${styles["primary-btn"]}`}>
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
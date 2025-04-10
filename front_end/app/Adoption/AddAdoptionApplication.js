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
                  <option value="" disabled hidden>
                    Please Select a State
                  </option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
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
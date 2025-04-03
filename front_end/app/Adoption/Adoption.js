import React from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
export const Adoption = () => {
    const { setCurrentView, currentView } = useView();
    const handleClick = (num) => {
        setCurrentView(num)
      }    
      const handleSubmit = (e) => {
        e.preventDefault();
        // handle form submission logic here
      };
    return (
        <main className={styles["main-content"]}>
        <div className={styles["dashboard-header"]}>
          <h1 className={styles["page-title"]}>Adoption Application</h1>
          <div className={styles["dashboard-actions"]}>
            <button onClick = {()=>handleClick(3)} className={styles["action-btn"] + " " + styles["secondary-btn"]}>
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
                  <label htmlFor="firstName">First Name*</label>
                  <input type="text" id="firstName" name="firstName" required />
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="lastName">Last Name*</label>
                  <input type="text" id="lastName" name="lastName" required />
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="email">Email*</label>
                  <input type="email" id="email" name="email" required />
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="phone">Phone Number*</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                    placeholder="123-456-7890"
                    required
                  />
                </div>
              </div>
            </div>
  
            <div className={styles["form-section"]}>
              <h2>Address</h2>
              <div className={styles["form-grid"]}>
                <div className={`${styles["form-group"]} ${styles["full-width"]}`}>
                  <label htmlFor="street">Street Address*</label>
                  <input type="text" id="street" name="street" required />
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="city">City*</label>
                  <input type="text" id="city" name="city" required />
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="state">State*</label>
                  <select id="state" name="state" required>
                    <option value="">Select State</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    {/* Add other states here */}
                  </select>
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="zipCode">ZIP Code*</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    pattern="[0-9]{5}"
                    placeholder="12345"
                    required
                  />
                </div>
              </div>
            </div>
  
            <div className={styles["form-section"]}>
              <h2>Living Situation</h2>
              <div className={styles["form-grid"]}>
                <div className={styles["form-group"]}>
                  <label htmlFor="homeType">Home Type*</label>
                  <select id="homeType" name="homeType" required>
                    <option value="">Select Type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="ownRent">Own or Rent*</label>
                  <select id="ownRent" name="ownRent" required>
                    <option value="">Select One</option>
                    <option value="own">Own</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>
                <div className={`${styles["form-group"]} ${styles["full-width"]}`}>
                  <label htmlFor="otherPets">Other Pets in Household</label>
                  <textarea
                    id="otherPets"
                    name="otherPets"
                    rows="3"
                    placeholder="Please list any other pets in your household..."
                  ></textarea>
                </div>
              </div>
            </div>
  
            <div className={styles["form-section"]}>
              <h2>Additional Information</h2>
              <div className={styles["form-grid"]}>
                <div className={`${styles["form-group"]} ${styles["full-width"]}`}>
                  <label htmlFor="experience">Previous Pet Experience*</label>
                  <textarea
                    id="experience"
                    name="experience"
                    rows="3"
                    placeholder="Describe your experience with pets..."
                    required
                  ></textarea>
                </div>
                <div className={`${styles["form-group"]} ${styles["full-width"]}`}>
                  <label htmlFor="reason">Reason for Adoption*</label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows="3"
                    placeholder="Why would you like to adopt this dog?"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
  
            <div className={styles["form-actions"]}>
              <button
                type="button"
                className={`${styles["action-btn"]} ${styles["secondary-btn"]}`}
                onClick={()=>handleClick(3)}
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
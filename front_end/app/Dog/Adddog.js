import React, { useState, useEffect } from "react";
import styles from "@/app/styles.module.css"
import { useView } from '@/contexts/ViewContext';
import { DropdownSelect } from '@/app/Common/Dropdown'
import { getCookie, getDataFromBackEnd, postDataToBackEnd } from "./../utils";


export const AddDog = () => {
    const { setCurrentView, currentView } = useView();
    const [vendors, setVendors] = useState([]);
    const [breedsType, setBreedsType] = useState([]);
    const [multiselect, setMultiselect] = useState(true);
    const [finalDate, setFinalDate] = useState(new Date().toISOString().split('T')[0]);
    useEffect(() => {
        getDataFromBackEnd('dogs/get_vendors/')
            .then((data) => data.json())
            .then((data) => {
                setVendors(data['vendors']);
            })
        getDataFromBackEnd('dogs/get_breeds/')
            .then((data) => data.json())
            .then((data) => {
                setBreedsType(data['breeds']);
            })
    }, []);
    const handleClick = (num) => {
        setCurrentView(num)
    };
    const handleDateInput = (e) => {
        setFinalDate(e.target.value)
    }
    const [formData, setFormData] = useState({
        name: "",
        breed: [],
        age: "",
        sex: "",
        weight: "",
        altered: "",
        microchip: "",
        microchipVendor: "",
        medicalHistory: "",
        surrenderDate: new Date().toISOString().split('T')[0],
        surrenderType: "",
        surrendererPhone: "",
        animalControlInfo: "",
        description: "",
        status: ""
    });
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };
    const handleBreedChange = (value) => {
        const finalValue = Array.isArray(value) ? value : [value];
        setFormData((prevData) => ({
            ...prevData,
            breed: finalValue
        }));
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formattedData = {
            name: formData.name,
            breed: formData.breed,
            ageForMonths: parseInt(formData.age, 10) || 0,
            sex: formData.sex,
            altered: formData.altered === "yes",
            microchipID: formData.microchip || null,
            microchipVendor: formData.microchipVendor || null,
            surrenderDate: finalDate,
            surrenderedByAnimalControl: formData.surrenderType === "animalControl",
            surrenderPhone: formData.surrendererPhone || null,
            description: formData.description.trim(),
            user_email: getCookie('userEmail'),
        };

        try {
            const response = await postDataToBackEnd('dogs/add_dog/', formattedData);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Unknown error");
            }

            alert("Dog added successfully!");
            setCurrentView(1);
        } catch (error) {
            alert(error.message);
        }
    };
    return (
        <main className={styles["main-content"]}>
            <div className={styles["dashboard-header"]}>
                <h1>Add New Dog</h1>
            </div>

            <form id="addDogForm" className={styles["add-dog-form"]} onSubmit={handleSubmit}>
                <div className={styles["form-section"]}>
                    <h2>Basic Information</h2>
                    <div className={styles["form-grid"]}>
                        <div className={styles["form-group"]}>
                            <label htmlFor="name" className="required">Dog Name</label>
                            <input type="text" id="name" name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles["form-group"]}>
                            <label htmlFor="breed">Breed</label>
                            <DropdownSelect selected={formData.breed} onChange={handleBreedChange} options={breedsType} multiselect={multiselect} setMultiselect={setMultiselect} />
                        </div>
                        <div className={styles["form-group"]}>
                            <label htmlFor="age">Age</label>
                            <input type="number" id="age" name="age"
                                value={formData.age}
                                onChange={handleChange} />
                        </div>
                        <div className={styles["form-group"]}>
                            <label htmlFor="sex">Gender</label>
                            <select id="sex" name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                required>
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
                            <label htmlFor="altered">Altered</label>
                            <select id="altered" name="altered"
                                value={formData.altered}
                                onChange={handleChange} >
                                <option value="">Select Status</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div className={styles["form-group"]}>
                            <label htmlFor="microchip">Microchip Number</label>
                            <input type="text" id="microchip" name="microchip"
                                value={formData.microchip}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles["form-group"]}>
                            <label htmlFor="microchipVendor">Microchip Vendor</label>
                            <select id="microchipVendor" name="microchipVendor"
                                value={formData.microchipVendor}
                                onChange={handleChange} >
                                <option value="" disabled hidden>
                                    Please select vendor
                                </option>
                                {vendors.map((vendor, index) => <option key={index} value={vendor}>{vendor}</option>)}
                            </select>
                        </div>
                        <div className={styles["form-group"]}>
                            <label htmlFor="description">Description</label>
                            <textarea id="description" name="description" rows="4"
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className={styles["form-section"]}>
                    <h2>Surrender Information</h2>
                    <div className={styles["form-grid"]}>
                        <div className={styles["form-group"]}>
                            <label htmlFor="surrenderDate">Surrender Date</label>
                            <input type="date" id="surrenderDate" name="surrenderDate"
                                value={finalDate}
                                onChange={(e) => handleDateInput(e)}
                            />
                        </div>
                        <div className={styles["form-group"]}>
                            <label htmlFor="surrenderType">Surrender Type</label>
                            <select id="surrenderType" name="surrenderType"
                                value={formData.surrenderType}
                                onChange={handleChange} >
                                <option value="">Select Type</option>
                                <option value="owner">Owner Surrender</option>
                                <option value="animalControl">Animal Control</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className={styles["form-group"]}>
                            <label htmlFor="surrendererPhone">Surrenderer Phone Number</label>
                            <input type="tel" id="surrendererPhone" name="surrendererPhone"
                                value={formData.surrendererPhone}
                                onChange={handleChange}
                                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                placeholder="123-456-7890" />
                        </div>
                    </div>
                </div>

                <div className={styles["form-actions"]}>
                    <button type="button" className={styles["secondary-btn"]} onClick={() => setCurrentView(1)}>Cancel</button>
                    <button type="submit" className={styles["primary-btn"]}>Submit</button>
                </div>
            </form>
        </main>
    )
}
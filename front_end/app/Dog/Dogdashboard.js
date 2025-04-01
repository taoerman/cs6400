import React, { useEffect, useState } from "react"
export const Dogdashboard = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    async function loadData() {
      const res = await fetch('http://localhost:8080/dogs/get_all_dogs/'); 
      const result = await res.json();
      setData(result);
    }
    loadData();
  }, []);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th className="px-4 py-2 border">Dog ID</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Breed</th>
            <th className="px-4 py-2 border">Sex</th>
            <th className="px-4 py-2 border">Altered</th>
            <th className="px-4 py-2 border">Age (months)</th>
            <th className="px-4 py-2 border">Description</th>
            <th className="px-4 py-2 border">Microchip ID</th>
            <th className="px-4 py-2 border">Microchip Vendor</th>
            <th className="px-4 py-2 border">Surrender Date</th>
            <th className="px-4 py-2 border">Surrender Phone</th>
            <th className="px-4 py-2 border">Animal Control</th>
          </tr>
        </thead>
        <tbody className="text-gray-800">
          {data.map((dog) => (
            <tr key={dog.dog_ID} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{dog.dog_ID}</td>
              <td className="px-4 py-2 border">{dog.name}</td>
              <td className="px-4 py-2 border">{dog.breed? JSON.parse(dog.breed).join(', ') : ''}</td>
              <td className="px-4 py-2 border">{dog.sex}</td>
              <td className="px-4 py-2 border">{dog.altered ? 'Yes' : 'No'}</td>
              <td className="px-4 py-2 border">{dog.age_for_months}</td>
              <td className="px-4 py-2 border">{dog.description}</td>
              <td className="px-4 py-2 border">{dog.microchip_ID}</td>
              <td className="px-4 py-2 border">{dog.microchipVendor}</td>
              <td className="px-4 py-2 border">{dog.surrender_date}</td>
              <td className="px-4 py-2 border">{dog.surrender_phone}</td>
              <td className="px-4 py-2 border">{dog.surrenderedByAnimalControl ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
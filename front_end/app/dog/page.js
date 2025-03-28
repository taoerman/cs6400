export default async function Dog(){
    // const data = await fetch('https://localhost/api/dogs')
    const data = [
        {
          "dogID": 1,
          "name": "Bulldog Uga",
          "breed": ["Bulldog"],
          "sex": "Male",
          "altered": true,
          "ageForMonths": 10,
          "description": "Friendly and energetic",
          "microchipID": "1234567890ABCDEF",
          "microchipVendor": "HomeAgain",
          "surrenderDate": "2024-12-01",
          "surrenderPhone": "123-456-7890",
          "surrenderedByAnimalControl": false
        }
      ]
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
              <tr key={dog.dogID} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{dog.dogID}</td>
                <td className="px-4 py-2 border">{dog.name}</td>
                <td className="px-4 py-2 border">{dog.breed.join(', ')}</td>
                <td className="px-4 py-2 border">{dog.sex}</td>
                <td className="px-4 py-2 border">{dog.altered ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 border">{dog.ageForMonths}</td>
                <td className="px-4 py-2 border">{dog.description}</td>
                <td className="px-4 py-2 border">{dog.microchipID}</td>
                <td className="px-4 py-2 border">{dog.microchipVendor}</td>
                <td className="px-4 py-2 border">{dog.surrenderDate}</td>
                <td className="px-4 py-2 border">{dog.surrenderPhone}</td>
                <td className="px-4 py-2 border">{dog.surrenderedByAnimalControl ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
}
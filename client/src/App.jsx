import { useState } from 'react'

function App() {
  
  let form = {
    patientFirstName: '',
    patientLastName: '',
    providerName: '',
    primaryDiagnosis: '',
    medicationName: '',
    patientRecords: ''
  }
  const [formData, setFormData] = useState(form);
  const [loading, setLoading] = useState(false);
  const [carePlan, setCarePlan] = useState("");
  const [error, setError] = useState("");
  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);

    const response = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    setCarePlan(data.carePlan);
    setLoading(false);
  }

  function handleChange(e){
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  return (
    <>
      <form onSubmit={handleSubmit}>
          <label>Patient First Name</label>
          <input 
            name="patientFirstName" 
            value={formData.patientFirstName} 
            onChange={handleChange} 
          />

          <label>Patient Last Name</label>
          <input 
            name= "patientLastName" 
            value={formData.patientLastName} 
            onChange={handleChange} 
          />

          <label>Provider Name</label>
          <input name= 
            "providerName" 
            value={formData.providerName} 
            onChange={handleChange} 
          />

          <label>Primary Diagnosis</label>
          <input 
            name= "primaryDiagnosis" 
            value={formData.primaryDiagnosis} 
            onChange={handleChange} 
          />

          <label>Medication Name</label>
          <input 
            name= "medicationName" 
            value={formData.medicationName} 
            onChange={handleChange} 
          />

          <label>Patient Records</label>
          <input 
            name = "patientRecords" 
            value={formData.patientRecords} 
            onChange={handleChange} 
          />

          <button type="submit">Generate Care Plan</button>

          {loading && <p>Generating care plan...</p>}
          {carePlan && <p>{carePlan}</p>}
          

      </form>
    </>
  )
}

export default App

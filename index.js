const express = require('express');
const app = express();
const { randomUUID } = require('crypto');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();
//creates orders map for storing [order id] with [status] object
const orders = new Map();
const cors = require('cors');
app.use(cors());

app.use(express.json());

const port = 3001;

app.post('/api/orders', async (req, res) =>{
    const id = randomUUID();
    orders.set(id, {id, status: 'pending', data: req.body});

    const { patientFirstName, patientLastName, providerName, primaryDiagnosis, additionalDiagnoses,
            medicationName, medicationHistory, patientRecords } = req.body;

    const prompt = 
    `you are a clinical pharmacist. Generate a professional care plan for the following patient
        Patient: ${patientFirstName} ${patientLastName}
        Referring Provider: ${providerName}
        Primary Diagnosis: ${primaryDiagnosis}
        Additional Diagnoses: ${additionalDiagnoses}
        Medication: ${medicationName}
        Medication History: ${medicationHistory}
        Patient Records: ${patientRecords} 
        
        The care plan must include these four sections:
        1. Problem List / Drug Therapy Problems
        2. Goals (SMART)
        3. Pharmacist Interventions
        4. Monitoring Plan 
    `;

    
    const message = await client.messages.create({
        model: `claude-opus-4-5`,
        max_tokens: 1024,
        messages: [{role: `user`, content: prompt}]
    });

    const carePlan = message.content[0].text;

    orders.set(id, {id, status: 'completed', carePlan});
    res.json({id, status: 'completed', carePlan});
})

app.get('/api/orders/:id', (req, res) => {
    let order_id = req.params.id;
    if(orders.has(order_id)){
        const order = orders.get(order_id);
        res.json(order);
    }else{
        res.status(404).json({error: "order not found"});
    }
});

app.listen(port, () =>{
    console.log(`server running on port: ${port}`);
})

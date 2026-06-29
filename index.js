const express = require('express');
const app = express();
const { randomUUID } = require('crypto');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();
//creates orders map for storing [order id] with [status] object
//const orders = new Map();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const port = 3001;

app.post('/api/orders', async (req, res) =>{
    const id = randomUUID();
    //gievn req.body, which holds the form data
    //The form data is used in the prompt and sent by AI Api
    //The order currently holds the order responses,
    //but it should be changed to be stored in posgreSQL Database
    //using Prisma to store the orders, patient, provider, and careplan
    //
    //orders.set(id, {id, status: 'pending', data: req.body});
    

    const { patientFirstName, patientLastName, patientDOB, providerName, providerNPI, patientMRN, 
            primaryDiagnosis, additionalDiagnoses,
            medicationName, medicationHistory, patientRecords } = req.body;

    const provider = await prisma.provider.upsert({
        where: { NPI: providerNPI},
        update: {},
        create: {
            name: providerName,
            NPI: providerNPI
        }
    });

    const patient = await prisma.patient.upsert({
        where: { MRN: patientMRN },
        update: {},
        create: {
           lastName: patientLastName,
           firstName: patientFirstName,
           MRN: patientMRN,
           DOB: new Date(patientDOB)
        }
    });

    const Order = await prisma.order.create({
        data: {
            patientId: patient.id,
            providerId: provider.id,
            medications: medicationName,
            primaryDiagnosis: primaryDiagnosis,
            patientRecords: patientRecords
        }
    });

    const CarePlan = await prisma.carePlan.create({
        data:{   
            orderId: Order.id,
            content: "",
            status: "processing"
        }
    });
    
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

    await prisma.carePlan.update({
        where: {orderId: Order.id},
        data: {
            orderId: Order.id,
            content: carePlan,
            status: "completed"
        }
    });
    
    //orders.set(id, {id, status: 'completed', carePlan});
    res.json({id, status: 'completed', carePlan});
})

app.get('/api/orders/:id', async (req, res) => {
    let order_id = Number(req.params.id);

    const order = await prisma.order.findUnique({
        where: { id: order_id },
        include: {carePlan: true}
    });

    if(order !== null){
        const carePlan_content = order.carePlan.content;
        res.json(carePlan_content);
    }else{
        res.status(404).json({error: "order not found"});
    }
});

app.listen(port, () =>{
    console.log(`server running on port: ${port}`);
})


const { PrismaClient } = require("./generated/prisma");

const prisma = new PrismaClient();


async function main(){
    const patient_1 = await prisma.patient.create({
    data: {
        lastName: 'Smith',
        firstName: 'John',
        MRN: '12345678',
        DOB: new Date(2000, 9, 31),
    }
    });

    const patient_2 = await prisma.patient.create({
        data: {
            lastName: 'Doe',
            firstName: 'Charlie',
            MRN: '87654321',
            DOB: new Date(2001, 10, 2),
        }
    });

    const provider_1 = await prisma.provider.create({
        data: {
            name: 'Dr. Newman',
            NPI: '31245678',
        }
    });

    const provider_2 = await prisma.provider.create({
        data: {
            name: 'Dr. Lee',
            NPI: '02145678',
        }
    });

    const Order_1 = await prisma.order.create({
        data: {
            patientId: patient_1.id,
            providerId: provider_1.id,
            medications: 'IVIG',
            primaryDiagnosis: 'G70.01',
            patientRecords: 'Progressive muscle weakness over 2 weeks'
        }
    });

    const Order_2 = await prisma.order.create({
        data: {
            patientId: patient_2.id,
            providerId: provider_1.id,
            medications: 'IVIG',
            primaryDiagnosis: 'G70.01',
            patientRecords: 'Progressive muscle weakness over 2 weeks'
        }
    });

    const CarePlan_1 = await prisma.carePlan.create({
        data:{
            orderId: Order_1.id,
            content: 'filled content',
            status: 'completed'
        }
    });

    const CarePlan_2 = await prisma.carePlan.create({
        data: {
            orderId: Order_2.id,
            content: 'filled content',
            status: 'completed'
        }
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());






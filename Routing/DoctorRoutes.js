//   Routing                              ## doctor - operations ##

const express=require("express")
const jwt = require("jsonwebtoken")

const router = express.Router()

const doctor = require("../Models/doctorModel")
const {authenticateTokenDoc} = require("../Middleware/authenticateToken")
const patient = require('../Models/patientModel')
const prescription = require('../Models/prescriptionModel')
const medicine = require('../Models/medecinModel')


//creating doctor object - SIGN UP -- 
router.post("/signup",async(req,res) => {
    const {registrationNumber,specialization,name,phone_no,password} =req.body

    if(!registrationNumber ||!specialization|| !name || !phone_no || !password){
        return res.status(400).json({error:"name, phone number and password are required."})
    }
    try {
        //check registration number exists 
        const checkIfregistrationNumberExists=await doctor.findOne({registrationNumber})
        if (checkIfregistrationNumberExists){
            return res.status(400).json({error:"Account already exists."})
        }

        //create new doctor 
        const newDoctor=new doctor({registrationNumber,specialization,name,phone_no,password})
        await newDoctor.save()
        res.status(200).json({message: "User Account created successfully!!.. "})

    } catch (error) {
        res.status(500).json({error:"Internal Server Error",details:error.message})
    }
})



// login -- 

router.post("/login",async(req,res) => {
    const {registrationNumber,password} =req.body
    try {
        const foundDoctor = await doctor.findOne({registrationNumber})
        if (!foundDoctor){
            return res.status(400).json({error:"Invalid uniqueId or password !!!"})
        }
        //compare typed password with existing password
        const isPasswordValid=await foundDoctor.comparePassword(password)
        if (isPasswordValid){
            //generate jwt token 
            const token =jwt.sign({userId:foundDoctor._id},"jwt.Secret",{expiresIn:'1hr'})

            res.status(200).json({token})
        }
        else{
            //invlid password
            res.status(401).json({error:"Invalid username or password.."})
        }
    }catch (error) {
        res.status(500).json({error:"Internal Server Error",details:error.message})
    }
})


// search details of patient -- 

router.get("/searchPatient/:uniqueId", async(req,res) => {
    try {
        
        const {uniqueId} = req.params
        const patientInfo = await patient.findOne({uniqueId})
        if (!patientInfo){
            return res.status(404).json({error:"object not found",details:error.message})
        }

        res.status(200).json({ name: patientInfo.name, phoneNumber: patientInfo.phone_no ,uniqueId: patientInfo.uniqueId})

    } catch (error) {
        res.status(500).json({error:"Internal Server Error",details:error.message})
    }
})

// add tablets to this patient

router.post('/addMedicines/:uniqueId',authenticateTokenDoc, async (req, res) => {
    const userId = req.doctor.userId
    const { uniqueId } = req.params
    const { medicines: medicineDetails } = req.body
  
    try {
        const currentDoc = await doctor.findById(userId)
        const patientFound = await patient.findOne({uniqueId})
        if (!patientFound) {
            return res.status(404).json({ error: 'Patient not found' })
        }
        
        const newPrescription = {
            Medicines: [],
            sent_to:(patientFound.name,patientFound.uniqueId),
            sent_by:(currentDoc.name,currentDoc.registrationNumber),
            sent: true,
        };
    
        for (const medicineDetail of medicineDetails) {
            const { name, mg, quantity } = medicineDetail
    
            const Medicine = await medicine.findOne({ name, mg })
            if (Medicine) {
                newPrescription.Medicines.push({
                    Medicine: Medicine.name,
                    mg:Medicine.mg,
                    quantity,
                    price:Medicine.price * quantity
                })
            }
            else {
              // If the medicine is not found, you might want to handle it (e.g., return an error)
              return res.status(404).json({message:"Given medicine not found"})
            }
        }
    
        const savedPrescription = await prescription.create(newPrescription)
        await patient.updateOne({ _id: patientFound._id }, { $push: { prescriptions: savedPrescription}});
    
        res.status(200).json({ message: 'Medicines added to prescription successfully', prescription: savedPrescription })
    } catch (error) {
    //   console.error(error)
      res.status(500).json({ error: 'Internal Server Error' ,details:error.message})
    }
})



// display the details in the profile section 

router.get('/profile', authenticateTokenDoc, async (req, res) => {
    const userId = req.doctor.userId
    try {
        // Find the patient by userId
        const foundDoctor = await doctor.findById(userId)

        if (!foundDoctor) {
            return res.status(404).json({ error: 'Patient not found' })
        }

        const {name,registrationNumber,phone_no}=foundDoctor
        const extractedData = {name,registrationNumber,phone_no}

        // Respond with the patient details
        res.status(200).json(extractedData)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message })
    }
})

// displaying only the uniqueId in the home section 

router.get('/home', authenticateTokenDoc, async (req, res) => {
    const userId = req.doctor.userId
    try {
        // Find the patient by userId
        const foundDoctor = await doctor.findById(userId)

        if (!foundDoctor) {
            return res.status(404).json({ error: 'Patient not found' })
        }
        const {registrationNumber}=foundDoctor
        const extractedData = {registrationNumber}
        // Respond with the patient details
        res.status(200).json(extractedData)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message })
    }
})


module.exports = router 
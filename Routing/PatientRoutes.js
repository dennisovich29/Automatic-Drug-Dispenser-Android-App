//   Routing                              ## patient - operations ##

const express=require("express")
const jwt = require("jsonwebtoken")

const router = express.Router()
const medicine =require("../Models/medecinModel")
const patient = require("../Models/patientModel")
const prescription = require("../Models/DocprescriptionModel")
const qrcode = require("qrcode")
const {authenticateTokenPatient} = require("../Middleware/authenticateToken")

// generating a 6 digit number using math 
function generateRandomNumber() {
    return Math.floor(Math.random() * 1000000) 
}

//creating patient object - SIGN UP -- 
router.post("/signup",async(req,res) => {
    const {name,phone_no,password} =req.body

    if(!name || !phone_no || !password){
        return res.status(400).json({error:"name, phone number and password are required."})
    }
    try {
        //check name exists 
        const checkIfnameExists=await patient.findOne({name})
        if (checkIfnameExists){
            return res.status(400).json({error:"name already taken."})
        }

        //create new patient 
        const newPatinet=new patient({name,phone_no,password,uniqueId:generateRandomNumber()})
        await newPatinet.save()
        res.status(200).json({message: "User registration successful!!.. "})

    } catch (error) {
        res.status(500).json({error:"Internal Server Error",details:error.message})
    }
})


// login -- 

router.post("/login",async(req,res) => {
    const {uniqueId,password} =req.body
    try {
        const foundPatient = await patient.findOne({uniqueId})
        if (!foundPatient){
            return res.status(400).json({error:"Invalid uniqueId or password !!!.."})
        }
        //compare typed password with existing password
        const isPasswordValid=await foundPatient.comparePassword(password)
        if (isPasswordValid){
            //generate jwt token 
            const token =jwt.sign({userId:foundPatient._id},"jwt.Secret",{expiresIn:'1hr'})

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


// display details of patient -- 

router.get("/profile/:uniqueId", async(req,res) => {
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

// display the details in the profile section 

router.get('/profile', authenticateTokenPatient, async (req, res) => {
    const userId = req.patient.userId
    try {
        // Find the patient by userId
        const foundPatient = await patient.findById(userId)

        if (!foundPatient) {
            return res.status(404).json({ error: 'Patient not found' })
        }
        const {name,uniqueId,phone_no}=foundPatient
        const extractedData = {name,uniqueId,phone_no}
        // Respond with the patient details
        res.status(200).json(extractedData)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message })
    }
})

// displaying only the uniqueId in the home section 

router.get('/home', authenticateTokenPatient, async (req, res) => {
    const userId = req.patient.userId
    try {
        // Find the patient by userId
        const foundPatient = await patient.findById(userId)

        if (!foundPatient) {
            return res.status(404).json({ error: 'Patient not found' })
        }
        const {uniqueId}=foundPatient
        const extractedData = {uniqueId}
        // Respond with the patient details
        res.status(200).json(extractedData)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message })
    }
})

// medicine search suggestion 
router.get('/selfPrescription/search', async (req, res) => {
    const { query } = req.body
  
    try {
      // Use Mongoose's text search for basic case-insensitive search
      const suggestions = await medicine.find(
        { name: { $regex: new RegExp(`^${query}`, 'i') } } ,
        { _id: 0, name: 1, mg: 1 },
      ).limit(5) // Limit the number of suggestions
  
      res.status(200).json({ suggestions })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal Server Error ' ,details:error.message})
    }
})
  

// self prescription

router.post('/selfPrescription',authenticateTokenPatient, async (req, res) => {
    const userId = req.doctor.userId
    const { medicines: medicineDetails } = req.body
  
    try {
        const currentDoc = await doctor.findById(userId)
        const patientFound = await patient.findOne({uniqueId})
        if (!patientFound) {
            return res.status(404).json({ error: 'Patient not found' })
        }
        
        const newPrescription = {
            sent_to:{name: patientFound.name,uniqueId:patientFound.uniqueId},
            sent_by:{name:currentDoc.name,registrationNumber:currentDoc.registrationNumber},
            Medicines: [],
            sent: true,
        }
    
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
    
        const prescriptionInstance = new prescription(newPrescription)
        const savedPrescription = await prescriptionInstance.save()
    
        res.status(200).json({ message: 'Medicines added to prescription successfully', prescription: savedPrescription })
    } catch (error) {
    //   console.error(error)
      res.status(500).json({ error: 'Internal Server Error' ,details:error.message})
    }
})


// generate qr 

router.get('/generateQR/:prescriptionId', async (req, res) => {
    const { prescriptionId } = req.params

    try {
        const savedPrescription = await prescription.findById(prescriptionId)
        if (!savedPrescription) {
            return res.status(404).json({ error: 'Prescription not found' })
        }

        // Extracting relevant data for the QR code
        const qrData = savedPrescription.Medicines.map(medicine => ({
            name: medicine.Medicine_name,
            mg: medicine.mg,
            quantity: medicine.quantity,
        }))

        // Generate QR code image
        const qrImage = await qrcode.toDataURL(JSON.stringify(qrData))

        res.status(200).json({ message: 'QR code generated successfully', qrImage })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message })
    }
})


// to get all medicines 
router.get('/medicines',async(req, res) => {
    const allMed= await medicine.find({})
    res.json({ allMed })
})

module.exports = router 

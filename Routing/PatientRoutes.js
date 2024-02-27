//   Routing                              ## patient - operations ##

const express=require("express")
const jwt = require("jsonwebtoken")
const qrcode = require("qrcode")
const router = express.Router()
const medicine =require("../Models/medecinModel")
const patient = require("../Models/patientModel")
const prescription = require("../Models/DocprescriptionModel")
const selfprescription = require("../Models/SelfprescriptionModel")
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
        const generatedUniqueId = generateRandomNumber()
        const newPatinet=new patient({name,phone_no,password,uniqueId:generatedUniqueId})
        await newPatinet.save()
        res.status(200).json({UniqueId : generatedUniqueId})

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
            const token =jwt.sign({userId:foundPatient._id},"jwt.Secret",{expiresIn:'5hr'})

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

router.get('/home/patientUniqueId', authenticateTokenPatient, async (req, res) => {
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

// get latest selfprescription details 


router.get("/home_",authenticateTokenPatient, async(req,res) => {
    const userId=req.patient.userId
    try {
        const foundPatient = await patient.findById(userId)
        const {uniqueId}=foundPatient

        const latestSelfPrescription = await selfprescription
        .findOne({"prescribed_by":uniqueId})
        .sort({ date: -1 })
        .populate("_id")

        if (latestSelfPrescription) {
            // Extract the doctor's name and the number of medicines in the prescription

            const { prescribed_by, Medicines, price ,_id,date} = latestSelfPrescription

            const numberOfMedicines = Medicines.length

            res.status(200).json({prescribed_by,numberOfMedicines,Medicines,price,_id,date})
        }else{
        res.status(404).json({message:"No prescription prescribed yet."})}    
    }catch(error){
        res.status(500).json({error:"Internal Server Error",details:error.message})
    }
})

router.get("/home",authenticateTokenPatient, async(req,res) => {
    const userId=req.patient.userId
    try {
        const foundPatient = await patient.findById(userId)
        const {uniqueId}=foundPatient
        const latestPrescription = await prescription
        .findOne({"sent_to.uniqueId":uniqueId})
        .sort({ date: -1 })
        .populate("sent_by", "name")


        if (latestPrescription ) {
            // Extract the doctor's name and the number of medicines in the prescription
            const { sent_by, Medicines, price ,_id,date} = latestPrescription

            const doctorName = sent_by.name
            const numberOfMedicines = Medicines.length

            res.status(200).json({doctorName,numberOfMedicines,Medicines,price,_id,date})
        }else{
        res.status(404).json({message:"No prescription prescribed yet."})}    
    }catch(error){
        res.status(500).json({error:"Internal Server Error",details:error.message})
    }
})


// get all prescriptions 

router.get("/previousPrescription",authenticateTokenPatient, async(req,res) => {
    const userId=req.patient.userId
    try {
        const foundPatient = await patient.findById(userId)
        const {uniqueId}=foundPatient

        const Prescriptions = await prescription.find({"sent_to.uniqueId":uniqueId}).sort({ date: -1 }).limit(10)
        const SelfPrescriptions = await selfprescription.find({"prescribed_by":uniqueId}).sort({ date: -1 }).limit(10)
        console.log(Prescriptions,SelfPrescriptions)
        let allPrescriptions = []
        Array.prototype.push.apply(allPrescriptions, SelfPrescriptions);
        Array.prototype.push.apply(allPrescriptions, Prescriptions);
        console.log(allPrescriptions)
        if(allPrescriptions != null ){
            let listOfPrescriptions = []
            for(const onePrescription of allPrescriptions){
                const { sent_by, Medicines, price ,_id} = onePrescription
                const numberOfMedicines = Medicines.length
                const details = {_id,sent_by,numberOfMedicines,Medicines,price}
                listOfPrescriptions.push(details)
            }
            res.status(200).json(listOfPrescriptions)
        }
        else{
            res.status(404).json({message:"No prescription prescribed yet."})
        }  
    }catch(error){
        res.status(500).json({error:"Internal Server Error",details:error.message})
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
    const userId = req.patient.userId
    const { medicines: medicineDetails } = req.body
  
    try {
        const currentPatient = await patient.findById(userId)
        const {uniqueId}= currentPatient
        const newPrescription = {
            prescribed_by:uniqueId,
            Medicines: [],
            scanned: false,
        }

        let addedPrescription = false
    
        for (const medicineDetail of medicineDetails) {
            const { name, mg, quantity,days,time } = medicineDetail
    
            const Medicine = await medicine.findOne({ name, mg })
            if (Medicine) {
                newPrescription.Medicines.push({
                    Medicine_name: Medicine.name,
                    mg:Medicine.mg,
                    quantity,
                    days:days,
                    time:time,
                    price:Medicine.price * quantity
                })
                addedPrescription = true
            }
            else {
              // If the medicine is not found, you might want to handle it (e.g., return an error)
              return res.status(404).json({message:"Given medicine not found"})
            }
        }
        if(!addedPrescription){
            res.status(401).json({message:"No medicine added to prescribe"})
        }
    
        const prescriptionInstance = new selfprescription(newPrescription)
        const savedPrescription = await prescriptionInstance.save()
    
        res.status(200).json({ message: 'Medicines added to prescription successfully', prescription: savedPrescription })
    } catch (error) {
    //   console.error(error)
      res.status(500).json({ error: 'Internal Server Error' ,details:error.message})
    }
})


// generate qr for selfprescription 

router.get('/viewSelfPrescription/:prescriptionId', async (req, res) => {
    const { prescriptionId } = req.params

    try {
        const savedPrescription = await selfprescription.findById(prescriptionId)
        if (!savedPrescription) {
            return res.status(404).json({ error: 'Prescription not found' })
        }
        if(!savedPrescription.scanned){
            // Extracting relevant data for the QR code
            const prescriptionData = savedPrescription.Medicines.map(medicine => ({
                name: medicine.Medicine_name,
                quantity: medicine.quantity,
            }))

            // Generate QR code image
            const qrData = await qrcode.toDataURL(JSON.stringify(prescriptionData))

            res.status(200).json({ message: 'Generated successfully', prescriptionData,qrData})
        }
        else{
            res.status(404).json({message:"QR Expired"})
        }
        
        // res.status(200).json({qrData})
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message })
    }
})

// qr for doc prescription 

router.get('/viewDocPrescription/:prescriptionId', async (req, res) => {
    const { prescriptionId } = req.params

    try {
        const savedPrescription = await prescription.findById(prescriptionId)
        if (!savedPrescription) {
            return res.status(404).json({ error: 'Prescription not found' })
        }
        if(!savedPrescription.scanned){
            // Extracting relevant data for the QR code
            const prescriptionData = savedPrescription.Medicines.map(medicine => ({
                name: medicine.Medicine_name,
                quantity: medicine.quantity,
            }))

            // Generate QR code image
            const qrData = await qrcode.toDataURL(JSON.stringify(prescriptionData)) // json to Base64
            
            // const qrData = JSON.stringify(prescriptionData)  // json to string 

            res.status(200).json({ message: 'Generated successfully', qrData,prescriptionData})
        }
        else{
            res.status(404).json({message:"QR Expired"})
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message })
    }
})


// to get all medicines 
router.get('/medicines',async(req, res) => {
    const allMed= await medicine.find({})
    let listOfMed = []

    for( const med of allMed ){
        let one_med={}
        one_med={medName:med.name,medMg:med.mg,medPrice:med.price}
        listOfMed.push(one_med)
    }

    res.status(200).json({listOfMed})
    
})


// updating the prescription for self prescription 

router.put("/selfPrescription/:prescriptionId",async(req,res) => {
    const {prescribeId} = req.params
    try {
        const existingPrescriptionId = await(selfprescription.findById(prescribeId))
        if(!existingPrescriptionId){
            return 
            res.status(404).json({message:"Prescription not found"})

        }
        existingPrescriptionId.Medicines = req.body.Medicines
        await existingPrescriptionId.save()
        res.status(200).json({message:"Prescription updated"})
        
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message })
    }
})
module.exports = router 

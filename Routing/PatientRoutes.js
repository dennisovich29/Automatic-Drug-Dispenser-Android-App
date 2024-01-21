//   Routing                              ## patient - operations ##

const express=require("express")
const jwt = require("jsonwebtoken")

const router = express.Router()

const patient = require("../Models/patientModel")
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
        res.status(200).json({message: "User registration successful!!.."})

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
        const foundPatient = await patient.findById(userId);

        if (!foundPatient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        const {name,uniqueId,phone_no}=foundPatient
        const extractedData = {name,uniqueId,phone_no}
        // Respond with the patient details
        res.status(200).json(extractedData);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// displaying only the uniqueId in the home section 

router.get('/home', authenticateTokenPatient, async (req, res) => {
    const userId = req.patient.userId
    try {
        // Find the patient by userId
        const foundPatient = await patient.findById(userId);

        if (!foundPatient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        const {uniqueId}=foundPatient
        const extractedData = {uniqueId}
        // Respond with the patient details
        res.status(200).json(extractedData);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});


// view the sent prescription 



module.exports = router 
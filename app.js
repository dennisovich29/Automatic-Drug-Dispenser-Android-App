const express=require("express")
const mongoose=require("mongoose")
const port = 8000
const app=express()
const uri = "mongodb+srv://dennisovich:$dennis_paul$@psaddcluster.0xqhuac.mongodb.net/ADD_Database?retryWrites=true&w=majority"
app.use(express.json())

// importing routes 
const patientRoutes = require("./Routing/PatientRoutes")
const doctorRoutes = require("./Routing/DoctorRoutes")

// use the routes 
app.use("/patient",patientRoutes)
app.use("/doctor",doctorRoutes)

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);

    console.log('Connected to MongoDB');

    // Start the server
    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
// Call the async function to start the server
startServer();





























// mongoose.connect(docuri)
// // mongoose.connect(docuri)
// .then(() => {
//     app.listen(8000,(res,req) => {
//         console.log("server started at port 8000 .... ")
//     })
//     console.log("connected....to mongoDB")
// }).catch((error) => {
//     res.status(500).json({message:message.error,details:error.message})
//     process.exit(1);
// })




// const medicines = require("./MODELS/medecinModel")

// // routing 

// // retreving the whole medicine list 
// app.get("/medicines",async(req,res) => {
//     try{
//         const med = await medicines.find({})
//         res.status(200).json(med)
//     }
//     catch(error){
//         res.status(500).json({message: message.error})
//     }
// })

// //retreving one single tablet from the data base
// app.get("/medicines/:id",async(req,res) => {
//     try{
//         const {id}=req.params
//         const med = await medicines.findById(id)
//         res.status(200).json(med)
//     }
//     catch(error){
//         res.status(500).json({message: message.error})
//     }
// })

// //update the data base by one tablet 
// app.put("/medicines/:id",async(req,res) => {
//     try {
//         const {id}=req.params
//         const med = await medicines.findByIdAndUpdate(id,req.body)
//         if(!med){
//             return res.status(404).json({message: `cant find medicine by the id ${id}`})
//         }
//         res.status(200).json(med)

//     } catch (error) {
//         res.status(500).json({message: message.error})
//     }
// })

// // delete the tablet from the data base
// app.delete("/medicines/:id",async(req,res) => {
//     try {
//         const {id} = req.params
//         const med= await medicines.findByIdAndDelete(id)
//     } catch (error) {
//         res.status(500).json({message: message.error})
//     }
// })

// // adding a medicine into database
// app.post("/medicines",async(req,res) => {
//     try{
//         const med = await medicines.create(req.body)
//         res.status(200).json(med)
    
//     }catch(error){
//         console.log(error)
//         res.status(500).json({message: error.message})
//     }
// })


// // adding a docotor into database 
// app.post("/patient",async(req,res) => {
//     try{
//         const med = await doctors.create(req.body)
//         res.status(200).json(med)
    
//     }catch(error){
//         console.log(error)
//         res.status(500).json({message: error.message})
//     }
// })

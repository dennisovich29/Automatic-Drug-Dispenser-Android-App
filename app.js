const express=require("express")
const mongoose=require("mongoose")
const port = 7000
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
    await mongoose.connect(uri)

    console.log('Connected to MongoDB')

    // Start the server
    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`)
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}
// Call the async function to start the server
startServer()

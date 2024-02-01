const mongoose =require("mongoose")
const bcrypt=require("bcrypt")

const patientSchema = new mongoose.Schema(
    {
        name:{type :String,required:true},
        phone_no:{type:String,required:true,
            validate: {
                validator:  function (value) {
                // Validate that the phone number is a 10-digit number
                    return /^[0-9]{10}$/.test(value);
                },
                message: 'Invalid phone number format'
            }
        },
        password:{type:String,required:true},
        uniqueId:{type:Number,required:true,unique:true},
    },
    {
        timestamps:true
    }
)

// crypting the password before savng into db
patientSchema.pre("save",async function (next){
    const patient =this
    if(!patient.isModified('password')) return next()

    const hashedPassword=await bcrypt.hash(patient.password,10)
    patient.password=hashedPassword
    next()
})


// comparing the passwords
patientSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
};

const patient = mongoose.model("patient",patientSchema)

<<<<<<< HEAD
module.exports = patient
=======
module.exports = patient
>>>>>>> Initial commit

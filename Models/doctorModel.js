const mongoose =require("mongoose")
const bcrypt=require("bcrypt")

const doctorSchema = new mongoose.Schema(
    {

        registrationNumber:{type:Number,required:true,unique:true},
        name:{type :String,required:true},
        specialization:{type:String,required:true}
            validate: {
                validator:  function (value) {
                // Validate that the phone number is a 10-digit number
                    return /^[0-9]{10}$/.test(value);
                },
                message: 'Invalid phone number format'
            },
        prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'prescription' }],
        password:{type:String,required:true},
        
    },
    {
        timestamps:true
    }
)

// crypting the password before savng into db
doctorSchema.pre("save",async function (next){
    const doctor =this
    if(!doctor.isModified('password')) return next()

    const hashedPassword=await bcrypt.hash(doctor.password,10)
    doctor.password=hashedPassword
    next()
})


// comparing the passwords
doctorSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
};


const doctor = mongoose.model("doctor",doctorSchema)

module.exports = doctor

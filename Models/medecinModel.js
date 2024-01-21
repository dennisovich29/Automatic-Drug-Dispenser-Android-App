const mongoose =require("mongoose")
const medicineSchema = new mongoose.Schema(
    {
        name:{
            type :String,
            required:true
        },
        mg:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        needPrescription:{
            type : Boolean,
            required: true,
            default:true
            
        } ,
    },
    {
        timestamps:true
    }
)

const medicine = mongoose.model("medicine",medicineSchema);

module.exports = medicine


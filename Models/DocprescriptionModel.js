const mongoose = require("mongoose")


const prescriptionSchema = new mongoose.Schema({
  prescriptionId:mongoose.Schema.Types.ObjectId,
  sent_to :({name:{type:String},uniqueId:{type:Number}}),
  sent_by :({name:{type:String},registrationNumber:{type:Number}}),
    
  Medicines: [{
      Medicine_name:{type:String},
      mg:{type:Number},
      quantity: {type:Number},
      price:{type:Number}
  }],
  Timestamp: { type: Date,default:new Date()},
  scanned: { type: Boolean, default: false },
})

const prescription = mongoose.model("prescription",prescriptionSchema)

module.exports = prescription

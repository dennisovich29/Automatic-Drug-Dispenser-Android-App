const mongoose = require("mongoose")


const selfprescriptionSchema = new mongoose.Schema({

  prescriptionId:mongoose.Schema.Types.ObjectId,
  prescribed_by:{type:Number},
  date: { type: Date,default:new Date()},    
  Medicines: [{
      Medicine:{type:String},
      mg:{type:Number},
      quantity: {type:Number},
      price:{type:Number}
  }],

  scanned: { type: Boolean, default: false },
})

const selfprescription = mongoose.model("selfprescription",selfprescriptionSchema)

module.exports = selfprescription

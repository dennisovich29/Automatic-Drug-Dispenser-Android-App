const mongoose = require("mongoose")


const selfprescriptionSchema = new mongoose.Schema({

  prescriptionId:mongoose.Schema.Types.ObjectId,
  prescribed_by:{type:Number},
  Timestamp: { type: Date,default:new Date()},    
  Medicines: [{
      Medicine:{type:String},
      mg:{type:Number},
      quantity: {type:Number},
      price:{type:Number}
  }],

<<<<<<< HEAD
  sent: { type: Boolean, default: false },
=======
  scanned: { type: Boolean, default: false },
>>>>>>> Initial commit
})

const selfprescription = mongoose.model("selfprescription",selfprescriptionSchema)

module.exports = selfprescription

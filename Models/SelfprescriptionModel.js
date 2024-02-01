const mongoose = require("mongoose")


const selfprescriptionSchema = new mongoose.Schema({

  date:{type:Date,default:Date.now},
    
  Medicines: [{
      Medicine:{type:String},
      mg:{type:Number},
      quantity: {type:Number},
      price:{type:Number}
  }],

  sent: { type: Boolean, default: false },
})

const selfprescription = mongoose.model("selfprescription",selfprescriptionSchema)

module.exports = selfprescription

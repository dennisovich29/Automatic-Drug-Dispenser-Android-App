const mongoose = require("mongoose")


const prescriptionSchema = new mongoose.Schema({

  date:{type:Date,default:Date.now},
    
  Medicines: [{
      Medicine:{type:String},
      mg:{type:Number},
      quantity: {type:Number},
      price:{type:Number}
  }],

  sent: { type: Boolean, default: false },
})

const prescription = mongoose.model("prescription",prescriptionSchema)

module.exports = prescription

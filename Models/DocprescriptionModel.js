const mongoose = require("mongoose")
const moment = require("moment-timezone")

moment.tz.setDefault('Asia/Kolkata')

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
  date: { type: String,default:() => moment().format('MMM DD YYYY , h:mm:ss A')},
  scanned: { type: Boolean, default: false },
})

const prescription = mongoose.model("prescription",prescriptionSchema)

module.exports = prescription

const mongoose = require("mongoose")
const moment = require("moment-timezone")

moment.tz.setDefault('Asia/Kolkata')

const selfprescriptionSchema = new mongoose.Schema({

  prescriptionId:mongoose.Schema.Types.ObjectId,
  prescribed_by:{type:Number},
  date: { type: String,default:() => moment().format('MMM DD YYYY , h:mm:ss A')},
  Medicines: [{
      Medicine_name:{type:String},
      mg:{type:Number},
      quantity: {type:Number},
      days:{type:String},
      time:{type:String},
      price:{type:Number}
  }],
  type:{type:String,default:"self"},
  scanned: { type: Boolean, default: false },
})

const selfprescription = mongoose.model("selfprescription",selfprescriptionSchema)

module.exports = selfprescription

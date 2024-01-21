const mongoose = require("mongoose")
const medicine = require("./medecinModel")
const patient = require("./patientModel")
const { Double } = require("mongodb")


const prescriptionSchema = new mongoose.Schema({
    Medicines: [{
        Medicine:{type:String},
        mg:{type:Number},
        quantity: {type:Number},
        price:{type:Number}
      }],
    sent_to :({name:{type:String},uniqueId:{type:Number}}),
    sent_by :({name:{type:String},registrationNumber:{type:Number},specialization:{type:String}}),
    date:{type:Date,default:Date.now},
    sent: { type: Boolean, default: false },
})

const prescription = mongoose.model("prescription",prescriptionSchema)

module.exports = prescription

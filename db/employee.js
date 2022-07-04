// For storing employee table data

const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.DB_CONNECT;
mongoose.connect(url);

mongoose.connection
    .once('open', function () {
        console.log('Successfully connected to Database employee collection...');
    })
    .on('error', function (err) {
        console.log(err);
    });

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter name"]
    },
    username: {
        type: String,
        required: [true, "Enter username"]
    }, //email
    gender: {
        type: String,
        required: [true, "Select Gender"]
    },
    status: {
        type: String,
        required: [true, "Select Status"]
    },
    dob: {
        type: String,
        required: [true, "Enter Date Of Birth"]
    }
});

const Employee = new mongoose.model("Employee", employeeSchema);

module.exports = Employee;
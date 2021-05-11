const prompt = require('prompt-sync')();
const number = Number(prompt("Enter a number "));

if(number % 2 === 0)    
    console.log('Even');
else
    console.log('Odd');
const prompt = require("prompt-sync")();
const number = Number(prompt("Enter a number "));

const reversedNumber = parseFloat(number.toString().split('').reverse().join(''))*Math.sign(number);
console.log(
    "Reversed Number is : "+reversedNumber
);

// function reversedNumber(number){
//     if(number / 10 === 0){
//         console.log("Reverse is "+number);
//     }else{
//         let rem, rev=0;
//         while(number>0){
//             console.log(rem);
//             console.log(rev);
//             console.log(number);
//             if(number / 10 >= 0)
//                 rem = Math.floor(number / 10);
//             else 
//                 rem = Math.ceil(number / 10);
//             rev=rev*10+rem;
//             number = Number(number / 10);
//         }console.log("Reverse is "+rev);
//     }
// }

// reversedNumber(number);
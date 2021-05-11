function fact(number){
    if(number === 0 || number === 1){
        return 1;
    }else{
        let factorial = 1;
        while(number>0){
            factorial = factorial * number;
            number-=1;
        }
        return factorial;
    }
}
const prompt = require("prompt-sync")();
const number=prompt("Enter a number : ");
console.log("Factorial of the number is : "+fact(Number(number)));
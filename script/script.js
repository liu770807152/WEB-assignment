import Calculator from "./calculator.js";

window.onload = (event) => {
    let keys = document.querySelector(".calculator-keys");
    let screen = document.querySelector(".calculator-screen");
    let equalKey = document.querySelector(".equal");
    let calculator = new Calculator(keys, screen, equalKey);

    calculator.equalKey.addEventListener("click", () => {
        screen.value = calculator.getResult();
    });
    calculator.keys.addEventListener("click", (event) => {
        calculator.updateEquation(event.target.value);
    });
        
};
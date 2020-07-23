// all operators and their priorities
let op = new Map([["(", 0], [")", 0], ["+", 1], ["-", 1], ["*", 2], ["/", 2]]);

/**
 * @param {String} value 
 * @returns true if given string is an operator
 */
function isOperator(value) {
    return op.has(value);
}

/**
 * @param {String} str 
 * @returns the last char of given string
 */
function getLastChar(str) {
    return str.charAt(str.length-1);
}

export default class Calculator {
    constructor(keys, screen, equalKey) {
        this.equation = "";
        this.intervalID = null;
        this.keys = keys;
        this.screen = screen;
        this.equalKey = equalKey;
    }
    
    /**
     * Reset the attributes
     */
    empty() {
        this.equation = "";
        this.screen.value = "0";
    }

    /**
     * @param {String} value: incoming key value
     * @returns null
     * The infixExpression 中缀表达式 without semantic error 无语错 is stored in this.equation
     * 语法正确的情况: 
     * 一. 输入为运算符时:
     *    1. 输入为'('且表达式最后一位是运算符或表达式为空
     *    2. 输入为')'且表示式内的'('比')'多
     *    3. 表达式不为空且最后一位不是'.', 而是除了')'以外的其他运算符
     *    4. 表达式不为空的其他情况
     * 二. 输入为数字或'.'的情况:
     *    1. 表达式结尾是数字:
     *       a. 输入为'.'且最后一个数字不是小数
     *       b. 输入为'0'且最后一个数字不是数字0
     *       c. 输入0以外其他数字
     *    2. 表达式结尾不是数字:
     *       a. 输入不是'.'的所有情况
     */
    updateEquation(value) {
        // 一.
        if (isOperator(value)) {
            clearInterval(this.intervalID);
            // 1.
            if (value === "(") {
                if (!this.equation || isOperator(getLastChar(this.equation))) {
                    this.equation += value;
                }
            // 2.
            } else if (value === ")") {
                let [l, r] = this.countBracket();
                if (l > r) {
                    this.equation += value;
                }
            // 3.
            } else if (this.equation && getLastChar(this.equation) !== "." && 
                isOperator(getLastChar(this.equation)) && getLastChar(this.equation) !== ")" ) {
                this.equation = this.equation.slice(0, this.equation.length-1) + value;
            // 4.
            } else if (this.equation) {
                this.equation += value;
            }
            this.screen.value = this.equation;
        } else if (value === "clear") {
            clearInterval(this.intervalID);
            this.empty();
        } else if (value === "clock") {
            this.displayClock();
        }
        // 二.
        else if (value !== "=" && value !== undefined) {
            clearInterval(this.intervalID);
            let lastNumber = this.getLastNumber();
            // 1.
            if (lastNumber.length) {
                // a.
                if (value === '.' && lastNumber.includes('.')) {
                    return;
                // b.
                } else if (value === '0' && lastNumber === "0") {
                    return;
                }
                // c.
                else {
                    this.equation += value;
                    this.screen.value = this.equation;
                }
            // 2.
            } else {
                // a.
                if (value !== '.') {
                    this.equation += value;
                    this.screen.value = this.equation;                    
                }
            }
        }
    }

    /**
     * Show local time for 4s if no interruption. Once interrupted, cancel display of time.
     */
    displayClock() {
        this.intervalID = setInterval(() => {
            this.screen.value = new Date().toLocaleTimeString();
        }, 1000);
        setTimeout(() => {
            this.screen.value = this.equation;
            clearInterval(this.intervalID);
        }, 4000);
    }

    /**
     * @returns the last number (integer of decimal) in this equation
     */
    getLastNumber() {
        let indexOfLastOp = 0;
        for (let i = this.equation.length-1; i >= 0; i--) {
            let cur = this.equation.charAt(i);
            if (isOperator(cur)) {
                indexOfLastOp = i;
                break;
            }
        }
        if (indexOfLastOp === 0) {
            return this.equation;
        } else {
            return this.equation.slice(indexOfLastOp+1);
        }
    }

    /**
     * @returns a list containing the number of left bracket and right bracket
     */
    countBracket() {
        let countL = 0;
        let countR = 0;
        for (let i = 0; i < this.equation.length; i++) {
            if (this.equation[i] === "(") {
                countL++;
            } else if (this.equation[i] === ")") {
                countR++;
            }
        }
        return [countL, countR];
    }

    /**
     * @return 中缀表达式转化为后缀表达式
     *  1.初始化两个栈：运算符栈s1和储存中间结果的栈s2；
     *  2.从左至右扫描中缀表达式；
     *  3.遇到操作数时，将其压s2；
     *  4.遇到运算符时，比较其与s1栈顶运算符的优先级：
     *     (1)如果s1为空，或栈顶运算符为左括号“(”，则直接将此运算符入栈s1；
     *     (2)否则，若优先级比栈顶运算符的高，也将运算符压入s1；
     *     (3)否则，将s1栈顶的运算符弹出并压入到s2中，再次转到(4-1)与s1中新的栈顶运算符相比较；
     *  5.遇到括号时：
     *     (1) 如果是左括号“(”，则直接压入s1
     *     (2) 如果是右括号“)”，则依次弹出s1栈顶的运算符，并压入s2，直到遇到左括号为止，此时将这一对括号丢弃
     *  6.重复步骤2至5，直到表达式的最右边
     *  7. 将s1中剩余的运算符依次弹出并压入s2
     *  8.依次弹出s2中的元素并输出，结果的逆序即为中缀表达式对应的后缀表达式
     */
    toSuffixExpression() {
        // 1.
        let s1 = [];
        let s2 = [];
        let tempNum = "";
        // 2.
        for (let i = 0; i < this.equation.length; i++) {
            // 表达式不完整, 最后一位是'('的情况, 舍去
            if (i === this.equation.length-1 && this.equation.charAt(i) === "(") {
                break;
            }
            let currentChar = this.equation[i];
            // 4.
            if (isOperator(currentChar)) {
                if (tempNum) {
                    s2.push(Number(tempNum));
                    tempNum = "";
                }
                while (true) {
                    // 4(1) & 5(1)
                    if (getLastChar(this.equation) === "(" ||
                         !s1.length || currentChar === "(") {
                        s1.push(currentChar);
                        break;
                    // 5(2)
                    } else if (currentChar === ")") {
                        while (s1[s1.length-1] !== "(") {
                            s2.push(s1.pop());
                        }
                        // 去括号
                        s1.pop();
                        break;
                    } 
                    // 4(2)
                    else if (op.get(currentChar) > op.get(s1[s1.length-1])) {
                        s1.push(currentChar);
                        break;
                    } else {
                        // 4(3)
                        s2.push(s1.pop());
                    }
                }
            } else {
                // 3.
                tempNum += currentChar;
                // IMPORTANT!! 最后一个数在循环结束时入栈
                if (i === this.equation.length - 1) {
                    s2.push(Number(tempNum));
                }
            }
        }
        while (s1.length !== 0) {
            s2.push(s1.pop());
        }
        return s2;
    }

    /**
     * @param {Number} num1 
     * @param {Number} num2 
     * @param {Operator} op 
     * @returns the value of given simple infixExpression
     */
    calculate(num1, num2, op) {
        switch (op) {
            case '+':
                return num1 + num2;
            case '-':
                return num1 - num2;
            case '*':
                return num1 * num2;
            case '/':
                return num1 / num2;
            default:
                throw new Error();
        }
    }

    /**
     * @returns the value of given suffixExpression
     */
    getResult() {
        clearInterval(this.intervalID);
        let stack = [];
        let suffixExpression = this.toSuffixExpression();
        for (let i = 0; i < suffixExpression.length; i++) {
            let current = suffixExpression[i];
            if (isOperator(current)) {
                // 表达式不完整, 最后一位是运算符的情况, 应当给出运算符前的完整表达式结果
                if (stack.length === 1) {
                    break;
                }
                // IMPORTANT!! Order matters!
                let num2 = stack.pop();
                let num1 = stack.pop();
                stack.push(this.calculate(num1, num2, current));
            } else {
                stack.push(current);
            }
        }
        this.equation = "";
        // 保留两位小数, 四舍五入
        return stack[0].toFixed(2);
    }

}

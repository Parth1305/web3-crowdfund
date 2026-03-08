function add(a,b) {
    return a + b;
}

const multiply = (a, b) => a * b;

const fetchsomething = async () => {
    try {
        const result = await Promise.resolve("data loaded");
        console.log(result);
    } catch (error) {
        console.log("error:", error);
    }
};

const person = {name: "Alex", age: 30 };
const {name, age } = person;


const numbers = [1,2,3,4,5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n%2 ===0);

fetchsomething();
    console.log(doubled);
    console.log(evens);

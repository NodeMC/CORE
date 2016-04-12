function init() {}

function routeFuncTest(args) {
    if (args !== null && typeof args[0] == "string") {
        return "Hello " + args[0] + " from funcTest!";
    } else {
        return "Hello World from funcTest!";
    }
}

module.exports = {
    init: init,
    funcTest: routeFuncTest
};
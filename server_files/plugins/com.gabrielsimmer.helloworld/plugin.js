function init() {}

function routeFuncTest(args) {
    if (args !== undefined && typeof args[0] == "string") {
        return "Hello " + args[0] + " from funcTest!";
    } else {
        return "Hello world from funcTest!";
    }
}

module.exports = {
    init: init,
    funcTest: routeFuncTest
};
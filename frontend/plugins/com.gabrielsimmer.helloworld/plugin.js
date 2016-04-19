function init() {}

function routeFuncTest(args) {
    if (args !== undefined && typeof args == "string") {
        return "Hello " + args + " from funcTest!";
    } else {
        return "Hello world from funcTest!";
    }
}

module.exports = {
    init: init,
    funcTest: routeFuncTest
};
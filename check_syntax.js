const fs = require('fs');
const content = fs.readFileSync('c:/Users/jeff_/Downloads/HomeROom ANtigravity/HomeRoom-Pro/index.html', 'utf8');
const scriptMatch = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (scriptMatch) {
    const script = scriptMatch[1];
    try {
        new Function(script);
        console.log("Syntax OK");
    } catch (e) {
        console.error("Syntax Error:", e.message);
        // Find line number
        const lines = script.split('\n');
        // This won't work perfectly because new Function() doesn't give line numbers of the source string easily
        // But we can try to find snippets
    }
} else {
    console.log("No script tag found");
}

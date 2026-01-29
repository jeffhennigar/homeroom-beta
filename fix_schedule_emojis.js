var fso = new ActiveXObject("Scripting.FileSystemObject");
var path = "c:\\Users\\jeff_\\Downloads\\HomeROom ANtigravity\\index.html";
var f = fso.OpenTextFile(path, 1);
var content = f.ReadAll();
f.Close();

// Fix SCHEDULE_EMOJIS (Multiline)
// We look for "const SCHEDULE_EMOJIS = [" and "];"
var startTag = "const SCHEDULE_EMOJIS = [";
var endTag = "];";
var startIdx = content.indexOf(startTag);

if (startIdx !== -1) {
    var endIdx = content.indexOf(endTag, startIdx);
    if (endIdx !== -1) {
        var before = content.substring(0, startIdx);
        var after = content.substring(endIdx + endTag.length);
        var newEmojis = "const SCHEDULE_EMOJIS = ['📚', '✏️', '🎨', '🔬', '🎵', '🏃', '🍎', '🌎', '🧮', '📖', '💻', '🎭', '🤝', '🧘', '⏰', '📏', '🎯', '🧪', '📎', '🎹', '🍀', '⚽', '🌱', '🔭', '💡'];";
        content = before + newEmojis + after;

        f = fso.OpenTextFile(path, 2);
        f.Write(content);
        f.Close();
        WScript.Echo("Schedule Emojis Fixed.");
    } else {
        WScript.Echo("Could not find end of SCHEDULE_EMOJIS");
    }
} else {
    // Check if it was already fixed (single line?)
    if (content.indexOf("const SCHEDULE_EMOJIS = ['📚'") !== -1) {
        WScript.Echo("Already fixed.");
    } else {
        WScript.Echo("Could not find start of SCHEDULE_EMOJIS");
    }
}

var app = Application.currentApplication();
app.includeStandardAdditions = true;
try {
    var src = app.read(Path("/Users/philipproggenland/Desktop/Druckbau/translations.js"));
    eval(src);
    console.log("Syntax OK translations.js");
} catch(e) {
    console.log("Error translations.js:", e.message, "Line:", e.line);
}

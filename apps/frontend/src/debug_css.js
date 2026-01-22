
const fs = require('fs');
const path = require('path');

try {
    const filePath = path.join(__dirname, 'App.css');
    console.log('Reading file:', filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('File length:', content.length);

    const marker = '.membership-content';
    const lastIndex = content.lastIndexOf(marker);
    console.log('Marker index:', lastIndex);

    if (lastIndex !== -1) {
        const nextBrace = content.indexOf('}', lastIndex);
        console.log('Next brace index:', nextBrace);
        if (nextBrace !== -1) {
             const cleanContent = content.substring(0, nextBrace + 1);
             // console.log('Clean ending:', cleanContent.slice(-50));
        }
    }

} catch (e) {
    console.error(e);
}

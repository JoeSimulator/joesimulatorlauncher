const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

app.get('/getgames', (req, res) => {
    res.sendFile(path.join(__dirname, 'games.json'));
});

app.get('/files', (req, res) => {
    const dirPath = path.join(__dirname, 'files');

    const getFilesRecursively = (dir) => {
        let results = [];
        fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                results = results.concat(getFilesRecursively(fullPath));
            } else {
                results.push(path.relative(dirPath, fullPath));
            }
        });
        return results;
    };

    try {
        const files = getFilesRecursively(dirPath);
        res.json({ files });
    } catch (err) {
        res.status(500).json({ error: 'Cannot read directory' });
    }
});

app.get('/files/*', (req, res) => {
    const filePath = path.join(__dirname, 'files', req.params[0]);
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.get('/playgame/:id', (req, res) => {
    const gameId = req.params.id;
    const playHtmlPath = path.join(__dirname, 'play.html');

    fs.readFile(playHtmlPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error loading play.html');
        }
        const modifiedHtml = data.replace('let gameid = "id";', `let gameid = "${gameId}";`);
        res.send(modifiedHtml);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

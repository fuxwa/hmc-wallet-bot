const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "../data");
const FILE = path.join(DIR, "airdrop.json");

function ensureFile() {
    if (!fs.existsSync(DIR)) {
        fs.mkdirSync(DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "{}");
    }
}

function loadAirdropData() {
    ensureFile();
    return JSON.parse(fs.readFileSync(FILE));
}

function saveAirdropData(data) {
    ensureFile();
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function canRequestAirdrop(userId) {
    const data = loadAirdropData();
    const now = Date.now();
    const last = data[userId] || 0;
    const twentyFourHrs = 24 * 60 * 60 * 1000;
    return now - last >= twentyFourHrs;
}

function updateAirdropTimestamp(userId) {
    const data = loadAirdropData();
    data[userId] = Date.now();
    saveAirdropData(data);
}

module.exports = { canRequestAirdrop, updateAirdropTimestamp };

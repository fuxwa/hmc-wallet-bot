const crypto = require("crypto");

function encryptAES(text, pass) {
    const key = crypto.createHash("sha256").update(pass).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = cipher.update(text, "utf8", "hex") + cipher.final("hex");
    return iv.toString("hex") + encrypted;
}

function decryptAES(encrypted, pass) {
    const key = crypto.createHash("sha256").update(pass).digest();
    const iv = Buffer.from(encrypted.slice(0, 32), "hex");
    const content = encrypted.slice(32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    return decipher.update(content, "hex", "utf8") + decipher.final("utf8");
}

module.exports = { encryptAES, decryptAES };

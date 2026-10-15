const { getDefaultConfig } = require("expo/metro-config");

// Plan üretimi cihaz üzerinde (src/engine) çalıştığı için API proxy'sine gerek kalmadı.
module.exports = getDefaultConfig(__dirname);

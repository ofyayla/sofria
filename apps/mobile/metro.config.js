const http = require("http");
const { getDefaultConfig } = require("expo/metro-config");

// Expo'nun kendi getDefaultConfig'i, pnpm workspace kökünü otomatik tespit
// edip watchFolders/nodeModulesPaths'i zaten doğru kuruyor.
const config = getDefaultConfig(__dirname);

// Metro'nun dev server'ı zaten Expo'nun --tunnel mekanizmasıyla dışarı açılıyor.
// /api/v1 isteklerini de AYNI tünel üzerinden yerel API sunucusuna (4000) yönlendiriyoruz
// ki fiziksel cihaz testinde ikinci bir tünele gerek kalmasın.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => (req, res, next) => {
    if (req.url && req.url.startsWith("/api/v1")) {
      const proxyReq = http.request(
        { host: "127.0.0.1", port: 4000, path: req.url, method: req.method, headers: req.headers },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        },
      );
      proxyReq.on("error", (err) => {
        // Düz metin DEĞİL — apiClient.ts bunu ApiResponse şemasına göre
        // ayrıştırıyor; düz metin dönersek "Unexpected character" gibi ham
        // bir JSON.parse hatası kullanıcıya sızıyor (gerçek kullanıcı
        // testinde bulundu: API sunucusu çökükken bu tam olarak oldu).
        console.error("[metro-api-proxy] API sunucusuna ulaşılamadı:", err.message);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            ok: false,
            error: { code: "UPSTREAM_UNAVAILABLE", message: "API sunucusuna şu anda ulaşılamıyor.", retryable: true },
            meta: { requestId: "metro-proxy", latencyMs: 0 },
          }),
        );
      });
      req.pipe(proxyReq, { end: true });
      return;
    }
    return middleware(req, res, next);
  },
};

module.exports = config;

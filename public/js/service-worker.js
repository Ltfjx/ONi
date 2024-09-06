
const static = "oni-static-v1"
const assets = [
    "https://cdn.staticfile.net/mdui/2.1.1/mdui.global.js",
    "https://cdn.staticfile.net/mdui/2.1.1/mdui.css",
    "https://cdn.staticfile.net/Chart.js/4.4.1/chart.umd.min.js",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined",
    "https://fonts.googleapis.com/icon?family=Material+Icons+Two+Tone",
    "https://fonts.googleapis.com/icon?family=Material+Icons+Round",
    "https://fonts.googleapis.com/icon?family=Material+Icons+Sharp"
]

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(static).then(cache => {
            cache.addAll(assets)
        })
    )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request)
        })
    )
})
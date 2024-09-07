// Slogan
!(function () {
    function isMobileDevice() {
        const ua = navigator.userAgent.toLowerCase()
        const kw = ['iphone', 'ipod', 'android', 'windows phone', 'blackberry', 'mobile']
        return kw.some(keyword => ua.includes(keyword))
    }
    if (!isMobileDevice()) {
        const slogan = ["豆！豆！痛いよ！", "人間！妖怪！誰でも歓迎！"]
        let elem = document.getElementById("slogan")
        elem.innerText = `"${slogan[Math.floor(Math.random() * slogan.length)]}"`
    }

})()
let overThreshold = false;
let scrollButton = document.getElementById('scroll-page-btn');


if (scrollButton) {
    scrollButton.onclick = function () {
        if (overThreshold) {
            scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            })
        } else {
            scrollTo({
                top: window.innerHeight,
                left: 0,
                behavior: 'smooth'
            })
        }
        scrollButton.blur();
    }
    window.onscroll = function () {
        let windowHeight = window.innerHeight;
        let thresholdPoint = windowHeight / 8;
        if (!overThreshold && document.documentElement.scrollTop > thresholdPoint) {
            overThreshold = true;
            scrollButton.innerHTML = "↑"
        }
        else if (overThreshold && document.documentElement.scrollTop < thresholdPoint) {
            overThreshold = false;
            scrollButton.innerHTML = "i"
        }
    }
}

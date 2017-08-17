(function (exports) {
  function multiBind (fn, eventPattern, remove) {
    eventPattern.forEach(function (handler) {
      var obj = handler[0]
      var events = handler[1]
      events.forEach(function (event) {
        remove ? obj.removeEventListener(event, fn) : obj.addEventListener(event, fn)
      })
    })
  }

  function lazyInit (nodeList, fnLoad, options) {
    var documentEvents = ['scroll', 'touchmove']
    var windowEvents = ['orientationchange', 'resize']
    var elements = Array.prototype.slice.call(nodeList)
    if (typeof options === 'undefined') {
      options = {}
    }
    // A bool which reads true if the fallback function is currently running
    var active = false
    var fallback = function () {
      if (!elements.length) {
        // There are no more elements to lazy load, so we'll unbind everything.
        multiBind(fallback, [
          [document, documentEvents],
          [window, windowEvents]
        ], true)
      }

      if (!active) {
        active = true

        setTimeout(function () {
          elements.forEach(function (element) {
            if ((element.getBoundingClientRect().top <= window.innerHeight && element.getBoundingClientRect().bottom >= 0) &&
                window.getComputedStyle(element).display !== 'none') {
              fnLoad(element, options)
            }
          })

          active = false
        }, 200)
      }
    }

    if (elements.length) {
      // This compatibility check has been taken from https://github.com/WICG/IntersectionObserver/blob/gh-pages/polyfill/intersection-observer.js
      if ('IntersectionObserver' in window &&
          'IntersectionObserverEntry' in window &&
          'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
        var elementObserver = new window.IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting || entry.intersectionRect.height > 0) { // entry.intersectionRect.height > 0 is for Edge
              fnLoad(entry.target, options, function () {
                observer.disconnect()
                console.log('Observer disconnected!')
              })
            }
          })
        })

        elements.forEach(function (element) {
          elementObserver.observe(element)
        })
      } else {
        // If IntersectionObserver isn't available, we'll do things the old way.
        fallback()
        multiBind(fallback, [
          [document, documentEvents],
          [window, windowEvents]
        ])
      }
    }
  }

  function lazyLoad () {

  }

  exports.dynimg = {
    load: lazyLoad,
    init: lazyInit
  }
})(this)

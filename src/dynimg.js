(function (exports) {
  /**
  * Adds or removes a batch of event listeners.
  * @param {function} fn The event handler.
  * @param {array} eventPattern A two dimensional array.
  * Each array in `eventPattern` contains two elements, the related DOM node and an
  * array of events.
  * @param {bool} remove Set to true to remove event listeners.
  */
  function multiBind (fn, eventPattern, remove) {
    eventPattern.forEach(function (handler) {
      var obj = handler[0]
      var events = handler[1]
      events.forEach(function (event) {
        remove ? obj.removeEventListener(event, fn) : obj.addEventListener(event, fn)
      })
    })
  }

  /**
  * @param {NodeList} nodes A list of DOM nodes to lazy load.
  * @param {function} fnLoad The function to call on the element to load it's full contents.
  * @param {obj} options Options object to pass through to `fnLoad`
  */
  function lazyInit (nodes, fnLoad, options) {
    var documentEvents = ['scroll', 'touchmove']
    var windowEvents = ['orientationchange', 'resize']
    var elements = Array.prototype.slice.call(nodes)
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

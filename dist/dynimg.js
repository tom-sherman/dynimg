(function (exports) {
  /**
  * Adds or removes a batch of event listeners. Only used for legacy fallback method.
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
  * Initialises the default dynimg for handling scrolling.
  * @param {NodeList} nodes A list of DOM nodes to lazy load.
  * @param {function} fnLoad The function to call on the element to load it's full contents.
  * @param {obj} options Options object to pass through to `fnLoad`
  */
  function lazyInit (nodes, fnLoad, options) {
    var documentEvents = ['scroll', 'touchmove']
    var windowEvents = ['orientationchange', 'resize']
    if (typeof options === 'undefined') {
      options = {}
    }
    lazyLoad(nodes, fnLoad, options, [
      [document, documentEvents],
      [window, windowEvents]
    ])
  }

  /**
  * Handles the lifecycle of the IntersectionObserver object as well as providing a fallback
  * for browsers who don't support it yet.
  * In both cases, we call `fnLoad` and pass in the elements and options
  * @param {NodeList} nodes A list of DOM nodes to lazy load.
  * These will be passed to `fnLoad` once they become visible.
  * @param {function} fnLoad The function to call on the element to load it's full contents.
  * @param {obj} options Options to pass through to `fnLoad`.
  * @param {array} eventPattern A two dimensional array.
  * Each array in `eventPattern` contains two elements, the related DOM node and an
  * array of events.
  */
  function lazyLoad (nodes, fnLoad, options, eventPattern) {
    var elements = Array.prototype.slice.call(nodes)
    if (typeof options === 'undefined') {
      options = {}
    }

    // A bool which reads true if the fallback function is currently running
    var active = false
    var fallback = function () {
      if (!elements.length) {
        // There are no more elements to lazy load, so we'll unbind everything.
        multiBind(fallback, eventPattern, true)
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
            // entry.intersectionRect.height > 0 is for Edge
            if (entry.isIntersecting || entry.intersectionRect.height > 0) {
              fnLoad(entry.target, options, function (element) {
                observer.unobserve(element)
                // Remove element from the active elements array, leaving only elements
                // yet to be loaded
                elements.splice(elements.indexOf(element), 1)
                if (elements.length === 0) {
                  // All elements have been loaded, disconnect the observer.
                  observer.disconnect()
                }
              })
            }
          })
        })

        elements.forEach(function (element) {
          elementObserver.observe(element)
        })
      } else if (eventPattern) {
        // If IntersectionObserver isn't available, we'll do things the old way.
        fallback()
        multiBind(fallback, eventPattern)
      }
    }
  }

  exports.dynimg = {
    load: lazyLoad,
    init: lazyInit
  }
})(this)

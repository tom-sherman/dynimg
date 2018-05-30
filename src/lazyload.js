import {multiBind, fallbackHandler} from './fallback.js'

/**
 * Handles the lifecycle of the IntersectionObserver object as well as providing a fallback
 * for browsers who don't support it yet.
 * In both cases, we call `fnLoad` and pass in the elements and options
 * @param {NodeList|Element[]} nodes A list of DOM nodes to lazy load.
 * These will be passed to `fnLoad` once they become visible.
 * @param {function} fnLoad The function to call on the element to load it's full contents.
 * @param {object} fnLoadOptions Options to pass through to `fnLoad`.
 * @param {array[]} eventPattern A two dimensional array.
 * Each array in `eventPattern` contains two elements, the related DOM node and an
 * array of events.
 */
export default function lazyLoad (nodes, fnLoad, fnLoadOptions = {}, eventPattern) {
  nodes = Array.prototype.slice.call(nodes)
  if (!nodes.length) return

  // This compatibility check has been taken from https://github.com/WICG/IntersectionObserver/blob/gh-pages/polyfill/intersection-observer.js
  if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
    const observer = new window.IntersectionObserver((entries, observer) => entries.forEach(entry => {
      // entry.intersectionRect.height > 0 is for Edge
      if (entry.isIntersecting || entry.intersectionRect.height > 0) {
        fnLoad(entry.target, fnLoadOptions, node => {
          observer.unobserve(node)
          // Remove node from the active nodes array, leaving only nodes yet to be loaded
          nodes.splice(nodes.indexOf(node), 1)
          if (nodes.length === 0) {
            observer.disconnect()
          }
        })
      }
    }))
    nodes.forEach(node => observer.observe(node))
  } else {
    fallbackHandler()
    multiBind(fallbackHandler, eventPattern)
  }
}

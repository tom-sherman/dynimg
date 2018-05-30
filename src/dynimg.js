import lazyLoad from './lazyload.js'

/**
 * @param {NodeList|Element[]} nodes A list of DOM nodes to lazy load.
 * @param {function} fnLoad The function to call on the element to load it's full contents.
 * @param {object} fnLoadOptions Options object to pass through to `fnLoad`.
 */
export default function dynImg (nodes, fnLoad, fnLoadOptions = {}) {
  const documentEvents = ['scroll', 'touchmove']
  const windowEvents = ['orientationchange', 'resize']
  lazyLoad(nodes, fnLoad, fnLoadOptions, [
    [document, documentEvents],
    [window, windowEvents]
  ])
}

window.dynImg = dynImg

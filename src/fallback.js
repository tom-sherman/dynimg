const isNodeInViewport = node => (node.getBoundingClientRect().top <= window.innerHeight && node.getBoundingClientRect().bottom >= 0)

export function fallbackHandler (nodes, fnLoad, fnLoadOptions = {}) {
  nodes = Array.prototype.slice.call(nodes)
  let active = false
  if (!active) {
    active = true
    setTimeout(() => {
      nodes.forEach(node => {
        if (isNodeInViewport(node) && window.getComputedStyle(node).display !== 'none') {
          fnLoad(node, fnLoadOptions, loadedNode => nodes.splice(nodes.indexOf(loadedNode), 1))
        }
      })
      active = false
    }, 200)
  }
}

export function multiBind (handler, eventPattern, remove) {
  eventPattern.forEach(handler => {
    var node = handler[0]
    var events = handler[1]
    events.forEach(event => {
      remove
      ? node.removeEventListener(event, handler)
      : node.addEventListener(event, handler)
    })
  })
}

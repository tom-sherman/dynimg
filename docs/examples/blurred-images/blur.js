var BlurImageLoader = (function () {
  function fnLoadImage (el, options = {}, callback) {
    if (typeof jQuery === 'function' && el instanceof jQuery) {
      el = el[0]
    }
    if (!options.thumbPattern) {
      options.thumbPattern = 'thumb_'
    }

    const thumbnail = el.getElementsByTagName('img')[0]

    const height = el.offsetHeight
    el.style.height = height + 'px'
    el.style.paddingBottom = 0

    const img = new window.Image()
    img.thumbnail = thumbnail
    img.thumbnail.imageLoader = el
    img.addEventListener('load', imageLoaded, false)
    img.thumbnail.callback = callback

    img.src = thumbnail.src.replace(options.thumbPattern, '')
  }

  function imageLoaded (event) {
    var img = event.target
    img.removeEventListener('load', imageLoaded, false)
    img.thumbnail.imageLoader.style.backgroundImage = 'url(' + img.src + ')'
    img.thumbnail.classList.add('kill-thumb')
    img.thumbnail.addEventListener('transitionend', thumbnailFadeFinished, false)
  }

  function thumbnailFadeFinished (event) {
    var thumbnail = event.target
    // now remove thumbnail when transistion has finished
    thumbnail.removeEventListener('transitionend', thumbnailFadeFinished, false)
    thumbnail.imageLoader.removeChild(event.target)
    thumbnail.imageLoader.dataset.loaded = 'true'
    if (thumbnail.callback) {
      thumbnail.callback(thumbnail.imageLoader)
    }
  }

  return {
    loadImage: fnLoadImage
  }
}())

document.addEventListener('DOMContentLoaded', function () {
  var elements = document.querySelectorAll('.lazy')
  window.dynImg(elements, BlurImageLoader.loadImage, {thumbPattern: 'thumb_'})
})

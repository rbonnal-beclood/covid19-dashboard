import {useState, useCallback, useEffect} from 'react'
import {WebMercatorViewport} from 'react-map-gl'

import geo from '../../geo.json'

const defaultViewport = {
  latitude: 46.9,
  longitude: 1.7,
  zoom: 5
}

function useBounds(mapRef, code) {
  const [viewport, setViewport] = useState(defaultViewport)
  const [windowDimension, setWindowDimension] = useState()
  const [bbox, setBbox] = useState()

  const computeViewport = useCallback(() => {
    if (windowDimension) {
      const viewport = new WebMercatorViewport(windowDimension)
        .fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], {padding: 20})

      setViewport(viewport)
    }
  }, [windowDimension, bbox])

  const handleResize = useCallback(() => {
    if (mapRef && mapRef.current) {
      const {width, height} = mapRef.current.getBoundingClientRect()

      if (width > 50 && height > 50) {
        setWindowDimension({width, height})
      }
    }
  }, [mapRef])

  useEffect(() => {
    if (code) {
      const {bbox} = geo[code]
      setBbox(bbox)
    }
  }, [code])

  useEffect(() => {
    if (bbox) {
      computeViewport()
    }
  }, [bbox, computeViewport])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize])

  return [viewport, setBbox]
}

export default useBounds

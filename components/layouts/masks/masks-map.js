import React, {useContext, useRef, useState, useMemo} from 'react'
import ReactMapGL, {Marker, Popup, Source, Layer} from 'react-map-gl'
import {uniq} from 'lodash'
import bbox from '@turf/bbox'
import {MapPin, ArrowLeft} from 'react-feather'

import geo from '../../../geo.json'

import {ThemeContext, AppContext} from '../../../pages'
import {MasksContext} from '.'
import useBounds from '../../hooks/bounds'
import MasksCommunePopup from './mask-commune-popup'

const Markers = ({data, onHover, onClick}) => {
  const themeContext = useContext(ThemeContext)

  const handleEvent = (event, data, cb) => {
    event.stopPropagation()

    if (cb) {
      cb(data)
    }
  }

  return data
    .filter(({centre, nom}) => nom === 'international' || Boolean(centre))
    .map(commune => {
      const {nom, centre: {coordinates: [longitude, latitude]}} = commune
      return (
        <Marker key={nom} longitude={longitude} latitude={latitude}>
          <div
            onMouseEnter={event => handleEvent(event, commune, onHover)}
            onMouseLeave={event => handleEvent(event, null, onHover)}
            onClick={event => handleEvent(event, commune, onClick)}
          >
            <MapPin color={themeContext.secondary} />
          </div>
        </Marker>
      )
    })
}

const MasksMap = () => {
  const themeContext = useContext(ThemeContext)
  const {isMobileDevice} = useContext(AppContext)
  const {masksCommunes, setSelectedCommune, selectedRegion, setSelectedRegion} = useContext(MasksContext)

  const mapRef = useRef()
  const [viewport, setBbox] = useBounds(mapRef, 'FRA')

  const [hoveredRegion, setHoveredRegion] = useState()
  const [hoveredMarker, setHoveredMarker] = useState()

  const regionsLineLayer = useMemo(() => {
    return {
      id: 'regions-line',
      'source-layer': 'regions',
      type: 'line',
      paint: {
        'line-color': themeContext.primary
      }
    }
  }, [themeContext])

  const regionsFillLayer = useMemo(() => {
    return {
      id: 'regions-fill',
      'source-layer': 'regions',
      type: 'fill',
      layout: {
        visibility: selectedRegion ? 'none' : 'visible'
      },
      paint: {
        'fill-color': themeContext.primary,
        'fill-opacity': 0
      }
    }
  }, [selectedRegion, themeContext])

  const highlightRegionsLayer = useMemo(() => {
    return {
      id: 'highlight-regions',
      'source-layer': 'regions',
      type: 'fill',
      paint: {
        'fill-color': themeContext.secondary,
        'fill-opacity': 0.5
      }
    }
  }, [themeContext])

  const reset = event => {
    event.stopPropagation()
    setSelectedRegion(null)
    setSelectedCommune(null)
    setBbox(geo.FRA.bbox)
    setHoveredMarker(null)
  }

  const onRegionSelect = event => {
    const feature = event.features[0]
    setHoveredRegion(null)
    if (feature) {
      setBbox(bbox(feature))
      setSelectedRegion(feature.properties)
    } else {
      reset(event)
    }
  }

  const onClick = commune => {
    setSelectedCommune(commune)
    setHoveredMarker(null)
  }

  const onHoverMarker = commune => {
    if (commune) {
      if (selectedRegion || commune.nom === 'international') {
        const {centre: {coordinates: [longitude, latitude]}} = commune
        setHoveredMarker({
          longitude,
          latitude,
          commune
        })
      }
    } else {
      setHoveredMarker(null)
    }
  }

  const onHover = event => {
    event.stopPropagation()
    const [region] = event.features || []
    setHoveredRegion(region)
  }

  const enableRegions = useMemo(() => {
    return uniq(masksCommunes.map(commune => commune.codeRegion).filter(c => Boolean(c)))
  }, [masksCommunes])

  return (
    <div ref={mapRef} className='map-container'>
      <ReactMapGL
        {...viewport}
        width='100%'
        height='100%'
        mapStyle='https://etalab-tiles.fr/styles/osm-bright/style.json'
        interactiveLayerIds={['regions-fill']}
        onHover={onHover}
        onClick={onRegionSelect}
        getCursor={({isHovering}) => {
          return isHovering ? 'zoom-in' : 'default'
        }}
      >
        {selectedRegion && (
          <div className='back' onClick={reset}>
            <span><ArrowLeft /></span> Retour
          </div>
        )}

        <Source
          id='decoupage-administratif'
          type='vector'
          url='https://etalab-tiles.fr/data/decoupage-administratif.json'
        >
          <Layer {...regionsLineLayer} filter={['in', 'code', ...enableRegions]} />
          <Layer {...regionsFillLayer} filter={['in', 'code', ...enableRegions]} />
          <Layer {...highlightRegionsLayer} filter={['==', 'code', hoveredRegion ? hoveredRegion.properties.code : '']} />
        </Source>

        {masksCommunes && (
          <Markers
            data={masksCommunes}
            onHover={isMobileDevice ? null : onHoverMarker}
            onClick={selectedRegion ? onClick : null}
          />
        )}

        {hoveredMarker && (
          <Popup
            longitude={hoveredMarker.longitude}
            latitude={hoveredMarker.latitude}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setHoveredMarker(null)}
            anchor='bottom-left'
          >
            <MasksCommunePopup {...hoveredMarker.commune} />
          </Popup>
        )}
      </ReactMapGL>

      <style jsx>{`
        .map-container {
          display: flex;
          position: relative;
          width: 100%;
          height: 100%;
        }

        .back {
          position: absolute;
          display: flex;
          align-items: center;
          top: 0.5em;
          left: 0.5em;
          padding: 0.5em;
          background-color: #000000aa;
          color: #fff;
          border-radius: 4px;
        }

        .back:hover {
          cursor: pointer;
          background-color: #000;
        }

        .back span {
          display: flex;
          margin-right: 0.5em;
        }
      `}</style>
    </div>
  )
}

export default MasksMap

import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import ReactMapGL, {Source, Layer} from 'react-map-gl'

import useBounds from '../hooks/bounds'

const Map = ({code, data, layers, mapStyle, hideAttribution, onHover, onClick, children}) => {
  const mapRef = useRef()
  const [viewport] = useBounds(mapRef, code)

  return (
    <div ref={mapRef} className='react-map-container'>
      {viewport && (
        <ReactMapGL
          {...viewport}
          width='100%'
          height='100%'
          mapStyle={mapStyle || 'https://etalab-tiles.fr/styles/osm-bright/style.json'}
          interactiveLayerIds={onHover || onClick ? layers.map(layer => layer.id) : null}
          onHover={onHover}
          onClick={onClick}
          scrollZoom={false}
          dragPan={false}
          dragRotate={false}
          doubleClickZoom={false}
          touchZoom={false}
          attributionControl={!hideAttribution}
        >
          {data && (
            <Source
              type='geojson'
              attribution='Données Santé publique France'
              data={data}
            >
              {layers.map(layer => (
                <Layer key={layer.id} {...layer} />
              ))}
            </Source>
          )}

          {children}
        </ReactMapGL>
      )}

      <style jsx>{`
          .react-map-container {
            flex: 1;
          }
          `}</style>
    </div>
  )
}

Map.defaultProps = {
  hideAttribution: false,
  onHover: null,
  onClick: null,
  children: null,
  data: null
}

Map.propTypes = {
  code: PropTypes.string.isRequired,
  data: PropTypes.object,
  layers: PropTypes.array.isRequired,
  hideAttribution: PropTypes.bool,
  onHover: PropTypes.func,
  onClick: PropTypes.func,
  children: PropTypes.node
}

export default Map

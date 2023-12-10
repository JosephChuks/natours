/* eslint-disable no-new */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidGhla2luc21lbiIsImEiOiJjbHBtdWo2emMwZG1xMnFxbm1ya2JoczkyIn0.hrXUZHWm5dt1BiDznzal2Q';
  const map = new mapboxgl.Map({
    container: 'map',
    //style: 'mapbox://styles/thekinsmen/clpmv8fj600w401qt2naf3dye',
    style: 'mapbox://styles/thekinsmen/clpmw7mt800z501o0fbi83g8k',
    scrollZoom: false,
    /* center: [-119.762502, 36.679597],
  zoom: 6, */
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 70,
      right: 70,
    },
  });
};

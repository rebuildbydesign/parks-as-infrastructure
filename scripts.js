// MAPBOX CONFIGURATION
mapboxgl.accessToken = 'pk.eyJ1IjoiajAwYnkiLCJhIjoiY2x1bHUzbXZnMGhuczJxcG83YXY4czJ3ayJ9.S5PZpU9VDwLMjoX_0x5FDQ';

// Adjust map settings based on screen size
const isMobile = window.innerWidth <= 768;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/j00by/cm60z8amk005801qvfi826b4d',
    center: isMobile ? [-74.0, 40.71] : [-74.09287, 40.70332], // Adjust center for mobile
    zoom: isMobile ? 9.5 : 10.2 // Slightly zoom in on mobile
});

// Add Mapbox Geocoder
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken, // Use the same access token as the map
    mapboxgl: mapboxgl, // Pass the mapbox-gl instance
    placeholder: 'Enter your address', // Placeholder text for the input box
    zoom: 14, // Zoom level after geocoding
    proximity: {
        longitude: -74.0060, // New York City longitude
        latitude: 40.7128 // New York City latitude
    } // Bias results to NYC
});

// Add the Geocoder above the navigation control
map.addControl(geocoder, 'top-right');

// Optionally, add a marker to show the selected location
let marker;
geocoder.on('result', (e) => {
    const coordinates = e.result.center;

    // If a marker exists, remove it
    if (marker) {
        marker.remove();
    }

    // Add a new marker at the searched location
    marker = new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);

    // Zoom to the location
    map.flyTo({ center: coordinates, zoom: 14 });
});

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl());







// METHODOLOGY MODAL
document.getElementById('openModal').addEventListener('click', () => {
    document.getElementById('modalOverlay').style.display = 'block';
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('modalOverlay').style.display = 'none';
});

document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) {
        document.getElementById('modalOverlay').style.display = 'none';
    }
});





// INSTRUCTIONS POPUP
document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('instructionsPopup');
    const closePopup = document.getElementById('closePopup');

    // Display the popup on page load
    popup.style.display = 'flex';

    // Close the popup on button click
    closePopup.addEventListener('click', () => {
        popup.style.display = 'none'; // Hide the popup
    });

    // Optional: Close popup by clicking outside the content area
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.style.display = 'none'; // Hide the popup
        }
    });

});



// SIDEBAR COLLAPSE TOGGLE ARROW

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');

    toggleButton.addEventListener('click', function() {
        sidebar.classList.toggle('sidebar-hidden');
        // Change the button text depending on whether the sidebar is visible or not
        if (sidebar.classList.contains('sidebar-hidden')) {
            toggleButton.textContent = '>>'; // Change to show 'expand' icon
        } else {
            toggleButton.textContent = '<< Hide Sidebar'; // Change to show 'collapse' icon
        }
    });
});



// Keep track of the current scenario year
let currentRisk = 2020;




// LOADING GEOJSONS FOR FLOODPLAINS AND PARKS DATA
map.on('load', () => {



    // Add floodplain sources
    map.addSource('floodplain-2020-stormwater', {
        type: 'geojson',
        data: 'data/2020-stormwater.json'
    });
    map.addSource('floodplain-2020-stormsurge', {
        type: 'geojson',
        data: 'data/2020-stormsurge.json'
    });
    map.addSource('floodplain-2100-stormwater', {
        type: 'geojson',
        data: 'data/2100-stormwater.json'
    });
    map.addSource('floodplain-2100-stormsurge', {
        type: 'geojson',
        data: 'data/2100-stormsurge.json'
    });

    // Add floodplain layers
    const floodLayers = [
        {
            id: 'floodplain-2020-stormwater',
            source: 'floodplain-2020-stormwater',
            color: '#d646db',
            stroke: '#d646db', // Stroke color (same as fill)
            visible: true
        },
        {
            id: 'floodplain-2020-stormsurge',
            source: 'floodplain-2020-stormsurge',
            color: '#5d91c5',
            visible: true
        },
        {
            id: 'floodplain-2100-stormwater',
            source: 'floodplain-2100-stormwater',
            color: '#d646db',
            stroke: '#d646db', // Stroke color (same as fill)
            visible: false
        },
        {
            id: 'floodplain-2100-stormsurge',
            source: 'floodplain-2100-stormsurge',
            color: '#5d91c5',
            visible: false
        }
    ];

    // Add all layers
    floodLayers.forEach((layer) => {
        map.addLayer({
            id: layer.id,
            type: 'fill',
            source: layer.source,
            layout: { visibility: layer.visible ? 'visible' : 'none' },
            paint: {
                'fill-color': layer.color,
                'fill-opacity': 0.4
            }
        });

        if (layer.stroke) {
            map.addLayer({
                id: `${layer.id}-stroke`,
                type: 'line',
                source: layer.source,
                layout: { visibility: layer.visible ? 'visible' : 'none' },
                paint: {
                    'line-color': layer.stroke,
                    'line-width': 1.5
                }
            });
        }
    });




    // ADD PARKS DATA
    map.addSource('parks-risk', {
        type: 'geojson',
        data: './data/parksData.geojson'
    });

    // Add parks layer with default filter for 2020
    map.addLayer({
        id: 'parks-risk-layer',
        type: 'circle',
        source: 'parks-risk',
        paint: {
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, isMobile ? 4 : 6, // Smaller radius for mobile
                12, isMobile ? 6 : 8,
                14, isMobile ? 8 : 12,
                16, isMobile ? 10 : 18
            ],
            'circle-color': '#177931',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        },
        filter: [
            'any',
            ['==', ['get', '2020_SW'], 'X'],
            ['==', ['get', '2020_SS'], 'X']
        ]
    });

    // Track the currently selected park
    let selectedParkId = null;

    // Handle hover to change color
    map.on('mouseenter', 'parks-risk-layer', (e) => {
        // Get hovered park feature
        const hoveredFeature = e.features[0];

        // Set lighter green for the hovered park unless it is the selected park
        map.setPaintProperty('parks-risk-layer', 'circle-color', [
            'case',
            ['==', ['get', 'Park_Name'], selectedParkId], '#FFA500', // Keep selected park light green
            ['==', ['get', 'Park_Name'], hoveredFeature.properties.Park_Name], '#FFA500', // Lighter green for hover
            '#177931' // Default green for others
        ]);

        map.getCanvas().style.cursor = 'pointer'; // Change cursor to pointer
    });

    // Reset hover behavior when leaving the parks layer
    map.on('mouseleave', 'parks-risk-layer', () => {
        // Reset color for all parks, keeping the selected park highlighted
        map.setPaintProperty('parks-risk-layer', 'circle-color', [
            'case',
            ['==', ['get', 'Park_Name'], selectedParkId], '#FFA500', // Keep selected park light green
            '#177931' // Default green for others
        ]);

        map.getCanvas().style.cursor = ''; // Reset cursor
    });






    // Handle click to keep a park selected
    map.on('click', 'parks-risk-layer', (e) => {
        // Get clicked park feature
        const clickedFeature = e.features[0];
        selectedParkId = clickedFeature.properties.Park_Name; // Save the selected park's name

        // Highlight the selected park
        map.setPaintProperty('parks-risk-layer', 'circle-color', [
            'case',
            ['==', ['get', 'Park_Name'], selectedParkId], '#FFA500', // Keep selected park light green
            '#177931' // Default green for others
        ]);

        // Update sidebar with park details
        const parkInfoContainer = document.getElementById('park-info');
        parkInfoContainer.innerHTML = `
        <div><h2>PARK INFORMATION</h2></div>
        <div><strong>PARK NAME:</strong> ${clickedFeature.properties.Park_Name || 'N/A'}</div>
      <div><strong>ADDRESS:</strong> ${clickedFeature.properties.Address || 'N/A'}</div>
      <div><strong>BOROUGH:</strong> ${clickedFeature.properties.Borough || 'N/A'}</div>
      <div><strong>HEAT VULNERABILITY:</strong> ${clickedFeature.properties.HVI || 'N/A'}</div>
      <div><strong>SOCIAL VULERABILITY:</strong> ${clickedFeature.properties.SVI || 'N/A'}</div>
    `;
    });








    // Year toggle functionality
    document.querySelectorAll('input[name="riskYear"]').forEach((radio) => {
        radio.addEventListener('change', (e) => {
            currentRisk = parseInt(e.target.value, 10);

            floodLayers.forEach((layer) => {
                const is2020 = layer.id.includes('2020');
                const is2100 = layer.id.includes('2100');
                const visibility =
                    (currentRisk === 2020 && is2020) ||
                        (currentRisk === 2100 && (is2020 || is2100))
                        ? 'visible'
                        : 'none';
                map.setLayoutProperty(layer.id, 'visibility', visibility);
            });

            const filter =
                currentRisk === 2020
                    ? [
                        'any',
                        ['==', ['get', '2020_SW'], 'X'],
                        ['==', ['get', '2020_SS'], 'X']
                    ]
                    : currentRisk === 2100
                        ? [
                            'any',
                            ['==', ['get', '2020_SW'], 'X'],
                            ['==', ['get', '2020_SS'], 'X'],
                            ['==', ['get', '2050_SW'], 'X'],
                            ['==', ['get', '2050_SS'], 'X'],
                            ['==', ['get', '2100_SW'], 'X'],
                            ['==', ['get', '2100_SS'], 'X']
                        ]
                        : [];
            map.setFilter('parks-risk-layer', filter);



            
            // Reset sidebar with scenario-specific text
const parkInfoContainer = document.getElementById('park-info');
if (currentRisk === 2020) {
  parkInfoContainer.innerHTML = `
  <h2>PARK INFORMATION</h2>
  <strong>PARK NAME:</strong> <span id="park-name">Select a park to view details</span><br />
  <strong>ADDRESS:</strong> <span id="park-address">N/A</span><br />
  <strong>BOROUGH:</strong> <span id="park-borough">N/A</span><br />
  <strong>FLOOD ZONES:</strong> <span id="park-floodzones">N/A</span><br />
  <strong>HEAT VULNERABILITY:</strong> <span id="park-hvi">N/A</span><br />
  <strong>SOCIAL VULNERABILITY:</strong> <span id="park-svi">N/A</span>
`;

} else if (currentRisk === 2100) {
  parkInfoContainer.innerHTML = `
  <h2>PARK INFORMATION</h2>
  <strong>PARK NAME:</strong> <span id="park-name">Select a park to view details</span><br />
  <strong>ADDRESS:</strong> <span id="park-address">N/A</span><br />
  <strong>BOROUGH:</strong> <span id="park-borough">N/A</span><br />
  <strong>FLOOD ZONES:</strong> <span id="park-floodzones">N/A</span><br />
  <strong>HEAT VULNERABILITY:</strong> <span id="park-hvi">N/A</span><br />
  <strong>SOCIAL VULNERABILITY:</strong> <span id="park-svi">N/A</span>
`;

}

        });
    });






    // Function to generate a color for HVI (red gradient)
function getHVIColor(value) {
    const colors = ['#FF8A8A', '#ff5858', '#ff2323', '#df0404', '#bf0000']; // Gradient scale for 1-5
    return colors[value - 1] || '#969696'; // Default to gray for invalid values
}

// Function to generate a color for SVI (purple/blue gradient)
function getSVIColor(value) {
    if (!value || isNaN(value)) return '#969696'; // Default to gray for invalid or N/A values
    const colors = ['#FF8A8A', '#FF8A8A', '#ff5858', '#ff2323', '#df0404', '#bf0000']; // Gradient for percentiles
    const index = Math.min(Math.floor(value * colors.length), colors.length - 1); // Map value to gradient
    return colors[index];
}




// Sidebar update for clicked parks
map.on('click', 'parks-risk-layer', (e) => {
    const feature = e.features[0];
    const parkInfoContainer = document.getElementById('park-info');
    const floodplains = [];
    if (currentRisk === 2020) {
        if (feature.properties['2020_SW'] === 'X') floodplains.push('2020 STORMWATER');
        if (feature.properties['2020_SS'] === 'X') floodplains.push('2020 STORM SURGE');
    } else {
        if (feature.properties['2020_SW'] === 'X') floodplains.push('2020 STORMWATER');
        if (feature.properties['2020_SS'] === 'X') floodplains.push('2020 STORM SURGE');
        if (feature.properties['2050_SW'] === 'X') floodplains.push('2050 STORMWATER');
        if (feature.properties['2050_SS'] === 'X') floodplains.push('2050 STORM SURGE');
        if (feature.properties['2100_SW'] === 'X') floodplains.push('2100 STORMWATER');
        if (feature.properties['2100_SS'] === 'X') floodplains.push('2100 STORM SURGE');
    }

    // Generate colored badges for HVI and SVI
    const hviColor = getHVIColor(feature.properties.HVI);
    const sviColor = getSVIColor(feature.properties.SVI);

    // Fallback for blank or missing address
    const address = feature.properties.Address && feature.properties.Address.trim() !== ''
        ? feature.properties.Address.toUpperCase()
        : 'N/A';

    // High Priority Park HTML
    let highPriorityHTML = '';
    if (feature.properties.HPL_PARKS === "Yes") {
        highPriorityHTML = `
            <div style="text-align: left; margin-top: 10px;">
                <a href="${feature.properties.HPL_LINK}" target="_blank" style="text-decoration: none;">
                    <img src="${feature.properties.HPL_LOGO}" alt="High Priority Park" 
                        style="width: 150px; height: auto; margin-bottom: 5px;">
                </a>
            </div>
        `;
    }

    // Sidebar content
    parkInfoContainer.innerHTML = `
        <div><h2>PARK INFORMATION</h2></div>  
        <div><strong>PARK NAME:</strong> ${feature.properties.Park_Name?.toUpperCase() || 'N/A'}</div>
        <div><strong>ADDRESS:</strong> ${address}</div>
        <div><strong>BOROUGH:</strong> ${feature.properties.Borough?.toUpperCase() || 'N/A'}</div>
        <div><strong>FLOOD ZONES:</strong> ${floodplains.join(', ') || 'NONE'}</div>
        <div>
            <strong>HEAT VULNERABILITY:</strong> <span style="background-color:${hviColor}; color: #FFF; padding: 2px 6px; border-radius: 3px;">
            ${feature.properties.HVI || 'N/A'}</span> out of 5
        </div>
        <div>
            <strong>SOCIAL VULNERABILITY:</strong> <span style="background-color:${sviColor}; color: #FFF; padding: 2px 6px; border-radius: 3px;">
            ${feature.properties.SVI || 'N/A'}</span> out of 1
        </div>
        ${highPriorityHTML} <!-- High Priority Park content -->
        
    `;


    // Add event listener for "Return to Borough Findings"
    document.getElementById('returnToBoroughFindings').addEventListener('click', () => {
        if (currentRisk === 2020) {
            parkInfoContainer.innerHTML = `
            <h2>PARK INFORMATION</h2>
  <strong>PARK NAME:</strong> <span id="park-name">Select a park to view details</span><br />
  <strong>ADDRESS:</strong> <span id="park-address">N/A</span><br />
  <strong>BOROUGH:</strong> <span id="park-borough">N/A</span><br />
  <strong>FLOOD ZONES:</strong> <span id="park-floodzones">N/A</span><br />
  <strong>HEAT VULNERABILITY:</strong> <span id="park-hvi">N/A</span><br />
  <strong>SOCIAL VULNERABILITY:</strong> <span id="park-svi">N/A</span>
`;

        } else if (currentRisk === 2100) {
            parkInfoContainer.innerHTML = `
            <h2>PARK INFORMATION</h2>
  <strong>PARK NAME:</strong> <span id="park-name">Select a park to view details</span><br />
  <strong>ADDRESS:</strong> <span id="park-address">N/A</span><br />
  <strong>BOROUGH:</strong> <span id="park-borough">N/A</span><br />
  <strong>FLOOD ZONES:</strong> <span id="park-floodzones">N/A</span><br />
  <strong>HEAT VULNERABILITY:</strong> <span id="park-hvi">N/A</span><br />
  <strong>SOCIAL VULNERABILITY:</strong> <span id="park-svi">N/A</span>
`;

        }
    });
});


});

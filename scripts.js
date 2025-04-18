// MAPBOX CONFIGURATION
mapboxgl.accessToken = 'pk.eyJ1IjoiajAwYnkiLCJhIjoiY2x1bHUzbXZnMGhuczJxcG83YXY4czJ3ayJ9.S5PZpU9VDwLMjoX_0x5FDQ';

// Adjust map settings based on screen size
const isMobile = window.innerWidth <= 768;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/j00by/cm60z8amk005801qvfi826b4d',
    center: isMobile ? [-74.0, 40.71] : [-74.09287, 40.70332],
    zoom: isMobile ? 9.5 : 10.2,
    maxBounds: [
        [-75.0, 40.2], // Southwest
        [-73.3, 41.2]  // Northeast
    ]
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

document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');

    toggleButton.addEventListener('click', function () {
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
    // === ADD SVI SOURCE & LAYER ===
    map.addSource('svi-nyc', {
        type: 'geojson',
        data: 'data/svi-2022.json'
    });

    // === ADD HVI 2022 SOURCE & LAYER ===
map.addSource('hvi-2022', {
    type: 'geojson',
    data: 'data/hvi-2022.json'
});

map.addLayer({
    id: 'hvi-2022-layer',
    type: 'fill',
    source: 'hvi-2022',
    layout: {
        visibility: 'none' // Start hidden
    },
    paint: {
        'fill-color': [
            'step',
            ['get', 'Heat Vulnerability Index (HVI)'],
            '#fde2e2', 2,
            '#f8b3b3', 3,
            '#f17474', 4,
            '#e73838', 5,
            '#df0203'
        ],
        'fill-opacity': 1,
        'fill-outline-color': '#ffffff' // White border
    }
});

    map.addLayer({
        id: 'svi-nyc-layer',
        type: 'fill',
        source: 'svi-nyc',
        layout: {
            visibility: 'none' // Start hidden
        },
        paint: {
            'fill-color': [
                'step',
                ['get', 'RPL_THEMES'],
                '#f3e6f9', 0.2,
                '#d9bfea', 0.4,
                '#c096db', 0.6,
                '#ab75d0', 0.8,
                '#a466cc'
            ],
            'fill-opacity': 1,
            'fill-outline-color': '#ffffff' // White border
        }
    });

    // Add floodplain layers
    const floodLayers = [
        {
            id: 'floodplain-2020-stormwater',
            source: 'floodplain-2020-stormwater',
            color: '#c71862',
            stroke: '#c71862', // Stroke color (same as fill)
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
            color: '#c71862',
            stroke: '#c71862', // Stroke color (same as fill)
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
            'circle-color': '#397f4e',
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
            ['==', ['get', 'Park_Name'], selectedParkId], '#df0404', // Keep selected park light green
            ['==', ['get', 'Park_Name'], hoveredFeature.properties.Park_Name], '#ffee31', // Lighter green for hover
            '#177931' // Default green for others
        ]);

        map.getCanvas().style.cursor = 'pointer'; // Change cursor to pointer
    });

    // Reset hover behavior when leaving the parks layer
    map.on('mouseleave', 'parks-risk-layer', () => {
        // Reset color for all parks, keeping the selected park highlighted
        map.setPaintProperty('parks-risk-layer', 'circle-color', [
            'case',
            ['==', ['get', 'Park_Name'], selectedParkId], '#df0404', // Keep selected park light green
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
            ['==', ['get', 'Park_Name'], selectedParkId], '#df0404', // Keep selected park light green
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



    // Add button event listeners after the map is fully loaded
    const buttons = document.querySelectorAll('.year-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const year = parseInt(this.getAttribute('data-year'), 10);
            updateLayers(year);
        });
    });

    // Initialize with a default year
    document.getElementById('btn2020').click(); // Simulate a click on the 2020 button to load the initial state
});

function updateLayers(year) {
    // Determine which layers to show based on the selected year
    const layers2020 = ['floodplain-2020-stormwater', 'floodplain-2020-stormsurge'];
    const layers2100 = ['floodplain-2100-stormwater', 'floodplain-2100-stormsurge'];

    layers2020.forEach(layer => {
        map.setLayoutProperty(layer, 'visibility', year === 2020 ? 'visible' : 'none');
    });
    layers2100.forEach(layer => {
        map.setLayoutProperty(layer, 'visibility', year === 2100 ? 'visible' : 'none');
    });

    // Update park filter based on the year
    const filter2020 = [
        'any',
        ['==', ['get', '2020_SW'], 'X'],
        ['==', ['get', '2020_SS'], 'X']
    ];
    const filter2100 = [
        'any',
        ['==', ['get', '2050_SW'], 'X'],
        ['==', ['get', '2050_SS'], 'X'],
        ['==', ['get', '2100_SW'], 'X'],
        ['==', ['get', '2100_SS'], 'X']
    ];

    map.setFilter('parks-risk-layer', year === 2020 ? filter2020 : filter2100);
}



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






// Function to generate a color for HVI (red gradient)
function getHVIColor(value) {
    // Updated gradient scale for HVI with 5 classes from light pink to deep red
    const colors = ['#fac0ba', '#fac0ba', '#ff8977', '#ff5140', '#df0203'];
    // Check the value to be within the expected range and return the corresponding color
    const index = Math.max(0, Math.min(Math.floor(value - 1), colors.length - 1));
    return colors[index];
}

// Function to generate a color for SVI (purple/blue gradient)
function getSVIColor(value) {
    if (!value || isNaN(value)) return '#969696'; // Default to gray for invalid or N/A values
    // Define the colors for the gradient
    const colors = ['#e5e5e5', '#c7b9e2', '#a98ed5', '#8b62c9', '#a466cc'];
    // Calculate index based on SVI value to pick the right color from the range
    const index = Math.min(Math.floor(value * 5), colors.length - 1);
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



// Toggle button for high priority parks
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('toggleHighPriorityParks').addEventListener('click', function () {
        const isActive = this.classList.toggle('active');

        if (isActive) {
            // Apply the filter and keep the color as yellow for high priority parks
            map.setFilter('parks-risk-layer', [
                'all',
                ['==', ['to-number', ['get', 'HVI']], 5],
                ['>=', ['to-number', ['get', 'SVI']], 0.9]
            ]);
            map.setPaintProperty('parks-risk-layer', 'circle-color', '#397f4e');
        } else {
            // Reset the style and remove the filter when the button is not active
            map.setPaintProperty('parks-risk-layer', 'circle-color', '#397f4e');
            map.setFilter('parks-risk-layer', null);
        }
    });
    document.getElementById('toggleSVILayer').addEventListener('click', function () {
        const layerId = 'svi-nyc-layer';
        const currentVisibility = map.getLayoutProperty(layerId, 'visibility');
    
        if (currentVisibility === 'visible') {
            map.setLayoutProperty(layerId, 'visibility', 'none');
            this.classList.remove('active');
        } else {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
            this.classList.add('active');
        }
    });
    document.getElementById('toggleHVILayer').addEventListener('click', function () {
        const layerId = 'hvi-2022-layer';
        const currentVisibility = map.getLayoutProperty(layerId, 'visibility');
    
        if (currentVisibility === 'visible') {
            map.setLayoutProperty(layerId, 'visibility', 'none');
            this.classList.remove('active');
        } else {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
            this.classList.add('active');
        }
    });
    
    
});





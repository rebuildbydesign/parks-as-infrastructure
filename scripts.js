// MAPBOX CONFIGURATION
mapboxgl.accessToken = 'pk.eyJ1IjoiajAwYnkiLCJhIjoiY2x1bHUzbXZnMGhuczJxcG83YXY4czJ3ayJ9.S5PZpU9VDwLMjoX_0x5FDQ';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/j00by/cm4u8ncu3009401s0fxinaejd',
    center: [-74.00071, 40.70420],
    zoom: 10.2
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





// Keep track of the current scenario year
let currentRisk = 2020;




// LOADING GEOJSONS FOR FLOODPLAINS AND PARKS DATA
map.on('load', () => {
    // Add floodplain sources
    map.addSource('floodplain-2020-stormwater', {
        type: 'geojson',
        data: '/data/2020-stormwater.json'
    });
    map.addSource('floodplain-2020-stormsurge', {
        type: 'geojson',
        data: '/data/2020-stormsurge.json'
    });
    map.addSource('floodplain-2100-stormwater', {
        type: 'geojson',
        data: '/data/2100-stormwater.json'
    });
    map.addSource('floodplain-2100-stormsurge', {
        type: 'geojson',
        data: '/data/2100-stormsurge.json'
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
            // Default radius with dynamic scaling
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                10, 6,  // Slightly larger for better visibility
                12, 8,
                14, 12,
                16, 18
            ],
            'circle-color': '#177931', // Default green
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff' // White stroke for better contrast
        },
        filter: [
            'any',
            ['==', ['get', '2100_SW'], 'X'], // Only parks at risk in 2100 on initial load
            ['==', ['get', '2100_SS'], 'X']
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
      <div><strong>Park Name:</strong> ${clickedFeature.properties.Park_Name || 'N/A'}</div>
      <div><strong>Address:</strong> ${clickedFeature.properties.Address || 'N/A'}</div>
      <div><strong>Borough:</strong> ${clickedFeature.properties.Borough || 'N/A'}</div>
      <div><strong>HVI:</strong> ${clickedFeature.properties.HVI || 'N/A'}</div>
      <div><strong>SVI:</strong> ${clickedFeature.properties.SVI || 'N/A'}</div>
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
                        ['==', ['get', '2100_SW'], 'X'],
                        ['==', ['get', '2100_SS'], 'X']
                    ]
                    : currentRisk === 2100
                        ? [
                            'any',
                            ['==', ['get', '2020_SW'], 'X'],
                            ['==', ['get', '2020_SS'], 'X'],
                            ['==', ['get', '2100_SW'], 'X'],
                            ['==', ['get', '2100_SS'], 'X']
                        ]
                        : [];
            map.setFilter('parks-risk-layer', filter);


            // Reset sidebar with scenario-specific text
const parkInfoContainer = document.getElementById('park-info');
if (currentRisk === 2020) {
  parkInfoContainer.innerHTML = `
  <div><strong style="color: #FFA500;">Today, roughly 4 in 10 parks (38%) are in flood zones under current conditions.</strong></div>
    <div><strong>Bronx:</strong> Nearly half of all parks (about 49%) are in flood zones.</div>
    <div><strong>Brooklyn:</strong> Around 1 in 5 parks (21%) are in flood zones.</div>
    <div><strong>Manhattan:</strong> Over half (54%) of parks are in flood zones.</div>
    <div><strong>Queens:</strong> About one-third (33%) of parks are in flood zones.</div>
    <div><strong>Staten Island:</strong> Over half (56%) of parks are in flood zones.</div>
  `;
} else if (currentRisk === 2100) {
  parkInfoContainer.innerHTML = `
  <div><strong style="color: #FFA500;">By 2100, about 7 in 10 parks (69%) are projected to be in  flood zones, compared to 38% today.</strong></div>
    <div><strong>Bronx:</strong> Over half (54%) of parks are projected to be in flood zones.</div>
    <div><strong>Brooklyn:</strong> Nearly 70% of parks are projected to be in flood zones—a significant jump from 21%.</div>
    <div><strong>Manhattan:</strong> Around 70% of parks may be in flood zones.</div>
    <div><strong>Queens:</strong> Over three-quarters (78%) of parks are projected to be in flood zones.</div>
    <div><strong>Staten Island:</strong> Nearly 80% of parks are projected to be in flood zones.</div>
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

    // Sidebar content
    parkInfoContainer.innerHTML = `
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
      <div style="margin-top: 10px;">
        <p>The flood zones analysis identifies parks at risk of stormwater and storm surge flooding under current and future climate conditions.</p>
        <p>The Heat Vulnerability Index (HVI), from NYC DOHMH, highlights neighborhoods at greater risk of heat-related illness or death due to factors like air conditioning access and surface temperatures.</p>
        <p>The Social Vulnerability Index (SVI), from the CDC, uses 15 indicators (e.g., income, housing, and language barriers) to measure a community's ability to prepare for and recover from disasters.</p>
        <div style="margin-top: 10px;">
          <a href="#" id="returnToBoroughFindings">Return to Borough Findings</a>
        </div>
      </div>
    `;

    // Add event listener for "Return to Borough Findings"
    document.getElementById('returnToBoroughFindings').addEventListener('click', () => {
        if (currentRisk === 2020) {
            parkInfoContainer.innerHTML = `
            <div><strong style="color: #FFA500;">Today, roughly 4 in 10 parks (38%) are in flood zones under current conditions.</strong></div>
    <div><strong>Bronx:</strong> Nearly half of all parks (about 49%) are in flood zones.</div>
    <div><strong>Brooklyn:</strong> Around 1 in 5 parks (21%) are in flood zones.</div>
    <div><strong>Manhattan:</strong> Over half (54%) of parks are in flood zones.</div>
    <div><strong>Queens:</strong> About one-third (33%) of parks are in flood zones.</div>
    <div><strong>Staten Island:</strong> Over half (56%) of parks are in flood zones.</div>
            `;
        } else if (currentRisk === 2100) {
            parkInfoContainer.innerHTML = `
            <div><strong style="color: #FFA500;">By 2100, about 7 in 10 parks (69%) are projected to be in flood zones, compared to 38% today.</strong></div>
    <div><strong>Bronx:</strong> Over half (54%) of parks are projected to be in flood zones.</div>
    <div><strong>Brooklyn:</strong> Nearly 70% of parks are projected to be in flood zones—a significant jump from 21%.</div>
    <div><strong>Manhattan:</strong> Around 70% of parks may be in flood zones.</div>
    <div><strong>Queens:</strong> Over three-quarters (78%) of parks are projected to be in flood zones.</div>
    <div><strong>Staten Island:</strong> Nearly 80% of parks are projected to be in flood zones.</div>
            `;
        }
    });
});






});

# S-100 Mock Data File System

This directory contains mock data files for various S-100 maritime services, organized by service type and data format.

## Directory Structure

```
mock-data/
├── s101/                    # S-101 Electronic Navigational Charts
│   ├── wms/                 # Web Map Service data
│   │   └── navigation-layer.json
│   └── wfs/                 # Web Feature Service data
│       └── depth-features.json
├── s102/                    # S-102 High Precision Bathymetry
│   ├── wms/                 # Web Map Service data
│   │   └── bathymetry-layer.json
│   └── wcs/                 # Web Coverage Service data
│       └── bathymetry-grid.tiff.metadata
├── s104/                    # S-104 Dynamic Water Level
│   └── wms/                 # Web Map Service data
│       └── water-level.json
├── s111/                    # S-111 Real-time Surface Currents
│   └── wfs/                 # Web Feature Service data
│       └── current-vectors.json
├── s124/                    # S-124 Navigational Warnings (empty)
├── s125/                    # S-125 Navigational Information (empty)
└── s131/                    # S-131 Marine Protected Areas (empty)
```

## Service Descriptions

### S-101 (Electronic Navigational Charts)
- **WMS**: Navigation layer with routes and waypoints
- **WFS**: Depth features including soundings and contours

### S-102 (High Precision Bathymetry)
- **WMS**: High resolution bathymetric grid visualization
- **WCS**: Bathymetric grid data coverage

### S-104 (Dynamic Water Level)
- **WMS**: Real-time and predicted water levels at monitoring stations

### S-111 (Real-time Surface Currents)
- **WFS**: Ocean current vector data

## Data Formats

- **JSON**: Feature collections, layer definitions, and metadata
- **GeoTIFF**: Grid and raster data (metadata provided)
- **Metadata**: Additional information about data files

## Usage

These mock data files can be used for:
- Testing S-100 service implementations
- Development and debugging
- System integration testing
- Performance benchmarking

## Updating Data

To add new mock data:
1. Create appropriate directory structure
2. Add data files in the correct format
3. Update this README with new data descriptions
4. Follow the established naming conventions

## File Naming Conventions

- Use descriptive names (e.g., `navigation-layer.json`)
- Include service type in the name when applicable
- Use hyphens for multi-word names
- Keep names concise but meaningful

## Metadata Standards

All data files should include:
- Service identification
- Creation and update timestamps
- Source information
- Data quality indicators
- Coordinate reference system
- Bounding box information
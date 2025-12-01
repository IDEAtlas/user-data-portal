==================================================================
README: Metadata for User Portal Data
=====================================

This document provides metadata for the datasets available for download from the user portal.
It is intended to accompany the data and provide essential information about content, structure, and use.

---

## AVAILABLE DATASETS

The user portal currently provides two primary datasets related to urban deprivation:

1. Annual Predictions of Deprived Urban Areas (DUAs)
   Yearly predictions identifying deprived urban areas using satellite-based modeling.

2. Urban Deprivation Index (UDI)
   A composite index quantifying the level of deprivation across urban areas.

Both datasets:

* Have a spatial resolution of 100 meters
* Use the Web Mercator projection (EPSG:3857)

---

## DATASET 1: Annual Predictions of Deprived Urban Areas (DUAs)

Description:
This dataset contains annual predictions of Deprived Urban Areas (DUAs) produced using a Multi-Branch Convolutional Neural Network (MB-CNN).
The model integrates Earth observation data and urban indicators to identify deprived urban zones.

Input Data:

* Sentinel-2 MSI (Multispectral Instrument): Provides multispectral imagery capturing land cover and land use characteristics.
* Precomputed Built-up Density: Represents the spatial density of built-up structures within urban areas.

Output:
A raster dataset where each 100-meter grid cell is classified into one of the following classes:

Class 1  - Non Built-up Area (NBA)
Class 2  - Non-Deprived Urban Area (NDUA)
Class 3  - Deprived Urban Area (DUA)

Cells with a value of 0 indicate "No Data".

Temporal Coverage:
Annual predictions are available for the period 2019–2024.

---

## DATASET 2: Urban Deprivation Index (UDI)

Description:
The Urban Deprivation Index (UDI) is a composite measure that quantifies levels of deprivation in urban environments.
It integrates morphological, infrastructural, and environmental factors to provide a multidimensional view of urban well-being.

Input Data:

* Sentinel-2 MSI Data: Used to derive features related to land cover, urban structure, and environmental context (10 bands from 10 m and 20 m resampled to 10 m).
* Ancillary Data: Collected from openly available geospatial datasets and derived from area-level indicators representing five domains:
  • Unplanned Urbanization
  • Physical Hazard and Assets
  • Contamination
  • Infrastructure
  • Facilities and Services

Note: The input data originate from multiple years, resolutions, and sources. There is no single base year or uniform resolution for all inputs.

Output:
A raster dataset where each 100-meter grid cell contains a numerical UDI value.
Higher values indicate greater levels of deprivation.

Temporal Coverage:
The latest available version covers data for 2024.
Future updates may expand temporal coverage as new data become available.

---

## CITY STATISTICS DASHBOARD (SDG 11.1.1 REPORTING)

The user portal also includes a dashboard that presents city-level statistics relevant to SDG Indicator 11.1.1
(the proportion of urban population living in slums, informal settlements, or inadequate housing).

Indicators Displayed:

1. Proportion of People Living in DUAs

   * Estimated population living in Deprived Urban Areas (DUAs).
   * Derived from the intersection of 2024 DUA predictions and GHS-POP-E2025 (JRC) population estimates.
   * Where available, the dashboard also displays official government estimates for comparison.
     These may correspond to a different year depending on data availability.

2. Proportion of Area Covered by DUAs

   * Computed from the total land area classified as DUA in the 2024 predictions for each city.

These indicators provide a harmonized and transparent framework for monitoring urban deprivation
across cities and for supporting SDG 11.1.1 reporting.

---

## SPATIAL RESOLUTION

Both datasets have a spatial resolution of 100 meters, meaning each pixel represents a 100 m x 100 m area on the ground.

---

## PROJECTION SYSTEM

All datasets are provided in Web Mercator (EPSG:3857).

---

## DISCLAIMER

The datasets and dashboard outputs are provided for informational and research purposes only.
While every effort has been made to ensure accuracy, the providers assume no responsibility for any errors, omissions,
or outcomes resulting from the use of this information.

---

## TECHNICAL REFERENCE

For a complete technical description, refer to:

B. Tareke et al.
"User and Data-Centric Artificial Intelligence for Mapping Urban Deprivation in Multiple Cities Across the Globe,"
IGARSS 2024 - IEEE International Geoscience and Remote Sensing Symposium,
Athens, Greece, 2024, pp. 1553-1557.
DOI: 10.1109/IGARSS53475.2024.10640428

---

## CONTACT FOR SUPPORT

For inquiries or technical support, please contact:
[ideatlas@utwente.nl](mailto:ideatlas@utwente.nl)

==================================================================
End of Document
===============


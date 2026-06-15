# -*- coding: utf-8 -*-
"""
Shared legacy → canonical MIxS CSV column names.

Used by csv.py when building sample attributes for ENA XML export and by
ena_mixs_validation.py when resolving CSV headers during validation.
"""

# Legacy GFBIO template column name → canonical MIxS / ENA field name.
ENA_HEADER_MAPPING: dict[str, str] = {
    "geographic location (depth)": "depth",
    "geographic location (elevation)": "elevation",
    "geographic location (altitude)": "altitude",
    "environment (biome)": "broad-scale environmental context",
    "environment (material)": "environmental medium",
    "environment (feature)": "local environmental context",
}

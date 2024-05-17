"""
Global Configuration
"""

from os import getenv
import logging
import json

LOG_LEVEL = logging.getLevelName(getenv("LOG_LEVEL", "INFO").upper())
RASTER_BASE_PATH = getenv("RASTER_BASE_PATH", "/data")
TILEDB_URI = getenv("TILEDB_URI")
API_TOKEN = getenv("API_TOKEN")

# Temporarily here until we can re-eng the UI for domain / DB switching from API
# for examples check ./README.md
DOMAIN_TO_DB_MAP = json.loads(getenv("DOMAIN_TO_DB_MAP", "{}"))

# terracotta_database_name: dict[raster_value: tuple[R, G, B, A]]
CATEGORICAL_COLOR_MAPS = {
    "land_cover": {
        0: (0, 0, 0, 255),
        10: (255, 255, 100, 255),
        11: (255, 255, 100, 255),
        12: (255, 255, 0, 255),
        20: (170, 240, 240, 255),
        30: (220, 240, 100, 255),
        40: (200, 200, 100, 255),
        50: (0, 100, 0, 255),
        60: (0, 160, 0, 255),
        61: (0, 160, 0, 255),
        62: (170, 200, 0, 255),
        70: (0, 60, 0, 255),
        71: (0, 60, 0, 255),
        72: (0, 80, 0, 255),
        80: (40, 80, 0, 255),
        81: (40, 80, 0, 255),
        82: (40, 100, 0, 255),
        90: (120, 130, 0, 255),
        100: (140, 160, 0, 255),
        110: (190, 150, 0, 255),
        120: (150, 100, 0, 255),
        121: (150, 100, 0, 255),
        122: (150, 100, 0, 255),
        130: (255, 180, 50, 255),
        140: (255, 220, 210, 255),
        150: (255, 235, 175, 255),
        151: (255, 200, 100, 255),
        152: (255, 210, 120, 255),
        153: (255, 235, 175, 255),
        160: (0, 120, 90, 255),
        170: (0, 150, 120, 255),
        180: (0, 220, 130, 255),
        190: (195, 20, 0, 255),
        200: (255, 245, 215, 255),
        210: (0, 70, 200, 255),
        220: (255, 255, 255, 255),
    }
}

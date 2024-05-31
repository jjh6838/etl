import pandas as pd



def url_from_key(wildcards):
    """
    Lookup an Aqueduct TIFF URL from our layers file by KEY wildcard.
    """
    df: pd.DataFrame = pd.read_csv("pipelines/aqueduct/layers.csv")
    layer = df[df.key == wildcards.KEY].squeeze()
    return layer.url


rule download_raw_data:
    """
    Download files from remote location.
    """
    input:
        layers = "pipelines/aqueduct/layers.csv",
    params:
        url = url_from_key
    output:
        "raster/raw/aqueduct/{KEY}.tif"
    shell:
        """
        wget {params.url} --output-document={output}
        """


def all_cog_file_paths(wildcards):
    """
    Generate list of Aqueduct output file paths.
    """
    df: pd.DataFrame = pd.read_csv("pipelines/aqueduct/layers.csv")
    return expand("raster/cog/aqueduct/{key}.tif", key=df.key)


rule ingest_rasters:
    """
    Create a dataset table in the MySQL database and ingest the cloud-optimised
    rasters to Terracotta.

    Requires the `tiles-db` MySQL service to be running.

    TODO: Can this rule be factored out into main Snakefile? Currently, it
    depends too tightly on the create_hazard_csv_file checkpoint to do so.
    """
    input:
        all_cog_file_paths,
        script = "scripts/ingest.py",
        layers = "pipelines/aqueduct/layers.csv",
        db_field_to_csv_header_map = "pipelines/aqueduct/db_field_to_csv_header_map.json",
        tile_keys = "pipelines/aqueduct/tile_keys.json",
    output:
        flag = "raster/ingest/aqueduct.flag"
    shell:
        """
        python {input.script} load_csv \
            --local_raster_base_path raster/cog/aqueduct \
            --db_raster_base_path /data/aqueduct \
            --input_csv_filepath {input.layers} \
            --csv_to_db_field_map_path {input.db_field_to_csv_header_map} \
            --tile_keys_path {input.tile_keys} \
            --database_name aqueduct

        touch {output.flag}
        """


rule POST_metadata_to_backend:
    """
    Requires the `backend` and postgreSQL `db` services to be running.

    This rule is a special case as we have two objects to create, one for fluvial and one for coastal.
    """
    input:
        ingest_flag = "raster/ingest/aqueduct.flag",
        fluvial_metadata = "pipelines/aqueduct/metadata_fluvial.json",
        coastal_metadata = "pipelines/aqueduct/metadata_coastal.json",
    output:
        flag = touch("raster/metadata/aqueduct.flag")
    shell:
        """
        curl -X POST \
            -H 'Content-Type: application/json' \
            -H 'X-Token: $BE_API_TOKEN' \
            -d @{input.fluvial_metadata} \
            http://$GATEWAY_HOST:$GATEWAY_PORT/api/tiles/sources

        curl -X POST \
            -H 'Content-Type: application/json' \
            -H 'X-Token: $BE_API_TOKEN' \
            -d @{input.coastal_metadata} \
            http://$GATEWAY_HOST:$GATEWAY_PORT/api/tiles/sources

        touch raster/metadata/aqueduct.flag
        """

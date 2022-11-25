import json
from pathlib import Path

import click
import firebase_admin
from firebase_admin import credentials, firestore

secret = (Path.home() / ".config/awalog/serviceAccountKey.json").absolute()

cred = credentials.Certificate(secret)
app = firebase_admin.initialize_app(cred)
client = firestore.client(app)


@click.command()
@click.argument("env")
@click.argument("dt")
def export_doc(env: str, dt: str):
    if env == "prod":
        if not click.confirm("are you sure you want to export into PROD?"):
            click.echo("export is cancled")
            return
    path = env / Path("1103")
    ref = client.document(str(path))
    dir = "backup" / path
    with (dir / (dt + ".json")).open() as f:
        data = json.load(f)
    ref.delete()
    ref.create(data)


# 実行例
# $ poetry run python operation/export.py dev 202211190947
if __name__ == "__main__":
    export_doc()

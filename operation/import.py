import json
from datetime import datetime
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
def import_doc(env: str):
    path = env / Path("1103")
    ref = client.document(str(path))
    data = ref.get().to_dict()
    dir = "backup" / path
    dir.mkdir(parents=True, exist_ok=True)
    name = datetime.now().strftime("%Y%m%d%H%M") + ".json"
    with (dir / name).open("w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)


# 実行例
# $ poetry run python operation/import.py dev
if __name__ == "__main__":
    import_doc()

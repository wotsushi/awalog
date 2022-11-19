import json
import sys
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

secret = (Path.home() / ".config/awalog/serviceAccountKey.json").absolute()

cred = credentials.Certificate(secret)
app = firebase_admin.initialize_app(cred)
client = firestore.client(app)


def export_doc(path: Path, dt: str):
    ref = client.document(str(path))
    dir = "backup" / path
    with (dir / (dt + ".json")).open() as f:
        data = json.load(f)
    ref.delete()
    ref.create({"data": data})


# 実行例
# $ poetry run python operation/export.py 202211190947
if __name__ == "__main__":
    dt = sys.argv[1]
    export_doc(Path("dev/decks"), dt)
    export_doc(Path("dev/results"), dt)

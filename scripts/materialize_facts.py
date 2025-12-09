import sys
import json
from pathlib import Path
from loguru import logger

# Ensure 'src' is importable
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.materialize import materialize_facts_to_parquet


def main():
    result = materialize_facts_to_parquet()
    print(json.dumps(result, indent=2, ensure_ascii=False, default=str))


if __name__ == "__main__":
    main()

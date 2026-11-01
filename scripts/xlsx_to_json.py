# Converts every tab (except README) of the workbook to data/data.json. Numbers are only rounded, never changed.
import pandas as pd, json, sys
x = pd.read_excel(sys.argv[1], sheet_name=None)
out = {}
for k, df in x.items():
    if k == "README": continue
    if "week_start" in df: df["week_start"] = pd.to_datetime(df["week_start"]).dt.strftime("%Y-%m-%d")
    out[k] = json.loads(df.round(2).to_json(orient="records"))
json.dump(out, open("data/data.json", "w"), indent=1)
print({k: len(v) for k, v in out.items()})

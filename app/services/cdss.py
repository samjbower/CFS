import requests, pandas as pd
from typing import Optional, Tuple, List, Dict

BASE = "https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations"

def _first_present(d, keys):
    for k in keys:
        if k in d and d[k] not in (None, "", "NaN"):
            return d[k]
    return None

def fetch_cdss_iv(
    abbrev: str, parameter: str = "DISCHRG", interval: str = "raw",
    startDate: Optional[str] = None, endDate: Optional[str] = None
) -> Tuple[pd.DataFrame, List[Dict]]:
    if interval not in {"raw","hour","day"}:
        raise ValueError("interval must be raw|hour|day")
    if not (startDate and endDate):
        raise ValueError("Provide startDate and endDate as 'YYYY-MM-DD'.")

    meta = requests.get(f"{BASE}/telemetrystation",
                        params={"abbrev": abbrev, "format":"json"}, timeout=30
                        ).json().get("ResultList", [])
    siteName = meta[0].get("stationName") if meta else abbrev
    lat = meta[0].get("latitude") if meta else None
    lon = meta[0].get("longitude") if meta else None

    endpoint = {"raw":"telemetrytimeseriesraw","hour":"telemetrytimeserieshour","day":"telemetrytimeseriesday"}[interval]
    r = requests.get(f"{BASE}/{endpoint}",
                     params={"abbrev": abbrev, "parameter": parameter,
                             "startDate": startDate, "endDate": endDate,
                             "format": "json"},
                     timeout=30)
    r.raise_for_status()
    recs = r.json().get("ResultList", []) or []

    rows, units = [], None
    for rec in recs:
        dt = _first_present(rec, ["resultTime","measDateTime","dateTime","meas_datetime","resultDateTime"])
        val_raw = _first_present(rec, ["value","measValue","meas_value","dataValue","resultValue","obsValue"])
        try:
            val = float(val_raw) if val_raw is not None else None
        except Exception:
            val = None
        units = units or _first_present(rec, ["units","measUnit","meas_unit"])
        rows.append({
            "datetime": dt, "value": val,
            "parameter": rec.get("parameter") or parameter,
            "variableName": rec.get("parameter") or parameter,
            "siteCode": abbrev, "siteName": siteName,
            "units": units or "", "qualifiers": _first_present(rec, ["flag","review","reviewed","obsFlag"])
        })

    df = pd.DataFrame.from_records(rows)
    if not df.empty:
        df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
        df.sort_values("datetime", inplace=True, ignore_index=True)

    info = [{
        "site name": siteName, "site code": abbrev, "site agency": "CDSS/DWR",
        "variable name": parameter, "variable code": parameter, "units": units or "",
        "latitude": lat, "longitude": lon
    }]
    return df, info

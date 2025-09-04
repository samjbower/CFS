import requests, json
import pandas as pd
from typing import Union, List, Tuple, Dict, Optional

BASE = "https://waterservices.usgs.gov/nwis/iv/"

def fetch_usgs_iv(
    sites: Union[str, List[str]],
    parameters: Union[str, List[str]] = "00060",
    period: Optional[str] = "P2D",
    startDT: Optional[str] = None,
    endDT: Optional[str] = None,
    site_status: str = "all"
) -> Tuple[pd.DataFrame, List[Dict]]:
    if isinstance(sites, list): sites = ",".join(sites)
    if isinstance(parameters, list): parameters = ",".join(parameters)

    params = {
        "format": "json",
        "sites": sites,
        "parameterCd": parameters,
        "siteStatus": site_status
    }
    if startDT or endDT:
        if not (startDT and endDT):
            raise ValueError("Provide both startDT and endDT or only 'period'.")
        params.update({"startDT": startDT, "endDT": endDT})
    else:
        params["period"] = period or "P2D"

    r = requests.get(BASE, params=params, timeout=30)
    r.raise_for_status()
    payload = r.json()

    ts_list = payload.get("value", {}).get("timeSeries", [])
    if not ts_list:
        return pd.DataFrame(columns=["datetime","value","parameter","variableName",
                                     "siteCode","siteName","units","qualifiers"]), []

    rows, info = [], []
    for ts in ts_list:
        src = ts.get("sourceInfo", {})
        var = ts.get("variable", {})
        vals = (ts.get("values") or [{}])[0].get("value", [])

        site_name = src.get("siteName")
        site_code = (src.get("siteCode") or [{}])[0].get("value")
        agency =    (src.get("siteCode") or [{}])[0].get("agencyCode")
        geo = (src.get("geoLocation") or {}).get("geogLocation") or {}
        lat, lon = geo.get("latitude"), geo.get("longitude")

        var_name = var.get("variableName")
        var_unit = (var.get("unit") or {}).get("unitCode")
        var_code = (var.get("variableCode") or [{}])[0].get("value")

        info.append({
            "site name": site_name, "site code": site_code, "site agency": agency,
            "variable name": var_name, "variable code": var_code, "units": var_unit,
            "latitude": lat, "longitude": lon
        })

        for e in vals:
            rows.append({
                "datetime": e.get("dateTime"),
                "value": float(e["value"]) if e.get("value") not in (None,"","NaN") else None,
                "parameter": var_code,
                "variableName": var_name,
                "siteCode": site_code,
                "siteName": site_name,
                "units": var_unit,
                "qualifiers": e.get("qualifiers")
            })

    df = pd.DataFrame.from_records(rows)
    if not df.empty:
        df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
        df.sort_values("datetime", inplace=True, ignore_index=True)
    return df, info

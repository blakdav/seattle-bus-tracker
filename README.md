# Seattle Bus Tracker

Real-time Seattle bus arrivals using the [OneBusAway Puget Sound API](https://api.pugetsound.onebusaway.org).

## Features

- Save stops to a library
- Group stops into named combos (e.g. "Morning commute", "Home")
- Tap a group to load arrivals for just those stops
- Session memory — last selected group auto-loads for 1 hour (configurable)
- All settings server-side, consistent across devices

## Setup

```bash
mkdir -p /opt/docker/seattle-bus-tracker/data
```

## Docker Compose

```yaml
services:
  bus-tracker:
    image: blakdav/seattle-bus-tracker:latest
    container_name: bus-tracker
    restart: unless-stopped
    volumes:
      - /opt/docker/seattle-bus-tracker/data:/data
    networks:
      - npm_internal

networks:
  npm_internal:
    external: true
```

## API Key

Get a free key by emailing `oba_api_key@soundtransit.org`. Add it in the Settings tab — saved server-side at `/data/config.json`.

## Data files

- `stops.json` — stop library
- `groups.json` — named groups
- `config.json` — API key and settings

# Seattle Bus Tracker

Real-time Seattle bus arrivals using the [OneBusAway Puget Sound API](https://api.pugetsound.onebusaway.org).

Saved stops and API key are stored server-side in `/data` so they persist across devices.

## Setup

Create the data directory on the host:

```bash
mkdir -p /opt/bus-tracker/data
```

## Docker Compose

```yaml
services:
  bus-tracker:
    image: blakdav/seattle-bus-tracker:latest
    container_name: bus-tracker
    restart: unless-stopped
    volumes:
      - /opt/bus-tracker/data:/data
    networks:
      - npm_internal

networks:
  npm_internal:
    external: true
```

## API Key

Get a free key by emailing `oba_api_key@soundtransit.org`. Once you have it, paste it in the Settings tab in the app — it's saved to the server at `/opt/bus-tracker/data/config.json`.

The `TEST` key works for dev/personal use but is rate-limited.

## Data

Saved stops and config live at `/opt/bus-tracker/data/` on the host:

- `stops.json` — your saved stops
- `config.json` — API key and other settings

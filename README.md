# Seattle Bus Tracker

Real-time Seattle bus arrivals using the [OneBusAway Puget Sound API](https://api.pugetsound.onebusaway.org).

## Running with Docker

```bash
docker run -d -p 8080:80 blakdav/seattle-bus-tracker
```

Then open http://localhost:8080.

## Configuration

Open `index.html` and set your OBA API key at the top of the `<script>` block:

```js
const OBA_KEY = 'YOUR_KEY_HERE';
```

Get a free key by emailing `oba_api_key@soundtransit.org`.

The `TEST` key works for personal/dev use but is rate-limited.

## Development

Just open `index.html` in a browser — no build step needed.

## Docker Compose

```yaml
services:
  bus-tracker:
    image: blakdav/seattle-bus-tracker:latest
    ports:
      - "8080:80"
    restart: unless-stopped
```

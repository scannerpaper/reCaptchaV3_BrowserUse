# reCaptchaV3_BrowserUse

This repository contains a client using the Browser-Use framework to bypass a sample reCaptcha webpage.

### Starting Chrome with CDP

To use the browser sample, you need to start Chrome with remote debugging enabled:

```bash
# Start Chrome with CDP debugging on port 9222
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
```

### Running the Browser Sample

1. Make sure Chrome is running with CDP enabled (see above)
2. Run the sample script:
```bash
python main.py
```

## Sample Target Page

The `target_webpage` directory contains a sample login page with integrated reCaptcha.

1. Make sure to set the configuration variables for reCaptcha.
2. Run the sample script:
```bash
npm install
node server.js
```


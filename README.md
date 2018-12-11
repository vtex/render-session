# render-session
> External session provider for vtex.render-runtime

## Developing
To build run:
```
yarn && yarn clean && yarn build
```

This will build the app and generate a bundle in the `/dist` folder. 

To test it, run
```
yarn && yarn start
```

this will start a webserver serving the file in the `/dist` folder.

### Testing
Set the `http:localhost:8080/index.min.js` in the render-runtime's externals and get ready for the fun :)

> If your web browser complains about CORS, be sure to add [this extension](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=en) to chrome

[![npm version](https://badge.fury.io/js/project-oxford-ocr-api.svg)](http://badge.fury.io/js/project-oxford-ocr-api)

# Project Oxford OCR API

Microsoft’s Project Oxford helps developers build more intelligent apps. Go to http://projectoxford.ai for more information.

This library was created to use the OCR API from any Node.JS app. 

How to using this library:

### Requirements

    1. Node v4.0.0 or major
    
    2. Project Oxford API key
    
Go to  https://www.projectoxford.ai/doc/general/subscription-key-mgmt and follow the steps to get an API key.

### Installation

    npm install project-oxford-ocr-api
    
### Code Sample
```` js
var api = require("project-oxford-ocr-api");

api.API_KEY = '' // SET THE KEY HERE

api.fromStream({ data : fs.createReadStream("C:\\temp\\sample.jpg")}, (error,response,result) =>
{
    console.log(result);
    console.log(result.getAllText());
    console.log(result.getTextByFlowDirection());
});

````

### Usage Alternatives

```` js
api.fromBase64({ data : "base64StringImage"}, callback);

api.fromBuffer({ data : new Buffer(data)}, callback);

app.fromImageUrl({ url : "http://foo.com/imgUrl.png"}, callback);
````

### Options

Other parameters to use with the API. 
````json
{
    "language" : 'en',
    "detectOrientation" : 'true'
}
````
For more information (available languages and other details) check:
https://dev.projectoxford.ai/docs/services/54ef139a49c3f70a50e79b7d/operations/5527970549c3f723cc5363e4





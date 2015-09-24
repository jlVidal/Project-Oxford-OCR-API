# Project Oxford OCR API

Microsoft’s Project Oxford helps developers build more intelligent apps.
This library was created to use for call the Project Oxford OCR API from any Node.JS app.

How to using Project Oxford OCR API:

### First
Go to  https://www.projectoxford.ai/doc/general/subscription-key-mgmt and follow the steps to get an API key.

### Code
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

### Alternatives

```` js
api.fromBase64({ data : "base64StringImage"}, callback);

api.fromBuffer({ data : new Buffer(data)}, callback);

app.fromImageUrl( { url : "http://foo.com/imgUrl.png"}, callback);
````

### Options

Options to use with the API. 
````json
{
    "language" : 'en',
    "detectOrientation" : 'true'
}
````
For more information (available languages and other details) check:
https://dev.projectoxford.ai/docs/services/54ef139a49c3f70a50e79b7d/operations/5527970549c3f723cc5363e4





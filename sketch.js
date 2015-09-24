
//var k = [{  "boundingBox": "799,118,102,58"  }, { "boundingBox": "937,119,109,57"}]
//k.sort(sortByLeft);
//console.log(k);
//k.sort((a,b) =>
//{
//    return -sortByLeft(a,b);
//})
//console.log(k);
//return;

//app.API_KEY = "xxxx";

var res = (e, response, body) => {
    //var res1 = body.getAllText();
    //console.log(res1);
    var res2 = body.getTextByFlowDirection();
    console.log(res2);

};

fs.readFile("C:\\temp\\separated.jpg", function (err, data) {
    if (err)
        console.log("read jpg fail " + err);
    else {
        console.log(data);
    }

    app.fromByteArray({"data": data}, res);

    setTimeout(() =>
    {
        console.log('----');
        var base64Img = new Buffer(data).toString("base64");
        console.log(base64Img);
        app.fromBase64({ data : base64Img}, res);

        setTimeout(() =>
        {
            console.log('----');
            var stream = fs.createReadStream("c:\\temp\\separated.jpg")
            app.fromStream({"data": stream}, res);
        },5000);
    },5000);
});

//app.fromImageUrl( { url : "http://1.bp.blogspot.com/-u8WP5pchI8o/Tq2zvTe8x5I/AAAAAAAAD4g/P1EaN0ngqt8/s1600/Ingredients.png"}, res);


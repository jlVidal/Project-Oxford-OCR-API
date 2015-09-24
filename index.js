/**
 * Created by John on 9/23/2015.
 */

var request = require('request');
var fs = require('fs');
var util = require('util');

function getLanguageOrDefault(options) {
    var language;
    if (util.isNullOrUndefined(options) || util.isNullOrUndefined(options.language)) {
        language = "unk";
    }
    else {
        language = options.language;
    }
    return language;
}

function getDetectOrientationOrDefault(options) {
    var detectOrientation;
    if (util.isNullOrUndefined(options) || util.isNullOrUndefined(options.detectOrientation)) {
        detectOrientation = "unk";
    }
    else {
        detectOrientation = options.detectOrientation;
    }
    return detectOrientation;
}

function getRectangle(a) {
    var values = a.boundingBox.split(',');
    var x = Number.parseFloat(values[0]);
    var y = Number.parseFloat(values[1]);
    var width = Number.parseFloat(values[2]);
    var height = Number.parseFloat(values[3]);

    return {left: x, top: y, width: width, height: height};
}

function getMedian(col) {
    var half = Math.floor(col.length / 2);

    if (col.length % 2)
        return col[half];
    else
        return (col[half - 1] + col[half]) / 2.0;
}

function getAverage(col) {
    return col.reduce((a, b) => a + b) / col.length;
}
function getFirstMode(col) {
    if (col.length == 0)
        return undefined;

    var modeMap = {};
    var maxEl = col[0], maxCount = 1;
    for (var i = 0; i < col.length; i++) {
        var el = col[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}
function isEqualOrBetween(target, valueOne, valueTwo) {
    var minValue = Math.min(valueOne, valueTwo);
    var maxValue = Math.max(valueOne, valueTwo);

    if (target >= minValue && target <= maxValue)
        return true;

    return false;
}

function sortRectangleByLeftPos(a, b) {
    var retA = getRectangle(a);
    var retB = getRectangle(b);

    return retA.left - retB.left;
};


function threatResponse(resultObj, callBack) {
    if (!util.isNullOrUndefined(resultObj.error)) {
        if (util.isNullOrUndefined(resultObj.body)) {
            resultObj.body = {};
        }
        resultObj.body.getAllText = () => "";
        resultObj.body.getTextByFlowDirection = () => "";
        callBack(resultObj.error, resultObj.response, resultObj.body);
        return;
    }

    var ocrObject = resultObj.body;

    ocrObject.getAllText = () => {
        var plainText = "";
        if (ocrObject.regions != null) {
            for (var i = 0; i < ocrObject.regions.length; i++) {

                for (var j = 0; j < ocrObject.regions[i].lines.length; j++) {
                    for (var k = 0; k < ocrObject.regions[i].lines[j].words.length; k++) {
                        plainText += ocrObject.regions[i].lines[j].words[k].text + " ";
                    }
                    plainText += "\n";
                }
                plainText += "\n";
            }
        }
        return plainText;
    };
    ocrObject.getTextByFlowDirection = () => {
        var allLines = [];
        var allWords = [];
        if (ocrObject.regions != null) {
            for (var i = 0; i < ocrObject.regions.length; i++) {

                for (var j = 0; j < ocrObject.regions[i].lines.length; j++) {
                    for (var k = 0; k < ocrObject.regions[i].lines[j].words.length; k++) {
                        allWords.push(ocrObject.regions[i].lines[j].words[k]);
                    }
                    allLines.push(ocrObject.regions[i].lines[j]);
                }
            }
        }

        if (allWords.length == 0) {
            return "";
        }

        var allWordsHeight = allWords.map(a => getRectangle(a).height);
        allWordsHeight.sort();

        var average = getAverage(allWordsHeight);
        var mode = getFirstMode(allWordsHeight);
        var median = getMedian(allWordsHeight);

        var range;
        if (average < 20) {
            // small letters
            range = Math.floor((median + mode - 1) / 4);
        } else {
            if (average < 30) {
                //medium letters
                range = Math.floor(((median + mode - 1) / 2) * 0.3);
            } else {
                //big letters
                var factor = (Math.round(average / 10) / 10);
                range = Math.round(((median + mode - 1) / 2) * (0.1 + factor + (factor / 10)));
            }
        }

        var then = sortRectangleByLeftPos;

        allLines.sort((a, b) => {
            var retA = getRectangle(a);
            var retB = getRectangle(b);

            if (retA.top == retB.top)
                return then(a, b);

            if (isEqualOrBetween(retA.top, retB.top, retB.top + range) || isEqualOrBetween(retA.top, retB.top - range, retB.top))
                return then(a, b);

            return retA.top - retB.top;
        });


        var allTextLines = allLines.map(a => {
            'use strict';
            var line = "";
            for (let i = 0; i < a.words.length; i++) {
                if (i != 0)
                    line = line + " ";

                line = line + a.words[i].text;
            }
            return line;
        });

        var plainText = allTextLines.reduce((a, b) => {
            return a + "\n" + b;
        });

        //var allModes = allWords.Select(a => (double)a.Rectangle.Value.Height).Modes().ToArray();
        //var average = allWords.Select(a => (double)a.Rectangle.Value.Height).Average();

        return plainText;
    };

    callBack(resultObj.error, resultObj.response, ocrObject);
}

var apiRef = {
    API_BASE_URL: 'https://api.projectoxford.ai/vision/v1/ocr',
    API_KEY: '',
    fromByteArray: (apiArgs, callback) => {
        var buffer =  new Buffer(apiArgs.data);

        var other = {};
        Object.keys(apiArgs).forEach(function (val) {
            other[val] = apiArgs[val];
        });

        other.data = buffer;
        apiRef.fromBuffer(other, callback);
    },
    fromBuffer: (apiArgs, callback) =>
    {
        apiRef.fromData(apiArgs, callback);
    },
    fromBase64: (apiArgs, callback) => {
        var buffer = new Buffer(apiArgs.data, "base64");

        var other = {};
        Object.keys(apiArgs).forEach(function (val) {
            other[val] = apiArgs[val];
        });

        other.data = buffer;
        apiRef.fromBuffer(other, callback);
    },
    fromStream: (apiArgs, callback) => {
        apiRef.fromData(apiArgs, callback);
    },
    fromData: (apiArgs, callback) =>
    {
        var data = apiArgs.data;
        var language = getLanguageOrDefault(apiArgs);
        var detectOrientation = getDetectOrientationOrDefault(apiArgs);
        var requestOptions = {
            baseUrl: apiRef.API_BASE_URL,
            uri: `?language=${language}&detectOrientation=${detectOrientation}`,
            headers: {
                "Ocp-Apim-Subscription-Key": apiRef.API_KEY
            },
            method: "POST",
            multipart: [{
                'content-type': 'application/octet-stream',
                body: data
            }],
            json : true
        };

        //console.log(requestOptions);
        return request(requestOptions, (error, response, body) => {
            threatResponse({error, response, body}, callback);
        });
    },
    fromImageUrl: (apiArgs, callback) => {
        var language = getLanguageOrDefault(apiArgs);
        var detectOrientation = getDetectOrientationOrDefault(apiArgs);
        var url = apiArgs.url;

        var requestOptions = {
            baseUrl: apiRef.API_BASE_URL,
            uri: `?language=${language}&detectOrientation=${detectOrientation}`,
            headers: {
                "Ocp-Apim-Subscription-Key": apiRef.API_KEY
            },
            method: "POST",
            json: true,
            body: {"Url": url}
        };

        return request(requestOptions, (error, response, body) => {
            threatResponse({error, response, body}, callback);
        });
    }
};
module.exports = apiRef;
var app = module.exports;


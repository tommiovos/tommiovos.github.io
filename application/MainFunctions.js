const singletons = {
    canvas: {},
    webcams: {},
    shaders: {
        colorToAlpha
    }
}


function preload() {
    // singletons.shaders. the shader
    singletons.shaders.colorToAlpha = loadShader('shader.vert', 'shader.frag');
}


function setupCanvas() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('main-canvas')
    canvas.size(getCanvasResW(), getCanvasResH())


    greenScreenMedia = {
        width: 640,
        height: 480
    };


    setSmoothedCanvas(canvas.canvas, true)

    frameRate(30);

    pixelDensity(1);
    singletons.canvas = canvas;
    window.setTimeout(() => {
        windowResized()
    }, 0)
    return canvas;

}

function otherSetups(canvas, medias) {
    recorder = new MyMediaRecorder(canvas) // jelper class to record canvas
    setupWebcams(() => {
        transparentImg = loadMedia("webcam:0", webcamLoaded)
    }) // function to initiate webcams (callback parameter called when done)

    // bgImg = loadMedia('beach.jpg')
    // button = createButton('startRecording');
    button = select('#button-record');

    // STYLING
    button.mousePressed(v => {
        recorder.toggleRecording();
        button.html(recorder.isRecording ? 'Start' : 'Stop')

        if (switcher) {
            document.getElementById('changeText').style.color = '#B02719';
            switcher = false;
            }
        else {
                document.getElementById('changeText').style.color = '#F4F7F9';
                switcher = true;
            
            }

    });
    // showUI = createButton('hide')
    showUI = select("#button-showhide");
    showUI.mousePressed(() => {
        const wasVisible = allUIs[0].elt.style.display !== 'none';
        if (wasVisible) {
            showUI.html('show');
            allUIs.map(e => e.hide());
        } else {
            showUI.html('hide');
            allUIs.map(e => e.show());
        }
    })
    sliderThresh = select('#range-spectre');
    sliderTol = select('#range-density');
    selBackground = select('#select-image-back');
    selForeground = select('#select-image-front');
    selOption = select('#select-option');


    for (const m of medias) {
        selBackground.option(m)
        selForeground.option(m)
    }

    selOption.option("Image originale");
    selOption.option("Inverser image");
    selOption.option("Threshold");
    // selOption.option("Grey")
    // selOption.option("Erode")
    // selOption.option("Posterize")
    // selOption.option("blur")

    selOption.changed((m) => {
        name_effet = selOption.value();
    })

    selBackground.changed((m) => {
        bgImg = loadMedia(selBackground.value())
    })

    selForeground.changed((m) => {
        transparentImg = loadMedia(selForeground.value(), webcamLoaded)
    })


    // selRes = createSlider(0.1,1,1,0.1)
    // selRes.changed(()=>{
    //   setDownscaling(selRes.value()) // can downscale resolution if needed
    //   if(transparentImg ){
    //     transparentImg = loadMedia(selForeground.value(),undefined,{width:{max:getCanvasResW()},height:{max:getCanvasResW()}})
    //   }
    // })

    // flashyColorChk = createCheckbox('flashy');
    allUIs = [button, sliderThresh, sliderTol, selBackground, selForeground, selOption]
    layoutUI()

    return recorder, transparentImg;
}

function webcamLoaded() {
    let w = transparentImg.width
    let h = transparentImg.height
    setTargetRes(w, h) // sets canvas resolution to webcam one (allow for bigger resolution than displayed -> better video recordings)
    resizeCanvasToWindow()
}


function setupWebcams(cb) {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            var num = 0
            const webcams = {}
            devices.forEach(function (device) {
                if (device.kind == "videoinput") {
                    console.log(device.kind + ": " + device.label +
                        " id = " + device.deviceId);
                    console.log(device)
                    var name = "camera:" + num
                    if (device.label) {
                        name = device.label
                    } else {
                        num += 1
                    }
                    webcams[name] = device
                }
            });
            singletons.webcams = webcams
            if (cb) cb(webcams);

        })
        .catch(function (err) {
            console.log(err.name + ": " + err.message);
        });
}


function initWebcam(device, cb, _caps) {
    let caps = _caps || {
        width: {
            max: maxTargetRes.w
        },
        height: {
            max: maxTargetRes.h
        }
    }
    if (device.getCapabilities && !_caps) {
        caps = device.getCapabilities()

        if (caps.width && caps.width.max && caps.height && caps.height.max) {
            caps.width = Math.min(maxTargetRes.w, caps.width.max)
            caps.height = Math.min(maxTargetRes.h, caps.height.max)
        }
    }

    const constraints = device ? {
            audio: false,
            video: {
                deviceId: device.deviceId,
                width: caps.width,
                height: caps.height,
                frameRate: {
                    max: 30
                },
                // resizeMode:"none",
                // width:Math.min(caps.width.max,getCanvasResW()),
                // height:Math.min(caps.height.max,getCanvasResH()),
            }
        } :
        VIDEO

    const wcMedia = createCapture(constraints, st => {
        if (wcMedia) wcMedia.stream = st;
        if (cb) {
            cb();
        }
    });

    wcMedia.hide()
    return wcMedia

}


function windowResized() {
    resizeCanvasToWindow()
    layoutUI()
    // camera.size(windowWidth, windowHeight);

}

function _smoothRel(x, c) {
    if (x < 0) return 0;
    if (x > 1) return 1;
    return 3 * x * x - 2 * x * x * x
}

function smoothRel(x, c) {
    if (x < 0) return 0;
    if (x > 1) return 1;
    return x;
}

function calculateDistance(c, min, max) {
    if (c < min) return min - c;
    if (c > max) return c - max;

    return 0;
}

function colorZToAlpha(img, color, color2, threshold) {
    if (!img || img.pixels === undefined) return;
    if (img.pixels.length === 0) return;
    const w = img.width
    const h = img.height
    const pixT = img.pixels
    const wh = w * h * 4

    if (!color2) {
        color2 = color
    }
    const cmin = [color[0], color[1], color[2]];
    if (color2[0] < color[0]) cmin[0] = color2[0];
    if (color2[1] < color[1]) cmin[1] = color2[1];
    if (color2[2] < color[2]) cmin[2] = color2[2];

    const cmax = [color[0], color[1], color[2]];
    if (color2[0] > color[0]) cmax[0] = color2[0];
    if (color2[1] > color[1]) cmax[1] = color2[1];
    if (color2[2] > color[2]) cmax[2] = color2[2];
    const thresholdSq = threshold * threshold

    for (let i = wh - 4; i > 0; i -= 4) {
        const distL = [
            calculateDistance(pixT[i], cmin[0], cmax[0]),
            calculateDistance(pixT[i + 1], cmin[1], cmax[1]),
            calculateDistance(pixT[i + 2], cmin[2], cmax[2])
        ];
        const dist = (distL[0] * distL[0] + distL[1] * distL[1] + distL[2] * distL[2]) / 3
        pixT[i + 3] = dist > thresholdSq ? 255 : 0;
    }
}

function colorToAlpha(img, color, threshold, tolerance, stride) {
    if (!img || img.pixels === undefined) return;
    if (img.pixels.length === 0) return;
    if (!tolerance) {
        tolerance = 0;
    }

    const w = img.width
    const h = img.height
    const pixT = img.pixels
    const wh = w * h * 4
    color.hsvValue = toHSV(color, 0)
    if (!stride) stride = 0;
    if (tolerance === 0) {
        const threshold3 = threshold * 3
        const thresholdSq = threshold * threshold;
        const thresholdSq3 = threshold * threshold * 3;
        if (stride === 0) {
            for (let i = 0; i < wh; i += 4) {
                const dist = normDistSq3(pixT, color, i);
                pixT[i + 3] = dist > thresholdSq3 ? 255 : 0;

            }
        } else {
            const stride4 = stride * 4
            // first coarse pass
            for (let y = 0; y < h; y += stride) {
                for (let x = 0; x < w; x += stride) {
                    const i = (y * w + x) * 4
                    const dist = normDistSq3(pixT, color, i);
                    pixT[i + 3] = dist > thresholdSq3 ? 255 : 0;
                }
            }

            const maxSum = 255 * 4

            for (let y = 0; y < h - (stride); y += stride) {
                for (let x = 0; x < w - (stride); x += stride) {

                    const i = (y * w + x) * 4 + 3
                    const ib = i + w * stride4
                    const il = i + stride4
                    const ilb = ib + stride4

                    const sum = pixT[i] + pixT[ib] + pixT[ilb] + pixT[il]
                    if (sum === maxSum) {
                        for (let j = x; j < x + stride; j++) {
                            for (let k = y; k < y + stride; k++) {
                                // if(j==x && k==y) continue
                                pixT[(k * w + j) * 4 + 3] = 255;
                            }
                        }
                    } else if (sum === 0) {
                        for (let j = x; j < x + stride; j++) {
                            for (let k = y; k < y + stride; k++) {
                                // if(j==x && k==y) continue
                                pixT[(k * w + j) * 4 + 3] = 0;
                            }
                        }
                    } else {
                        for (let j = x; j < x + stride; j++) {
                            for (let k = y; k < y + stride; k++) {
                                // if(j==x && k==y) continue
                                const ii = (k * w + j) * 4
                                const dist = normDistSq3(pixT, color, ii);
                                pixT[ii + 3] = dist > thresholdSq3 ? 255 : 0;
                            }
                        }
                    }

                }
            }

        }


    } else {
        const tolerance2 = 2 * tolerance;
        const ttol = threshold + tolerance
        for (let i = 0; i < wh; i += 4) {
            const dist = normDist(pixT, color, i);

            const relDist = (1 - (ttol - dist) / tolerance2)
            pixT[i + 3] = Math.min(1, Math.max(0, relDist)) * 255;

        }
    }

}

function colorToAlphaShader(img, color, threshold, tolerance) {
    if (!img || img.pixels === undefined) return;

    if (img.pixels.length === 0) return;
    if (!tolerance) {
        tolerance = 0.0001;

    }
    const shaderO = singletons.shaders.colorToAlpha;
    shader(shaderO)
    // lets just send the cam to our shader as a uniform
    shaderO.setUniform('tex1', img);


    // also send the mouseX value but convert it to a number between 0 and 1
    shaderO.setUniform('threshold', threshold / 255);
    shaderO.setUniform('tolerance', tolerance / 255);
    shaderO.setUniform('color', color);

    // rect gives us some geometry on the screen
    rect(0, 0, width, height);
}

function blurAlpha(img, size) {
    if (!img || img.pixels === undefined) return

    if (img.pixels.length === 0) return


    const w = img.width
    const h = img.height
    const pixT = img.pixels

    for (let y = 1; y < h - 1; y++) {
        for (let x = (y % 2) + 1; x < w - 1; x += 2) {

            const i = (y * w + x) * 4 + 3;
            const it = ((y - 1) * w + x) * 4 + 3;
            const ib = ((y + 1) * w + x) * 4 + 3;
            const il = ((y) * w + x - 1) * 4 + 3;
            const ir = ((y) * w + x + 1) * 4 + 3;
            const ta = (pixT[it] + pixT[ib] + pixT[ir] + pixT[il]) / 4
            pixT[i] = ta

        }
    }

}


function getColorUnderMouseClick(e, greenScreenMedia, toUnNatural) {
    const canvas = singletons.canvas
    if (e.srcElement.localName === "body") {
        return [0, 255, 0]
    } // green if clicked out
    if (e.srcElement != singletons.canvas.canvas) //|| (mouseStart.x>0 && mouseStart.x!=mouseX))
    {
        return;
    }
    greenScreenMedia.loadPixels()
    const fitR = fitStretched(greenScreenMedia, canvas)
    const mouseRelX = mouseX - fitR.left
    const mouseRelY = mouseY - fitR.top
    const iCam = Math.floor(mouseRelX * greenScreenMedia.width / fitR.width);
    const jCam = Math.floor(mouseRelY * greenScreenMedia.height / fitR.height);
    console.log(iCam, jCam, fitR)
    const loc = (jCam * greenScreenMedia.width + iCam) * 4;
    // greenScreenMedia.loadPixels();
    if (loc + 2 < greenScreenMedia.pixels.length) {
        let c = [
            greenScreenMedia.pixels[loc + 0],
            greenScreenMedia.pixels[loc + 1],
            greenScreenMedia.pixels[loc + 2],
        ]
        if (toUnNatural) { // get flashy value related to color, helps if we want to remove a primary color like green
            let hsv = toHSV(c, 0)
            hsv[1] = Math.max(200, hsv[1])
            hsv[2] = 255
            c = fromHSV(hsv, 0)
        }
        return c;
    } else {
        console.error("mouse color : pixel not loaded")
    }
}


let numMedia = 0;

function loadMedia(path, cb, caps) {
    med = {};
    if (path.startsWith("webcam:")) {
        const webcams = singletons.webcams
        const wNum = parseInt(path.substr(7))
        if (wNum < Object.keys(webcams).length) {
            const device = webcams[Object.keys(webcams)[wNum]]
            med = initWebcam(device, cb, caps)
            return med
        } else {
            console.error('webcam num', wNum, 'does not exists')
        }
    } else if (path === "none") {
        return
    } else {
        if (!path.startsWith("http") && !path.startsWith('assets/')) {
            path = 'assets/' + path
        }
        if ([".mp4", ".mov", ".avi", ".webm"].some(ext => path.endsWith(ext))) {
            med = createVideo(path,
                () => {
                    med.loop();
                    med.volume(0);
                    if (cb) {
                        cb()
                    }
                });
            med.hide()

        } else if ([".jpg", ".png", ".bmp"].some(ext => path.endsWith(ext))) {
            med = loadImage(path, () => {
                med._pixelsState._pixelsDirty = true;
                med.loadPixels();
                if (cb) {
                    cb()
                }
            })
            med.loadPixels();
            med.numMedia = numMedia++;
        } else {
            console.error("extention not supported", path)
        }
        return med
    }
}


function resizeCanvasToWindow() {
    resizeCanvas(getCanvasResW(), getCanvasResH(), true);
    const fit = fitStretched({
        width: getCanvasResW(),
        height: getCanvasResH()
    }, {
        width: getWindowWidth(),
        height: getWindowHeight()
    })
    canvas.canvas.style.width = "" + fit.width + "px"
    canvas.canvas.style.height = "" + fit.height + "px"
}

function setDownscaling(q) {
    CurrentDownscale = q
    resizeCanvasToWindow();
}


function layoutUI() {
    // auto layout ui in column
    const wSize = getWindowWidth() / 3
    const gap = 10
    let y = 0
    let x = 0

    const hSize = getWindowHeight() / allUIs.length
    // for (const element of allUIs) {
    //     element.position(x, y);
    //     element.size(wSize, hSize - gap)
    //     y += hSize
    // }
}

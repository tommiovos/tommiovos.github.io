var CurrentDownscale = 1


function setSmoothedCanvas(c, tog) {
    const ctx = c.getContext('2d');
    if (ctx) {
        ctx.imageSmoothingEnabled = tog;
        ctx.mozImageSmoothingEnabled = tog;
        ctx.webkitImageSmoothingEnabled = tog;
        ctx.msImageSmoothingEnabled = tog;
    }
}

function isMobile() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

function getCanvasScale() {
    return CurrentDownscale;
}

function getWindowWidth() {
    return int(window.innerWidth);
}

function getWindowHeight() {
    return int(window.innerHeight);
}

var targetRes = {w: 0, h: 0}
var maxTargetRes = {w: 1280, h: 960}

function setTargetRes(w, h) {
    if (w > maxTargetRes.w) {
        var fitr = fitStretched({width: w, height: h}, {width: 1080, height: 720})
        w = fitr.width
        h = fitr.height
        console.error('big resolutions leads to poor perfs')
        // debugger
    }
    targetRes = {w, h}
}

function getCanvasResW() {
    return int(
        (targetRes.w || window.innerWidth) * getCanvasScale());
}

function getCanvasResH() {
    return int(
        (targetRes.h || window.innerHeight) * getCanvasScale());
}

function fitStretched(src, dest) {
    const w = src.width, h = src.height
    const wd = dest.width, hd = dest.height
    const srcAR = w / h
    const dstAR = wd / hd
    const res = {left: 0, top: 0, width: wd, height: hd}
    if (srcAR > dstAR) {
        const targetH = hd * dstAR / srcAR
        const pad = Math.floor((hd - targetH) / 2)
        res.top = pad
        res.height = hd - 2 * pad
    } else if (srcAR < dstAR) {
        const targetW = wd * srcAR / dstAR
        const pad = Math.floor((wd - targetW) / 2)
        res.left = pad
        res.width = wd - 2 * pad
    }
    return res

}


function meanDist(a, b, i) {
    const dr = Math.abs(a[i] - b[0])
    const dg = Math.abs(a[i + 1] - b[1])
    const db = Math.abs(a[i + 2] - b[2])
    return (dr + dg + db) / 3
}

function meanDist3(a, b, i) {
    const dr = Math.abs(a[i] - b[0])
    const dg = Math.abs(a[i + 1] - b[1])
    const db = Math.abs(a[i + 2] - b[2])
    return (dr + dg + db)
}

function normDist(a, b, i) {
    const dr = a[i] - b[0]
    const dg = a[i + 1] - b[1]
    const db = a[i + 2] - b[2]
    return Math.sqrt((dr * dr + dg * dg + db * db) / 3)
}

function normDistSq(a, b, i) {
    const dr = a[i] - b[0]
    const dg = a[i + 1] - b[1]
    const db = a[i + 2] - b[2]
    return ((dr * dr + dg * dg + db * db) / 3)
}

function normDistSq3(a, b, i) {
    const dr = a[i] - b[0]
    const dg = a[i + 1] - b[1]
    const db = a[i + 2] - b[2]
    return (dr * dr + dg * dg + db * db)
}

function meanC(b, i) {
    return (b[i + 0] + b[i + 1] + b[i + 2]) / 3
}

function stdC(b, mean, i) {
    return Math.sqrt(((b[i + 0] - mean) * (b[i + 0] - mean) +
        (b[i + 1] - mean) * (b[i + 1] - mean) +
        (b[i + 2] - mean) * (b[i + 2] - mean)) / 3)
}

function centerC(b, i) {
    return (b[i] + 2.0 * b[i + 1] + 3.0 * b[i + 2]) / 6.0
}

function shapeDistColor(a, b, i) {
    const meanA = meanC(a, i)
    const stdA = stdC(a, meanA, i)
    const centerA = centerC(a, i)
    const meanB = meanC(b, 0)
    const stdB = stdC(b, meanB, 0)
    const centerB = centerC(b, 0)
    const stdDist = Math.max(0, Math.min(255.0, Math.abs(stdA - stdB)))
    // const nDist = normDistColor(a,b,i)
    const centerDist = Math.max(0, Math.min(255.0, Math.abs(centerA - centerB)))
    const al = 0.5
    return centerDist * al + (1 - al) * stdDist
    // return centerDist*stdDist/255.0
}

function hsvDist(a, b, i) {
    const hsvA = toHSV(a, i)
    const hsvB = 'hsvValue' in b ? b.hsvValue : toHSV(b, 0)
    const dHSV = [(hsvA[0] - hsvB[0]),
        (hsvA[1] * hsvA[2] / 255 - hsvB[1] * hsvB[2] / 255),
        (hsvA[2] - hsvB[2])]
    if (dHSV[0] > 127) {
        dHSV[0] = dHSV[0] - 255
    } else if (dHSV[0] < -127) {
        dHSV[0] = 255 + dHSV[0]
    }
    dHSV[0] *= 2

    const weights = [1, 1, 1]

    return Math.sqrt((dHSV[0] * dHSV[0] * weights[0] + dHSV[1] * dHSV[1] * weights[1] + dHSV[2] * dHSV[2] * weights[2]) / (weights[0] + weights[1] + weights[2]))


}

function toHSV(c, i) {
    const r = c[i + 0]
    const g = c[i + 1]
    const b = c[i + 2]
    const minRGB = Math.min(r, Math.min(g, b));
    const maxRGB = Math.max(r, Math.max(g, b));

    // Black-gray-white
    if (minRGB == maxRGB) {
        return [0, 0, minRGB];
    }

    // Colors other than black-gray-white:
    const d = (r == minRGB) ? g - b : ((b == minRGB) ? r - g : b - r);
    const h = (r == minRGB) ? 3 : ((b == minRGB) ? 1 : 5);
    return [42.5 * (h - d * 1.0 / (maxRGB - minRGB)),
        (maxRGB - minRGB) * 255.0 / maxRGB,
        maxRGB]
}


function fromHSV(c, i) {
    const h = c[i + 0] / 255
    const s = c[i + 1] / 255
    const v = c[i + 2] / 255

    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];

}



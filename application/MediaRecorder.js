/*
*  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

'use strict';

/* globals main */

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

/* globals main, MediaRecorder */


class MyMediaRecorder {
    constructor(cnv) {
        const mediaSource = new MediaSource();
        mediaSource.addEventListener('sourceopen', this.handleSourceOpen.bind(this), false);

        // this.mimeType = "video/webm\;codecs=h264"
        // this.mimeType ="video/webm\;codecs=vp9"
        this.mimeType = "video/webm" //best quality so far

        const canvas = cnv.canvas
        var types = ["video/webm",
            "video/webm\;codecs=vp8",
            "video/webm\;codecs=daala",
            "video/webm\;codecs=h264",
            "video/mpeg"];

// for (var i in types) { 
//   console.log( "Is " + types[i] + " supported? " + (MediaRecorder.isTypeSupported(types[i]) ? "Maybe!" : "Nope :(")); 
// }
        // debugger

        this.video = createVideo();
        this.video.showControls();
        this.video.hide()


        this.mediaSource = mediaSource
        this.canvas = canvas
        this.isRecording = false;
        this.createStream(canvas)
    }

    createStream(c) {


        console.log('Started stream capture from canvas element: ', this.stream);
        this.mic = new p5.AudioIn()
        this.mic.getSources((deviceList) => {
            //print out the array of available sources
            console.log(deviceList);
            //set the source to the first item in the deviceList array

            let Idx = deviceList.findIndex((e) => e.label.toLowerCase().indexOf("webcam") >= 0)
            Idx = Math.max(0, Idx)

            this.mic.setSource(Idx);

            this.mic.start(() => {

                const st = this.mic.stream.getAudioTracks()[0]
                // let latency  = 0;
                // if(st.getCapabilities){
                //   if(st.getCapabilities().latency){
                //     latency = Math.min(st.getCapabilities().latency.max,1)

                //   }
                // }

                // st.applyConstraints({latency}).finally(()=>{
                this.stream = c.captureStream();
                this.stream.addTrack(st)
                console.log("adding audio track to video recorder")
                // })
            });
        });


    }

    handleSourceOpen(event) {
        console.log('MediaSource opened');
        this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        console.log('Source buffer: ', this.sourceBuffer);
    }


    handleDataAvailable(event) {
        if (event.data && event.data.size > 0) {
            this.recordedBlobs.push(event.data);
        }
    }

    handleStop(event) {
        console.log('Recorder stopped: ', event);
        if (this.video) {
            // this.video.show()
            const superBuffer = new Blob(this.recordedBlobs, {type: 'video/webm'});
            this.video.elt.src = window.URL.createObjectURL(superBuffer);
        }
    }

    toggleRecording() {
        if (!this.isRecording) {
            this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    // The nested try blocks will be simplified when Chrome 47 moves to Stable
    startRecording() {
        const audioTrack = this.mic.stream.getAudioTracks()
        let options = {mimeType: this.mimeType};
        this.recordedBlobs = [];
        try {
            this.mediaRecorder = new MediaRecorder(this.stream, options);
        } catch (e0) {
            console.log('Unable to create MediaRecorder with options Object: ', e0);
            try {
                options = {mimeType: 'video/webm,codecs=vp9'};
                this.mediaRecorder = new MediaRecorder(this.stream, options);
            } catch (e1) {
                console.log('Unable to create MediaRecorder with options Object: ', e1);
                try {
                    options = 'video/vp8'; // Chrome 47
                    this.mediaRecorder = new MediaRecorder(this.stream, options);
                } catch (e2) {
                    this.isRecording = false
                    alert('MediaRecorder is not supported by this browser.\n\n' +
                        'Try Firefox 29 or later, or Chrome 47 or later, ' +
                        'with Enable experimental Web Platform features enabled from chrome://flags.');
                    console.error('Exception while creating MediaRecorder:', e2);
                    return;
                }
            }
        }
        console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);
        this.isRecording = true
        this.mediaRecorder.onstop = this.handleStop.bind(this);
        this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
        this.mediaRecorder.start(); // collect x ms of data
        if (this.video) {
            this.video.hide()
        }
        console.log('MediaRecorder started', this.mediaRecorder);
    }

    stopRecording() {
        this.mediaRecorder.stop();
        console.log('Recorded Blobs: ', this.recordedBlobs);
        this.isRecording = false;
        if (this.video) {

            this.video.show()
            this.video.elt.onloadeddata = () => {
                this.video.elt.requestPictureInPicture().catch(e => {
                    debugger
                    this.video.show()
                    console.error(e)
                });
            };


        }
    }

    play() {
        if (this.video) {
            this.video.play();
        }
    }

    download() {
        const blob = new Blob(this.recordedBlobs, {type: 'video/webm'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'test.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
}


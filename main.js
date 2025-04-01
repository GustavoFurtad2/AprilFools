/*
    PS2 SCENE 01/04/2025

    https://github.com/GustavoFurtad2
*/

import { Timer } from "./timer.js"

const FONT = new Font("default")

let crossPad = new Image("cross.png")

let pad = Pads.get()
let oldPad = pad

let allocatedBytes = []
let gif = []


let frameSwapperTimer = new Timer()

let filenames = []

const STATES = {
    "menu": 0,
    "playing": 1,
    "joke": 2
}

let audio

let mustDraw = true

let introStartTimer

function initRom() {

    let i = 0;

    System.listDir("host:/roms/Daxter/graphics").forEach(image => {

        if (i < 55) {
            allocatedBytes.push(new Image("host:/roms/Daxter/graphics/" + image.name))
        }

        filenames.push(image.name)

        i += 1
    })

    audio = Sound.load("host:/roms/Daxter/audios.ogg")

    Sound.play(audio, 1)

    mustDraw = false
    introStartTimer = new Timer()

    currentState = STATES.playing
}

let emoji

function initJoke() {

    Sound.pause(audio)

    System.listDir("host:/roms/Daxter/gif").forEach(image => {

        gif.push(new Image("host:/roms/Daxter/gif/" + image.name))
    })

    emoji = new Image("host:/roms/Daxter/misc/emoji.png")
    
    currentFrame = 0

    currentState = STATES.joke
}

let currentFrame = 0

function handleMenu() {

    oldPad = pad
    pad = Pads.get()

    FONT.print(10, 10, "PSPFPS2 a PSP Emulator")
    FONT.print(10, 70, "Daxter.iso")

    crossPad.draw(485, 413)
    FONT.print(520, 413, "Confirm")

    if ((pad.btns & Pads.CROSS) && !(oldPad.btns & Pads.CROSS)) {
        initRom()
    }
}

function handleRom() {

    if (!mustDraw) {

        if (introStartTimer.get() >= 2500) {
            introStartTimer.pause()
            mustDraw = true
        }

        return
    }

    if (allocatedBytes[currentFrame]) {
        
        if (allocatedBytes[currentFrame].ready()) {
            allocatedBytes[currentFrame].width = 640
            allocatedBytes[currentFrame].height = 448
            allocatedBytes[currentFrame].draw(0, 0)
        }
    }

    if (allocatedBytes[currentFrame + 1]) {

        if (frameSwapperTimer.get() >= 56) {
            currentFrame += 1
            frameSwapperTimer.reset()
        }
    }
    else {

        if (currentFrame <= 299) {

            currentFrame += 1

            if (currentFrame == 300) {

                initJoke()

                return
            }

            Sound.pause(audio)

            for (let i = 0; i < currentFrame; i++) {
                allocatedBytes[i] = null
            }

            std.gc()

            allocatedBytes[currentFrame] = new Image("host:/roms/Daxter/graphics/" + filenames[currentFrame])

            if (currentFrame + 55 < 300) {
                for (let i = currentFrame; i <= currentFrame + 55; i++) {
                    allocatedBytes[i] = new Image("host:/roms/Daxter/graphics/" + filenames[i])
                }
            }
            else {
                for (let i = currentFrame; i <= 299 - currentFrame; i++) {
                    allocatedBytes[i] = new Image("host:/roms/Daxter/graphics/" + filenames[i])
                }    
            }

            Sound.resume(audio)

            allocatedBytes[currentFrame].width = 640
            allocatedBytes[currentFrame].height = 448
            allocatedBytes[currentFrame].draw(0, 0)
        }
    }
}

function handleJoke() {

    gif[currentFrame].width = 640
    gif[currentFrame].height = 448
    gif[currentFrame].draw(0, 0)

    if (frameSwapperTimer.get() >= 100) {
        currentFrame += 1
        frameSwapperTimer.reset()
    }

    if (currentFrame > gif.length - 1) {
        currentFrame = 0
    }

    FONT.color = Color.new(0, 0, 0)
    FONT.print(10, 290, "APRILS FOOLS")

    emoji.draw(90, 340)

}

let currentState = STATES.menu

while (true) {

    Screen.clear()

    switch (currentState) {

        case 0:
            handleMenu()
            break

        case 1:

            handleRom()
            break

        case 2:

            handleJoke()
            break

    }

    Screen.flip()
}
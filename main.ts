let catMuted = false;
let mumMuted = false;
let list = 0
let myOnTime = 0
let myOnTimer = 0
let altTrack = 1 //1 = Zim, 0 = Zam
let poly = false
let perxles: neopixel.Strip = null
perxles = neopixel.create(DigitalPin.P1, 24, NeoPixelMode.RGB)
let midiChannel: midi.MidiController = null
let anOutputIsOn = false
let chan = 0
let notes: number[] = []
let MIDIoffset = 0
let noteOffset = 12
let muted = false
function handlePinOuts() {
    pins.digitalWritePin(myPins[myNote], 1)
    anOutputIsOn = true
}



function sendMonoMidiViaI2C(port: number) {
    //pins.digitalWritePin(DigitalPin.P4, port)
    if (myNote != 127) {
        myNote += (noteOffset * port)
        // led.toggleAll()
        pins.i2cWriteNumber(0, myNote + (port * 127), NumberFormat.Int8LE) //add 127 to tell proMicro that it is alt port
    }
}



function sendMonoMidi() {
    if (myNote != 127) {
        midiChannel.noteOn(myNote)
        led.toggle(2, 2)
        midiChannel.noteOff(myNote)
    }
}

let altOutPut = 0;
radio.onReceivedValue(function (name, value) {
    if (name == "CatP") {
        led.toggleAll()
        bitCheckMask = 1
        for (let i = 0; i <= 16 - 1; i++) {
            if (bitCheckMask & value) {
                altOutPut = i + 48 +12
                // outPut = 15-i //add this to flip output!
                handleAltOutput()
            }
            bitCheckMask = bitCheckMask << 1
        }

    }
/*
    if (name == "MumP") {
        bitCheckMask = 1
        for (let i = 0; i <= 16 - 1; i++) {
            if (bitCheckMask & value) {
                outPut = i + 48
                // outPut = 15-i //add this to flip output!
                handleOutput()
            }
            bitCheckMask = bitCheckMask << 1
        }
    }

    if (name == "Mum") {
        outPut = value
        if (outPut != 0 && altOutPut < 127) {
            handleOutput()
        }
    }
*/
    if (name == "Cat") {
        altOutPut = value
        if (outPut != 0 && outPut < 127) {
            handleAltOutput()
        }
    }


    if (name == "m") {
        /*
        Bob 00000001
        Tim 00000010
        Ted 00000100
        Pat 00001000
        Cat 00010000
        Dad 00100000
        Mum 01000000
        Zim 10000000
        */
        if (value & 0b00010000) {
            led.plot(0, 4)
            catMuted = true
            //  basic.showIcon(IconNames.No, 0)
        } else if (catMuted) {
            catMuted = false
            //  basic.clearScreen()
        }

        if (value & 0b01000000) {
            mumMuted = true
            led.plot(4, 4)
            //   basic.showIcon(IconNames.No, 0)
        } else if (mumMuted) {
            mumMuted = false
            //   basic.clearScreen()
        }
    }


})

function handleNeoPixies() {
    for (let indeks = 0; indeks <= 2; indeks++) {
        perxles.setPixelColor(myNote + indeks, neopixel.colors(NeoPixelColors.Red))
        perxles.show()
    }
}

function sendMidi() {
    MIDIoffset = 48
    midiChannel.noteOn(myNote + MIDIoffset)
    // led.toggle(0, 0)
    midiChannel.noteOff(myNote + MIDIoffset)
}
input.onButtonPressed(Button.A, () => {
    noteOffset -= 12
    midiChannel = midi.channel(chan)
})

input.onButtonPressed(Button.B, () => {
    noteOffset += 12
    //midiChannel = midi.channel(chan)
})

function turnOffAllLeds() {
    perxles.clear()
    perxles.show()
}
function handleOutput() {
    if (!mumMuted) {
        led.plot(0, outPut % 5)
        led.plot(1, outPut % 5)
        led.plot(2, outPut % 5)
        led.plot(3, outPut % 5)
        led.plot(4, outPut % 5)
        myOnTimer = input.runningTime() + myOnTime
        myNote = outPut
        sendMonoMidiViaI2C(0)
    }
}

synthBlocks.importPresetString(SynthPreset.Sound1, "{ OscType::Pulse, OscType::Pulse, 0.192000, 0.500000, 0.552000, 0.000000, 0.000000, 0.300000, 0.300000, 0.000000, FilterType::LPF, 0.400000, 0.000000, 0.300000, 0.100000, 0.000000, 0.000000, 0.500000, 0.500000, 1.000000, OscType::Triangle, 3.220000, 13.560000, 0.184000, 0.500000, 0.000000, 0.000000, false }")
synthBlocks.playSynthNote(Note.C, 200, 127, SynthPreset.Sound1)

function handleAltOutput() {
    if (!catMuted) {
        led.plot(altOutPut % 5, 0)
        led.plot(altOutPut % 5, 1)
        led.plot(altOutPut % 5, 2)
        led.plot(altOutPut % 5, 3)
        led.plot(altOutPut % 5, 4)
        myOnTimer = input.runningTime() + myOnTime
        myNote = altOutPut;
        orchestra.setParameter(SynthPreset.Sound1, SynthParameter.EnvRelease, 0.3);
        orchestra.note(myNote, 100, 127, SynthPreset.Sound1)
        handleNeoPixies();


        //sendMonoMidiViaI2C(1)
    }
}

let bitCheckMask = 0
let myNote = 0
poly = false
let outPut = 0
let myPins: number[] = []
basic.showLeds(`
    . . . . .
    . # . . .
    . # # . .
    . # # # .
    . . . . .
    `)
basic.pause(500)
myOnTime = 15
myPins = [9, 15, 20, 21, 22, 23]
list = 0
radio.setGroup(83)
music.setTempo(200)
basic.forever(() => {
    if (input.runningTime() > myOnTimer) {
        if (!muted) {
            basic.clearScreen()
        } else {
            basic.showIcon(IconNames.No, 1)
        }

        led.plot(0, 0)
        // turnOffAllLeds()
        //for (let offIndex = 0; offIndex <= 6 - 1; offIndex++) {
        //    pins.digitalWritePin(myPins[offIndex], 0)
        //}
        anOutputIsOn = false

        

        
    }
    let tempParam = pins.map(input.acceleration(Dimension.X), -2048, 2048, 0, 1);
    orchestra.setParameter(SynthPreset.Sound1, SynthParameter.Cutoff, tempParam)
    orchestra.setParameter(SynthPreset.Sound1, SynthParameter.FilterEnvAmount, tempParam)
})

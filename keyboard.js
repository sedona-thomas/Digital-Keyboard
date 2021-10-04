/*
 * Sedona Thomas
 * keyboard.js: plays notes when letters are pressed
 */

document.addEventListener("DOMContentLoaded", function(event) 
{
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const keyboardFrequencyMap = 
    {
        '90': 261.625565300598634,  //Z - C
        '83': 277.182630976872096,  //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910,  //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398,  //G - F#
        '66': 391.995435981749294,  //B - G
        '72': 415.304697579945138,  //H - G#
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916,  //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192,  //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821,  //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797,  //5 - F#
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277,  //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832,  //7 - A#
        '85': 987.766602512248223,  //U - B
    }

    // for each note, the octave up is a less gray version of the color
    const frequencyColorMap = 
    {
        '90': '#444444',  //Z - C
        '83': '#444488',  //S - C#
        '88': '#4444CC',  //X - D
        '68': '#4488CC',  //D - D#
        '67': '#44CC44',  //C - E
        '86': '#44CCCC',  //V - F
        '71': '#88CCCC',  //G - F#
        '66': '#CC4444',  //B - G
        '72': '#CC4488',  //H - G#
        '78': '#CC44CC',  //N - A
        '74': '#CC88CC',  //J - A#
        '77': '#CCCCCC',  //M - B
        '81': '#000000',  //Q - C
        '50': '#000088',  //2 - C#
        '87': '#0000FF',  //W - D
        '51': '#0088FF',  //3 - D#
        '69': '#00FF00',  //E - E
        '82': '#00FFFF',  //R - F
        '53': '#88FFFF',  //5 - F#
        '84': '#FF0000',  //T - G
        '54': '#FF0088',  //6 - G#
        '89': '#FF00FF',  //Y - A
        '55': '#FF88FF',  //7 - A#
        '85': '#FFFFFF',  //U - B
    }

    const frequencyNoteMap = 
    {
        '90': 'C ',
        '83': 'C#',
        '88': 'D ',
        '68': 'D#',
        '67': 'E ',
        '86': 'F ',
        '71': 'F#',
        '66': 'G ',
        '72': 'G#',
        '78': 'A ',
        '74': 'A#',
        '77': 'B ',
        '81': 'C ',
        '50': 'C#',
        '87': 'D ',
        '51': 'D#',
        '69': 'E ',
        '82': 'F ',
        '53': 'F#',
        '84': 'G ',
        '54': 'G#',
        '89': 'A ',
        '55': 'A#',
        '85': 'B ',
    }
    

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup',   keyUp,   false);

    let activeOscillators = {}
    let activeGainNodes   = {}
    let waveform = 'sine';
    const blackKeys = ['83', '68', '71', '72', '74', '50', '51', '53', '54', '55'];
    
    // keyDown(): plays note of pressed key if not currently playing
    function keyDown(event) 
    {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) 
        {
            playNote(key);
            
            // change background color to most recent note
            document.body.style.background = frequencyColorMap[key];

            // highlight key of current note
            if (blackKeys.includes(key))
            {
                document.getElementById(key).style.backgroundColor = '#00FF00';
                document.getElementById("." + key).style.backgroundColor = '#00FF00';
            }
            else
            {
                document.getElementById(key).style.backgroundColor = '#FFFF00';
                document.getElementById("." + key).style.backgroundColor = '#FFFF00';
            }
        }
    }

    // keyUp(): stops note of pressed key when key is released
    function keyUp(event) 
    {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) 
        {
            // release
            activeGainNodes[key].gain.cancelScheduledValues(audioCtx.currentTime);
            activeGainNodes[key].gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
            activeOscillators[key].stop(audioCtx.currentTime + 0.05);
            
            // deletes current gain node and oscillator
            delete activeGainNodes[key]; 
            delete activeOscillators[key];
            
            // revert background and key to original color  
            document.getElementById(key).style.backgroundColor = '#FFFFFF';
            if (blackKeys.includes(key))
            {
                document.getElementById("." + key).style.backgroundColor = '#000000';
            }
            else
            {
                document.getElementById("." + key).style.backgroundColor = '#FFFFFF';
            }
        }
    }

    // playNote(): plays the note for the current keyboard key
    function playNote(key) 
    {
        // create gain node and initialize as 0
        const gainNode = audioCtx.createGain(); 
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

        // create oscillator and connect to gain node
        const osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);
        osc.type = waveform;
        osc.connect(gainNode).connect(audioCtx.destination);
        osc.start();
        
        // saves current gain node and oscillator
        activeGainNodes[key]   = gainNode;
        activeOscillators[key] = osc;  
 
        // attack (keeps total of gain nodes less than 1)
        let gainNodes = Object.keys(activeGainNodes).length;
        Object.keys(activeGainNodes).forEach(function(gainNodeKey) 
        {
            activeGainNodes[gainNodeKey].gain.setTargetAtTime(0.7 / gainNodes, audioCtx.currentTime, 0.1);
        });
        
        // decay then sustain
        gainNode.gain.setTargetAtTime(0.4 / gainNodes, audioCtx.currentTime, 0.1);

    }
    
    // buttons to switch between each waveform
    const sineButton = document.getElementById("sine");
    sineButton.addEventListener('click', function () { waveform = 'sine'; }, false);
    const sawtoothButton = document.getElementById("sawtooth");
    sawtoothButton.addEventListener('click', function () { waveform = 'sawtooth'; }, false);
    const squareButton = document.getElementById("square");
    squareButton.addEventListener('click', function () { waveform = 'square'; }, false);
    const triangleButton = document.getElementById("triangle");
    triangleButton.addEventListener('click', function () { waveform = 'triangle'; }, false); 
}, false);


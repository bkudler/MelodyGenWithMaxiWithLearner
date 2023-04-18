class MelodyGen{

   shouldCancel = false;
   continue = false;
   block = false;
   start = 0;
   end = 100;
   actions = [];
   melodies = [];
   uploadedFiles = {};
   form = {
    notes : [],
    temp : null,
    steps : null,
    chords : [],
    repeats : null,
    steps_per_quarter : null,
    betweenSequenceWait : null 
   };

   genNames = {
    "Temperature" : "temp",
    "Step Amount" : "steps",
    "Repeats" : "repeats",
    "Between Wait" : "betweenSequenceWait",
    "Steps Per Quarter Note" : "steps_per_quarter"
   };

   presets = [
    {display_name: 'Twinkle Twinkle'},
    {display_name: 'Satisfaction'},
    {display_name: 'Giant Steps'}
   ];


   chordNoteOpts = [
       "Ab",
       "A",
       "Bb",
       "B",
       "C",
       "Db",
       "D",
       "Eb",
       "E",
       "F",
       "Gb",
       "G",
   ];

   chordOpts = [
        "M",
        "M7",
        "maj9",
        "maj13",
        "M6",
        "M69",
        "M7b6",
        "maj7#11",
        "m",
        "m7",
        "m9",
        "mM9",
        "m11",
        "m13",
        "dim",
        "dim7",
        "m7b5",
        "7 dom",
        "9",
        "13",
        "7#11",
        "7b9",
        "7#9",
        "sus",
        "sus2",
        "7sus",
        "11",
        "7b9sus",
        "m#5",
        "maj7#5",
        "maj7#11",
   ];
   
    constructor(options){

        let origin = document.location.origin
        if(origin.includes("file"))
        {
          origin = "."
        }

        let head = document.getElementsByTagName('HEAD')[0];
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = origin + '/libs/MelodyGenStyle.css';
        head.appendChild(link);


        this.checkpoint = (options.checkpoint || 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
        this.temperature = (options.temperature || 0);
        this.input_amt = (options.input_amt || 0)
        let magenta = document.createElement('script');
        this.magenta = magenta;
        magenta.type = 'text/javascript';
        magenta.src = "https://cdn.jsdelivr.net/npm/@magenta/music@^1.0.0";
        magenta.async = true;
        document.getElementsByTagName('head')[0].appendChild(magenta);
        this.ready = new Promise((resolve, reject) => {
            this.magenta.onload = () => {
                this.magenta_rnn = new mm.MusicRNN(this.checkpoint);
                this.magenta_rnn.initialize().then(() => {
                    console.log("RNN LOADED");
                    resolve(this);
                })
            }
        })
    }

    addGui(id, chordAmount = 0){
        let parent = document.body;
        if(id){
            parent = document.getElementById(id);
        }
        this.mainContainer = document.createElement('div');
        this.mainContainer.id = "melody-gen-container";
        parent.appendChild(this.mainContainer);
        let cell;

        let label;
        this.noteContainer = document.createElement('div');
        this.noteContainer.classList.add('note-container');
        this.mainContainer.appendChild(this.noteContainer);
        this.mainContainer.classList.add('main-melody-gen')
        const noteTable = document.createElement('div');
        this.noteTable = noteTable;
        this.noteContainer.appendChild(noteTable);
        noteTable.classList.add('note-table')


        label = document.createElement('div');
        label.innerHTML = `Melodies`;
        noteTable.appendChild(label);

        const presetInput = document.createElement('select');
        this.presetInput = presetInput;
        presetInput.name = "Melodies";
        let option;
        option = document.createElement("option");
        option.setAttribute("value", "none");
        option.text = "Melodies";
        option.disabled = true;
        option.selected = true;
        option.hidden = true;
        presetInput.appendChild(option);


        for(let i = 0; i < this.presets.length; i++){
            option = document.createElement("option");
            option.setAttribute("value", this.presets[i].display_name);
            option.text = this.presets[i].display_name;
            presetInput.appendChild(option);
        }

        presetInput.onchange = (event) => {
            this.currPreset = event.target.value;
            this.setPreset(false);
        }

        cell = document.createElement("div");

        noteTable.appendChild(cell);
        cell.appendChild(presetInput);

        this.presetBtn = document.createElement("BUTTON");
        this.presetBtn.onclick = () => {
            this.setPreset("test");
        }

        this.presetBtn.innerHTML = "Test";
        
        cell.appendChild(this.presetBtn);

        /////

        this.uploadBtn = document.createElement("BUTTON");
        this.uploadBtn.onclick = () => {
            this.uploadInput.click();
        }

        this.uploadBtn.innerHTML = "Upload";
        
        cell.appendChild(this.uploadBtn);
        

        ////
        this.uploadInput = document.createElement('input');
        this.uploadInput.type = 'file';
        this.uploadInput.style.visibility = 'hidden';
        this.uploadInput.style.width = '1%';
        this.uploadInput.style.height = '1%';
        this.uploadInput.onchange = () => {
            this.uploadMidi();
        }; 
        
        cell.appendChild(this.uploadInput);
        

        ///

        cell = document.createElement('div');
        noteTable.appendChild(cell);

        label = document.createElement('div');
        label.innerHTML = `Start`;
        cell.appendChild(label);

        let start_slider = document.createElement('input');
        start_slider.type = 'range';
        start_slider.min = 0;
        start_slider.max = 100;
        start_slider.value = 0;
        start_slider.step = 1;

        start_slider.oninput = (event) => {
            this.start = +event.target.value;
        }

        start_slider.classList.add('midi-start-input-slider');
        cell.appendChild(start_slider);

        cell = document.createElement('div');
        noteTable.appendChild(cell);

        label = document.createElement('div');
        label.innerHTML = `End`;
        cell.appendChild(label);

        let end_slider = document.createElement('input');
        end_slider.type = 'range';
        end_slider.min = 0;
        end_slider.max = 100;
        end_slider.value = 100;
        end_slider.step = 1;

        end_slider.oninput = (event) => {
            this.end = +event.target.value;
        }

        start_slider.classList.add('midi-end-input-slider');
        cell.appendChild(end_slider);

        //
        
        const seqSetTable = document.createElement('div');
        this.seqSetTable = seqSetTable;
        this.noteContainer.appendChild(seqSetTable);
        this.seqSetTable.classList.add('seq-set-table')

        label = document.createElement('div');
        label.innerHTML = `Sequence Settings`;
        this.seqSetTable.appendChild(label);

        let genInput;
        let topWrapper = document.createElement('div');
        topWrapper.classList.add('top-wrapper-seq');
        this.seqSetTable.appendChild(topWrapper);

        let labelShow;

        ["Temperature", "Step Amount", "Repeats", "Steps Per Quarter Note"].map((header,i) => {
            cell = document.createElement('div');
            label = document.createElement('div');
            label.classList.add('seq-set-labels');
            if(header === "Steps Per Quarter Note") {
                labelShow = "Steps Per QN";
            } else if (header === "Repeats") {
                labelShow = "Seq Repeats"
            } else {
                labelShow = header;
            }
            label.innerHTML = labelShow;
            cell.appendChild(label);
            cell.classList.add('input-cell-seq');
            genInput = document.createElement('input');
            genInput.type = "text";

            genInput.oninput = (event) => {
                let form_name = this.genNames[header];
                this.form[form_name] = +event.target.value;
            }

            cell.appendChild(genInput);
            if(i == 2){
                topWrapper = document.createElement('div');
                topWrapper.classList.add('top-wrapper-seq');
                topWrapper.classList.add('top-wrapper-seq-bottom');
                this.seqSetTable.appendChild(topWrapper);
            }
            topWrapper.appendChild(cell);
        });

        const modTable = document.createElement('div');
        this.modTable = modTable;
        this.noteContainer.appendChild(modTable);
        this.modTable.classList.add('mod-table');

        this.innerModWrapper = document.createElement('div');
        this.innerModWrapper.classList.add('inner-mod-wrapper');

        label = document.createElement('div');
        label.innerHTML = `Modulation Settings`;
        this.modTable.appendChild(label);
        modTable.appendChild(this.innerModWrapper);

        cell = document.createElement('div');
        this.innerModWrapper.appendChild(cell);

        label = document.createElement('div');
        label.innerHTML = `Length`;
        cell.appendChild(label);

        let slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 100;
        slider.value = 100;
        slider.step = 10;

        slider.oninput = (event) => {
            this.length = +event.target.value;
        }

        slider.classList.add('inner-mod-wrapper-input-slider');
        cell.appendChild(slider);

        // ///////////////////////////////////////////////////////

        cell = document.createElement('div');
        this.innerModWrapper.appendChild(cell);

        label = document.createElement('div');
        label.innerHTML = `Variation`;
        cell.appendChild(label);

        slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 100;
        slider.value = 0;
        slider.step = 5;

        slider.oninput = (event) => {
            this.variation = +event.target.value;
        }
        slider.classList.add('inner-mod-wrapper-input-slider');
        cell.appendChild(slider);

        // //////////////////////////////////////////////////////////

        cell = document.createElement('div');
        this.innerModWrapper.appendChild(cell);

        label = document.createElement('div');
        label.innerHTML = `Head Variation`;
        cell.appendChild(label);

        slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 100;
        slider.value = 0;
        slider.step = 5;

        slider.oninput = (event) => {
            this.head_variation = +event.target.value;
        }
        slider.classList.add('inner-mod-wrapper-input-slider');
        cell.appendChild(slider);

        // //////////////////////////////////////////////////////////

        cell = document.createElement('div');
        this.innerModWrapper.appendChild(cell);

        label = document.createElement('div');
        label.innerHTML = `Tail Variation`;
        cell.appendChild(label);

        slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 100;
        slider.value = 0;
        slider.step = 5;

        slider.oninput = (event) => {
            this.tail_variation = +event.target.value;
        }

        slider.classList.add('inner-mod-wrapper-input-slider');
        cell.appendChild(slider);

        // //////////////////////////////////////////////////////////

        cell = document.createElement('div');
        this.innerModWrapper.appendChild(cell);

        label = document.createElement('div');
        label.innerHTML = `Wait Time`;
        cell.appendChild(label);

        let waitInput = document.createElement('input');
        waitInput.type = "text";
        waitInput.classList.add("inner-mod-wrapper-input");

        waitInput.oninput = (event) => {
            this.betweenSequenceWait = +event.target.value;
        }

        cell.appendChild(waitInput);

        this.selectorContainer = document.createElement('div');
        this.selectorContainer.classList.add('button-wrapper');
        this.mainContainer.appendChild(this.selectorContainer);

        this.cleanBtn = document.createElement("BUTTON");
        this.cleanBtn.onclick = (event) => {
            this.setPreset("playClean");
        }

        this.cleanBtn.innerHTML = "Play Clean";
        cell.appendChild(this.cleanBtn);
        this.selectorContainer.appendChild(this.cleanBtn);
        this.selectorContainer.classList.add('clean-button');

        this.startBtn = document.createElement("BUTTON");
        this.startBtn.onclick = (event) => {
            this.startSequence();
        }

        this.startBtn.innerHTML = "Generate";
        this.selectorContainer.appendChild(this.startBtn);

        this.cancelBtn = document.createElement("BUTTON");
        this.cancelBtn.onclick = (event) => {
            this.cancelSequence();
        }

        this.cancelBtn.innerHTML = "Cancel";
        this.selectorContainer.appendChild(this.cancelBtn);

        this.downloadBtn = document.createElement("BUTTON");
        this.downloadBtn.onclick = (event) => {
            this.downloadNotes();
        }

        this.downloadBtn.innerHTML = "Download";
        this.selectorContainer.appendChild(this.downloadBtn);

        if(this.checkpoint === 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv'){
            this.chordContainer = document.createElement('div');
            this.chordContainer.classList.add('chord-container')
            this.mainContainer.appendChild(this.chordContainer);

            for(let i = 0; i < chordAmount; i++){
                cell = document.createElement('div');
    
                this.form.chords[i] = "D";
    
                label = document.createElement('span');
                label.innerHTML = `Chord ${i + 1}`;
                cell.appendChild(label);

                const chordInput = document.createElement('select');
                presetInput.name = "Chords";

                let note;
                let chord;

                for(let j = 0; j < this.chordNoteOpts.length; j++){
                    note = this.chordNoteOpts[j];
                    for(let k = 0; k < this.chordOpts.length; k++){
                        chord = this.chordOpts[k];
                        option = document.createElement("option");
                        option.setAttribute("value", `${note}${chord}`);
                        option.text = `${note}${chord}`;
                        chordInput.appendChild(option);
                    }

                }
        
                chordInput.onchange = (event) => {
                    let chord = event.target.value;
                    this.form.chords[i] = chord;
                }
                cell.appendChild(chordInput);
                this.chordContainer.appendChild(cell);
            }
        }

    
    }

    weightedFlip(prob){
        return (Math.random() <= prob);
    }

    assignLength(notes){
        const length = Number.isNaN((+(this.length/100).toFixed(2))) ? 100 : (+(this.length/100).toFixed(2));
        const begAndEndAmount = (notes.length * 0.05)
        const origLength = notes.length;
        notes = notes.filter((note, i) => {
            return i < begAndEndAmount || i > (origLength - begAndEndAmount) || this.weightedFlip(length);
        })
        return notes;
    }

    assignVariation(notes){
        const variation = Number.isNaN((+(this.variation/100).toFixed(2))) ? 0 : (+(this.variation/100).toFixed(2));
        const begAndEndAmount = Math.ceil(notes.length * 0.05);
        let beg = notes.slice(0, begAndEndAmount);
        let temp, tempStart, tempEnd;
        let newIndex;
        let currentIndex = beg.length;
        const begin_variation = Number.isNaN((+(this.head_variation/100).toFixed(2))) ? 0 : (+(this.head_variation/100).toFixed(2));
        for(let i = 0; i < beg.length; i++){
            if(this.weightedFlip(begin_variation)){
                temp = beg[i];
                tempStart = beg[i].quantizedStartStep;
                tempEnd = beg[i].quantizedEndStep;

                newIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                beg[i].quantizedStartStep = beg[newIndex].quantizedStartStep;
                beg[i].quantizedEndStep = beg[newIndex].quantizedEndStep;
                beg[i] = beg[newIndex];

                beg[newIndex].quantizedStartStep = tempStart;
                beg[newIndex].quantizedEndStep = tempEnd;
                beg[newIndex] = temp;
            }
        }

        const end_variation = Number.isNaN((+(this.tail_variation/100).toFixed(2))) ? 0 : (+(this.tail_variation/100).toFixed(2));
        let end = notes.slice(notes.length - begAndEndAmount, notes.length);
        currentIndex = end.length;
        for(let i = 0; i < end.length; i++){
            if(this.weightedFlip(end_variation)){
                temp = end[i];
                tempStart = end[i].quantizedStartStep;
                tempEnd = end[i].quantizedEndStep;

                newIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                end[i].quantizedStartStep = end[newIndex].quantizedStartStep;
                end[i].quantizedEndStep = end[newIndex].quantizedEndStep;
                end[i] = end[newIndex];

                end[newIndex].quantizedStartStep = tempStart;
                end[newIndex].quantizedEndStep = tempEnd;
                end[newIndex] = temp;
            }
        }

        let middle = notes.slice(begAndEndAmount, notes.length - begAndEndAmount);

        const middleAmount = middle.length * variation;
        const middleNote = Math.floor(middle.length/2);
        currentIndex = middleNote + Math.floor(middleAmount/2);

        for(let i = (middleNote - Math.floor(middleAmount/2)); i < Math.floor(middleNote + (middleAmount/2)); i++){
            temp = middle[i];
            tempStart = middle[i].quantizedStartStep;
            tempEnd = middle[i].quantizedEndStep;

            newIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            middle[i].quantizedStartStep = middle[newIndex].quantizedStartStep;
            middle[i].quantizedEndStep = middle[newIndex].quantizedEndStep;
            middle[i] = middle[newIndex];

            middle[newIndex].quantizedStartStep = tempStart;
            middle[newIndex].quantizedEndStep = tempEnd;
            middle[newIndex] = temp;
        }
        return [...beg,...middle,...end];

    }

    uploadMidi(){
        const midiFile = this.uploadInput.files[0];
        mm.blobToNoteSequence(midiFile).then((sample) => {
            const option = document.createElement("option");
            const name = midiFile.name.split('.')[0];
            option.setAttribute("value", name);
            option.text = name;
            this.presetInput.appendChild(option);
            sample.timeSignatures[0].time = 0;
            sample.timeSignatures = [sample.timeSignatures[0]];
            sample.tempos[0].time = 0;
            sample.tempos = [sample.tempos[0]];
            this.uploadedFiles[name] = sample;
        })
    }

    setPreset(shouldPlay){
        if(this.currPreset === 'Twinkle Twinkle'){
            this.midi = './libs/melodygen-presets/twinkle_twinkle.mid'
        };

        if(this.currPreset === 'Satisfaction'){
            this.midi = './libs/melodygen-presets/Rolling_stones__satisfaction.mid'
        };

        if(this.currPreset === 'Giant Steps'){
            this.midi = './libs/melodygen-presets/JohnColtrane_GiantSteps-1_FINAL.mid'
        };

        if(this.uploadedFiles[this.currPreset] && !this.block){
            this.setItUp(structuredClone(this.uploadedFiles[this.currPreset]), shouldPlay);
        } else if(this.midi && !this.block){
            mm.urlToNoteSequence(this.midi).then((sample)=> {
                this.setItUp(sample, shouldPlay);
            });
        } else if(!this.midi) {
            alert("You Must Select A Preset Before Making Sound");
        } else if (this.block){
            console.log(`BLOCKING ON ${shouldPlay.toUpperCase && shouldPlay.toUpperCase() || shouldPlay}`);
            this.actions.pop();
            this.actions.push({function:'setPreset', arg:shouldPlay});
        }
    }

    setItUp(sample, shouldPlay){
        this.currSample = sample;
        this.cleanNotes = this.currSample.notes;
        this.currSample.notes = this.getCutNotes(this.currSample.notes);
        this.currSample.notes = this.getCorrectNoteTimes(this.currSample.notes);
        this.currSample.tempos = [this.currSample.tempos[0]];
        this.currSample.timeSignatures = [this.currSample.timeSignatures[0]];
        this.currSample = mm.sequences.quantizeNoteSequence(this.currSample, 32);
        instruments.setTempo(this.currSample.tempos[0].qpm);
        this.currSample.totalQuantizedSteps = this.getTotal(this.currSample, "totalQuantizedSteps");
        this.currSample.totalTime = this.getTotal(this.currSample, "totalTime") + (this.getTotal(this.currSample, "totalTime")*0.2);
        this.waitTime = this.currSample.totalTime*1000;
        this.currNotes = this.currSample.notes;
        this.lengthNotes =  this.currSample.notes;
        if(shouldPlay === "test"){
            this.test();
        } 
        if(shouldPlay === "playClean"){
            this.playClean();
        }
    }

    getCutNotes(notes){
        const start_pos = Math.round((this.start*0.01)*notes.length);
        const end_pos = Math.round((this.end*0.01)*notes.length);
        return notes.slice(start_pos, end_pos);
    }

    getCorrectNoteTimes(notes){
        const start = notes[0].startTime;
        const new_notes = [];
        let dist, new_note;
        for(let note of notes){
            new_note = structuredClone(note);
            dist = new_note.endTime - new_note.startTime;
            new_note.startTime = new_note.startTime - start;
            if(new_note.startTime < 0){new_note.startTime = 0}
            if(new_note.endTime < 0){new_note.endTime = 0}
            new_note.endTime = new_note.startTime + dist;
            
            new_notes.push(new_note);
        }
        return new_notes;
    }

    getTotal(sample, property){
        const notes = sample.notes;
        const start_pos = Math.round((this.start*0.01)*notes.length);
        const end_pos = Math.round((this.end*0.01)*notes.length);
        const total_notes = end_pos - start_pos;
        const percent = total_notes/notes.length;
        return sample[property] * percent;
    }

    async test(){
        this.block = true;
        this.synth.setSequence(this.currSample.notes);
        this.synth.setLoop(this.currSample.totalQuantizedSteps);
        const timer = ms => new Promise(res => setTimeout(res, ms));
        await timer(Math.ceil(this.waitTime));
        console.log("DONE TESTING");
        this.block = false;
        this.synth.setSequence(
            [
                {s:0, l:0, p:0}
            ]
        )
        if(this.actions.length > 0){
            const func = this.actions.pop();
            this[func.function](func.arg);
        }

    }

    playClean(){
        this.block = true;
        this.currNotes = this.currSample.notes;
        this.lengthNotes = this.currSample.notes;
        this.setNewBaseSeq();
        this.play();
    }

    setNewBaseSeq(){
        this.temp = this.form.temp || 1.5;
        this.steps = this.form.steps || 100;
        this.chords = (this.form.chords.length > 0 && this.form.chords) || ["CbmM7", "D7", "GmM7"];
        this.repeats = this.form.repeats > 0 && this.form.repeats || 1;
        this.steps_per_quarter = this.form.steps_per_quarter || 4;
    }

    startSequence(){
        if(!this.currPreset){
            alert("You Must Select A Preset Before Making Sound");
        }
        else if(this.block){
            console.log("BLOCKING ON GENERATE");
            this.actions.pop();
            this.actions.push({function:'startSequence'});
        } else {
            this.block = true;
            this.setNewBaseSeq();
            this.generateNewSequences();
        } 
    }

    cancelSequence(){
        this.shouldCancel = true;
    }

    downloadNotes(){
        const link = document.createElement("a");
        const melodies = this.melodies.map((melody) => {
            return melody.toJSON()
        });
        const file = new Blob([JSON.stringify(melodies)], { type: 'text/plain' });
        link.href = URL.createObjectURL(file);
        link.download = "melodies.txt";
        link.click();
        URL.revokeObjectURL(link.href);
    }



    generateNewSequences(){
        this.block = true;
        this.currSample.notes = this.currSample.notes.filter(note => note.pitch > 50 && note.pitch < 80);
        const qns = mm.sequences.quantizeNoteSequence(this.currSample, this.steps_per_quarter);
        this.shouldCancel = false;
        const useChords = this.checkpoint === 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv' ? this.chords : null; 
        this.magenta_rnn.continueSequence(qns, this.steps, this.temp, useChords)
        .then((sample) => {
            this.currSample = sample;
            this.currNotes = sample.notes;
            this.lengthNotes = sample.notes;
            this.currSample.tempos = [this.currSample.tempos[0]];
            this.currSample.totalTime = this.currSample.totalTime ? this.currSample.totalTime : ((this.currSample.totalQuantizedSteps/this.currSample.quantizationInfo.stepsPerQuarter)/this.currSample.tempos[0].qpm)*60;
            this.waitTime = this.currSample.totalTime*300;
            this.play();
        })
        .catch((e) => {
            console.log(e);
        })   
    }

    async play(){
        let useNotes;
        let lastLength;
        for(let i = 0; i < this.repeats; i++){
            const timer = ms => new Promise(res => setTimeout(res, ms))
            console.log(`STARTING ${i + 1} OF ${this.repeats} TOTAL LOOPS`);
            useNotes = this.currNotes;
            if(this.length !== lastLength){
                useNotes = this.assignLength(useNotes);
                this.lengthNotes = useNotes;
                lastLength = this.length;
            } else {
                useNotes = this.lengthNotes;
            }
            useNotes = this.assignVariation(useNotes);
            this.currSample.notes = useNotes;
            this.synth.setSequence(this.currSample.notes);
            this.synth.setLoop(this.currSample.totalQuantizedSteps);
            this.melodies = [...this.melodies, ...this.currSample.notes]
            await timer(Math.ceil(this.waitTime));
            console.log("DONE PLAYING");
            this.synth.setSequence(
                [
                    {s:0, l:0, p:0}
                ]
            )
            await timer(this.betweenSequenceWait*1000);
            // clearTimeout(betweenSequenceTimer);
            if(this.shouldCancel){
                break;
            }
        }
        this.block = false;
        if(this.actions.length > 0){
            const func = this.actions.pop();
            this[func.function](func.arg);
        }
    }

}
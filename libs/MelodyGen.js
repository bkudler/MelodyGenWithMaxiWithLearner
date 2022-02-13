class MelodyGen{

   currentlyPlaying = false;
   continue = false;
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
    {display_name: 'random'},
    {display_name: 'twinkle twinkle'},
    {display_name: 'coltrane changes in c'}
   ];

   presetValues = {
       'twinkle twinkle' : [
        {pitch: 60, startTime: 0.0, endTime: 0.5},
        {pitch: 60, startTime: 0.5, endTime: 1.0},
        {pitch: 67, startTime: 1.0, endTime: 1.5},
        {pitch: 67, startTime: 1.5, endTime: 2.0},
        {pitch: 69, startTime: 2.0, endTime: 2.5},
        {pitch: 69, startTime: 2.5, endTime: 3.0},
        {pitch: 67, startTime: 3.0, endTime: 4.0},
        {pitch: 65, startTime: 4.0, endTime: 4.5},
        {pitch: 65, startTime: 4.5, endTime: 5.0},
        {pitch: 64, startTime: 5.0, endTime: 5.5},
        {pitch: 64, startTime: 5.5, endTime: 6.0},
        {pitch: 62, startTime: 6.0, endTime: 6.5},
        {pitch: 62, startTime: 6.5, endTime: 7.0},
        {pitch: 60, startTime: 7.0, endTime: 8.0}, 
       ],
       'coltrane changes in c' : [
        {pitch: 50, startTime: 0.0, endTime: 0.25},
        {pitch: 53, startTime: 0.25, endTime: 0.375},
        {pitch: 57, startTime: 0.375, endTime: 0.5},
        {pitch: 60, startTime: 0.5, endTime: 0.625},
        {pitch: 51, startTime: 0.625, endTime: 0.75},
        {pitch: 55, startTime: 0.75, endTime: 0.875},
        {pitch: 58, startTime: 0.875, endTime: 1},
        {pitch: 61, startTime: 1, endTime: 2.0},
        {pitch: 57, startTime: 2.0, endTime: 2.125},
        {pitch: 60, startTime: 2.125, endTime: 2.25},
        {pitch: 63, startTime: 2.25, endTime: 2.375},
        {pitch: 67, startTime: 2.375, endTime: 2.5},
        {pitch: 59, startTime: 2.5, endTime: 2.75},
        {pitch: 63, startTime: 2.75, endTime: 2.875},
        {pitch: 66, startTime: 2.875, endTime: 3},
        {pitch: 69, startTime: 3, endTime: 3.125},
        {pitch: 52, startTime: 3.125, endTime: 3.25},
        {pitch: 56, startTime: 3.25, endTime: 3.375},
        {pitch: 59, startTime: 3.375, endTime: 3.5},
        {pitch: 64, startTime: 3.5, endTime: 3.625},
        {pitch: 55, startTime: 3.625, endTime: 3.75},
        {pitch: 59, startTime: 3.75, endTime: 3.875},
        {pitch: 62, startTime: 3.875, endTime: 4},
        {pitch: 65, startTime: 4, endTime: 4.125},
        {pitch: 60, startTime: 4.125, endTime: 5.125},
        {pitch: 64, startTime: 5.125, endTime: 5.25},
        {pitch: 67, startTime: 5.25, endTime: 5.5},
        {pitch: 71, startTime: 5.5, endTime: 5.75},   
       ]
   };

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
        link.href = origin + '/libs/MelodyGen.css';
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

    addGui(inputAmount, id, chordAmount = 0){
        let parent = document.body;
        if(id){
            parent = document.getElementById(id);
        }
        this.mainContainer = document.createElement('div');
        this.mainContainer.id = "melody-gen-container";
        parent.appendChild(this.mainContainer);
        let cell;
        this.inputAmount = inputAmount;
        for(let i = 0; i < inputAmount; i++){
            this.form.notes.push({
                pitch: 0,
                startTime: 0.0,
                endTime : 0.0
            });
        }

        let pitchInput;
        let lengthStartInput;
        let lengthEndInput;
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
        label.innerHTML = `Presets`;
        noteTable.appendChild(label);

        const presetInput = document.createElement('select');
        presetInput.name = "Presets";
        let option;
        option = document.createElement("option");
        option.setAttribute("value", "none");
        option.text = "Presets";
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
            if(event.target.value === "random"){
                this.randomBaseSeq();
            } else {
                this.setPreset();
            }
        }

        cell = document.createElement("div");

        noteTable.appendChild(cell);
        cell.appendChild(presetInput);

        this.presetBtn = document.createElement("BUTTON");
        this.presetBtn.onclick = () => {
            this.clickPreset();
        }

        this.presetBtn.innerHTML = "Set Preset";
        
        cell = document.createElement("div");

        noteTable.appendChild(cell);
        cell.appendChild(this.presetBtn);
        const noteSelectHolder = document.createElement('div');
        noteSelectHolder.classList.add('note-select-holder');
        noteTable.append(noteSelectHolder);
        this.mainLabel = document.createElement('div'); 
        this.mainLabel.classList.add('label-wrapper');

        let leftBtn = document.createElement('span');
        leftBtn.classList.add('side-btn'); 
        leftBtn.classList.add('side-btn-left'); 

        leftBtn.innerHTML = '<';
        leftBtn.onclick = (event) => {
            this.prev(event);
        }
        this.mainLabel.appendChild(leftBtn);

        let labelSpan = document.createElement('span');
        this.labelSpan = labelSpan;
        labelSpan.innerHTML = `Note 1`;
        this.mainLabel.appendChild(labelSpan);     

        let rightBtn = document.createElement('span');
        rightBtn.classList.add('side-btn'); 
        rightBtn.classList.add('side-btn-right'); 
        rightBtn.innerHTML = '>';
        rightBtn.onclick = (event) => {
            this.next(event);
        }
        this.mainLabel.appendChild(rightBtn);

        let labelCell = document.createElement('div');
        labelCell.classList.add('label-cell');
        let inputCell = document.createElement('div');
        inputCell.classList.add('input-cell');
        noteSelectHolder.appendChild(this.mainLabel);
        noteSelectHolder.appendChild(labelCell);
        noteSelectHolder.appendChild(inputCell);

        label = document.createElement('span');
        label.innerHTML = `Pitch`;
        labelCell.appendChild(label);

        label = document.createElement('span');
        label.innerHTML = `Start`;
        labelCell.appendChild(label);

        label = document.createElement('span');
        label.innerHTML = `End`;
        labelCell.appendChild(label);

        this.pitchPage = 0;

        for(let i = 0; i < inputAmount; i++){

            pitchInput = document.createElement('input');
            pitchInput.id = `pitch-input-${i}`
            pitchInput.type = "text";

            pitchInput.oninput = (event) => {
                let pitch = +event.target.value
                this.form.notes[i] = {...this.form.notes[i], pitch};
            }

            cell = document.createElement('span');
            cell.appendChild(pitchInput);
            cell.id = `pitch-span-${i}`;
            inputCell.appendChild(cell);

            lengthStartInput = document.createElement('input');
            lengthStartInput.id = `length-start-input-${i}`;
            lengthStartInput.type = "text";

            lengthStartInput.oninput = (event) => {
                let startTime = +event.target.value;
                this.form.notes[i] = {...this.form.notes[i], startTime};
            }

            cell = document.createElement('span');
            cell.appendChild(lengthStartInput);
            cell.id = `start-span-${i}`;
            inputCell.appendChild(cell);


            lengthEndInput = document.createElement('input');
            lengthEndInput.id = `length-end-input-${i}`;
            lengthEndInput.type = "text";

            lengthEndInput.oninput = (event) => {
                let endTime = +event.target.value
                this.form.notes[i] = {...this.form.notes[i], endTime};
            }

            cell = document.createElement('span');
            cell.appendChild(lengthEndInput);
            cell.id = `end-span-${i}`;
            inputCell.appendChild(cell);

        }

        this.hideElements();
        document.getElementById(`pitch-span-0`).style.display = "";
        document.getElementById(`start-span-0`).style.display = "";
        document.getElementById(`end-span-0`).style.display = "";

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


        this.genBtn = document.createElement("BUTTON");
        this.genBtn.onclick = () => {
            this.setNewBaseSeq();
        }

        this.genBtn.innerHTML = "Set Base";
        cell.appendChild(this.genBtn);
        this.selectorContainer.appendChild(this.genBtn);
        this.selectorContainer.classList.add('set-button');

        this.startBtn = document.createElement("BUTTON");
        this.startBtn.onclick = () => {
            this.startSequence();
        }

        this.startBtn.innerHTML = "Generate";
        this.selectorContainer.appendChild(this.startBtn);

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

    next(event){
        this.hideElements();
        if(this.pitchPage === (this.inputAmount - 1)){
            this.pitchPage = 0;   
        } else {
            this.pitchPage = this.pitchPage + 1;
        }
        this.labelSpan.innerHTML = `Note ${this.pitchPage + 1}`;
        document.getElementById(`pitch-span-${this.pitchPage}`).style.display = "";
        document.getElementById(`start-span-${this.pitchPage}`).style.display = "";
        document.getElementById(`end-span-${this.pitchPage}`).style.display = "";

    }


    prev(event){
        this.hideElements();
        if(this.pitchPage === 0){
            this.pitchPage = (this.inputAmount - 1);   
        } else {
            this.pitchPage = this.pitchPage - 1;
        }
        this.labelSpan.innerHTML = `Note ${this.pitchPage + 1}`;
        document.getElementById(`pitch-span-${this.pitchPage}`).style.display = "";
        document.getElementById(`start-span-${this.pitchPage}`).style.display = "";
        document.getElementById(`end-span-${this.pitchPage}`).style.display = "";
    }


    hideElements(){
        for(let i = 0; i < this.inputAmount; i++){
            document.getElementById(`pitch-span-${i}`).style.display = "none"
            document.getElementById(`start-span-${i}`).style.display = "none";
            document.getElementById(`end-span-${i}`).style.display = "none";
        }
    }

    clickPreset(){
        if(this.currPreset === 'random'){
            this.randomBaseSeq();
        } else {
            this.setPreset
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
    
        for(let i = 0; i < beg.length; i++){
            if(this.weightedFlip(variation + 0.1)){
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

        let end = notes.slice(notes.length - begAndEndAmount, notes.length);
        currentIndex = end.length;
        for(let i = 0; i < end.length; i++){
            if(this.weightedFlip(variation + 0.1)){
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

    setPreset(){
        let pitchInput;
        let lengthStartInput;
        let lengthEndInput;
        let pitch;
        let startTime = 0;
        let endTime = 0;
        const loopLength = this.inputAmount > this.presetValues[this.currPreset].length ? this.presetValues[this.currPreset].length : this.inputAmount;
        for(let i = 0; i < loopLength; i++){

            pitchInput = document.getElementById(`pitch-input-${i}`);
            pitchInput.value = this.presetValues[this.currPreset][i].pitch;
            pitch = pitchInput.value;
            this.form.notes[i] = {...this.form.notes[i], pitch};


            lengthStartInput = document.getElementById(`length-start-input-${i}`);
            lengthStartInput.value = this.presetValues[this.currPreset][i].startTime;
            startTime = +lengthStartInput.value;
            this.form.notes[i] = {...this.form.notes[i], startTime};

            lengthEndInput = document.getElementById(`length-end-input-${i}`);
            lengthEndInput.value = this.presetValues[this.currPreset][i].endTime;
            endTime = +lengthEndInput.value;
            this.form.notes[i] = {...this.form.notes[i], endTime};
        }
    }

    setNewBaseSeq(){
        this.notes = this.form.notes || [];
        this.notes = {notes: this.notes};
        this.notes.totalTime = this.notes.notes[this.notes.notes.length - 1].endTime;
        this.temp = this.form.temp || 1.5;
        this.steps = this.form.steps || 1;
        this.chords = (this.form.chords.length > 0 && this.form.chords) || ["CbmM7", "D7", "GmM7"];
        this.repeats = this.form.repeats || 1;
        this.steps_per_quarter = this.form.steps_per_quarter || 4;
    }

    startSequence(){
        if(this.currentlyPlaying){
            this.continue = true; 
        } else {
            this.generateNewSequences();
        } 
    }

    randomBaseSeq(){
        let pitchInput;
        let lengthStartInput;
        let lengthEndInput;
        let pitch;
        let startTime = 0;
        let endTime = 0;
        for(let i = 0; i < this.inputAmount; i++){
            pitchInput = document.getElementById(`pitch-input-${i}`);
            pitchInput.value = Math.floor(Math.random()*20 + 50);
            pitch = pitchInput.value;
            this.form.notes[i] = {...this.form.notes[i], pitch};


            lengthStartInput = document.getElementById(`length-start-input-${i}`);
            lengthStartInput.value = endTime;
            startTime = +lengthStartInput.value;
            this.form.notes[i] = {...this.form.notes[i], startTime};

            lengthEndInput = document.getElementById(`length-end-input-${i}`);
            lengthEndInput.value = (startTime + Math.round(Math.random() * 100) / 100).toFixed(2);
            endTime = +lengthEndInput.value;
            this.form.notes[i] = {...this.form.notes[i], endTime};
    
        }
    }

    setVelocities(sample){
        const notes = sample.notes.map((note) => {
            note.velocity = Math.floor((Math.random()*150) + 20);
            return note;
        })
        sample.notes = notes;
        return sample;
    }

    getLoopLength(notes){
        return notes[notes.length - 1].quantizedEndStep;
    }

    generateNewSequences(){
        const qns = mm.sequences.quantizeNoteSequence(this.notes, this.steps_per_quarter);
        this.currentlyPlaying = true;
        this.continue = false;
        const useChords = this.checkpoint === 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv' ? this.chords : null; 
        this.magenta_rnn.continueSequence(qns, this.steps, this.temp, useChords)
        .then((sample) => {
            const waitTime = (sample.totalQuantizedSteps/sample.quantizationInfo.stepsPerQuarter) * sample.tempos[0].qpm;
            const timer = ms => new Promise(res => setTimeout(res, ms))
            const repeats = this.repeats;
            const that = this;
            this.currSample = sample;
            this.currNotes = sample.notes;
            this.lengthNotes = sample.notes;
            async function play(){
                let useNotes;
                let lastLength;
                for(let i = 0; i < repeats; i++){
                    console.log(`STARTING ${i + 1} OF ${repeats} TOTAL LOOPS`);
                    useNotes = that.currNotes;
                    if(that.length !== lastLength){
                        useNotes = that.assignLength(useNotes);
                        that.lengthNotes = useNotes;
                        lastLength = that.length;
                    } else {
                        useNotes = that.lengthNotes;
                    }
                    useNotes = that.assignVariation(useNotes);
                    that.currSample.notes = useNotes;
                    that.currSample = that.setVelocities(that.currSample);
                    console.log("HELLLOOO", that.currSample.notes);
                    that.synth.setSequence(that.currSample.notes);
                    that.synth.setLoop(that.getLoopLength(that.currSample.notes));
                    const sequenceTimer = await timer(waitTime);
                    clearTimeout(sequenceTimer);
                    that.synth.setSequence(
                        [
                            {s:0, l:0, p:0}
                        ]
                    )
                    const betweenSequenceTimer = await timer(that.betweenSequenceWait*1000);
                    clearTimeout(betweenSequenceTimer);
                }
                that.currentlyPlaying = false;
                if(that.continue){
                    that.generateNewSequences();
                } else {
                    that.synth.setSequence(that.currSample.notes);
                    that.synth.setLoop(that.getLoopLength(that.currSample.notes));
                }
            }
            play();
        })
        .catch((e) => {
            console.log(e);
            this.currentlyPlaying = false;
            this.continue = false;
        })            

    }

}
# MelodyGen 

## In Short

MelodyGen bootstraps LearnerJS and MaxiInstrument from the MIMIC research project (more information below) and [Google's Magenta](https://magenta.tensorflow.org/). This project is directly built off of MIMIC platform developer, Louis Busby's, [project](https://github.com/Louismac/learnerjs). [The Melody Generator](https://github.com/bkudler/MelodyGen) uses Magenta's machine learning technology to generate sequences of notes based off of user input (presets are provided) that are then played by MaxiInstrument.

Scroll to the bottom for local development and for trying it out at home. 

## Usage

Press the button to start

  ![start button](https://raw.githubusercontent.com/bkudler/MelodyGenWithMaxiWithLearner/main/images/Screen%20Shot%202021-12-03%20at%2010.37.58%20AM.png)

The System

  ![the system](https://user-images.githubusercontent.com/16430294/213081835-a8c8987e-1cad-4aa8-94ea-c0f23f96a5e3.png)

Select A Preset

  ![twinkle](https://user-images.githubusercontent.com/16430294/213082258-9ec59409-f4da-455b-87fb-d407fab7c24a.png)

Scroll Through The Notes Using The Side Arrows If You Want To Alter The Preset Or Enter In Your Own Base Sequence

  ![filled in](https://user-images.githubusercontent.com/16430294/213082431-f54d0e14-1a10-4c36-a3be-73187341bea1.png)

* Temperature tells Google's Magenta how far from the original sequence it can diverge, values between 1 and 2 are best.
* Step amount is how long the sequence is.
* Seq repeats is how many times to loop the sequences magenta returns.
* Steps per qn is steps per quarter note, how many quarter notes should one step be, higher values, usually means faster, good values are 4 or 8.

  ![filled in](https://user-images.githubusercontent.com/16430294/213082431-f54d0e14-1a10-4c36-a3be-73187341bea1.png)

Once A Sequence Is Created From Magenta, MaxiSynth Will Begin Playing The Sequence Looped The Amount of Times Entered In The Seq Repeats Box. The Music Can Then Be Altered In Real Time.

* Length controls the length of the sequence. The further to the left the slider is the less notes are played. Notes are removed semi-randomly.
* Variation will change the order of the notes. The slider entirely to the left will mean no variation, the slider all the way to the right creates the maximum amount of variation. In order to keep the melody sounding familiar, this only varies the middle 90 percent of notes.
* The user can also vary the first five percent of notes to get really crazy. This slider works the same as the variation slider, except on the aforementioned note set.
* The user can also vary the last five percent of notes. This slider works the same as the variation slider, except on the aforementioned note set.

  ![modulation](https://user-images.githubusercontent.com/16430294/213518173-3957d75e-07cd-490c-9b90-6e3a07bd7cbe.png)

The Control Panel At The Bottom Allows Manipulations Of The Sequence of Melodies. 
* Generate uses Magenta to generate a new sequence of notes
* Cancel will stop the looping of the sequence and allow the user to generate a new sequence
* Stop will stop looping and stop all sound, everything is over!
* Download, will download a text file with the current composition you have created, in case you ever want to use it again!

![control panel](https://user-images.githubusercontent.com/16430294/213083196-69e78a39-1f80-4b95-b3eb-7d4821778b5f.png)

## The MIMIC Instruments Used For Demonstration Purposes

### Learner JS

Home of Learner.js and MaxiInstruments.js

Learner.js and MaxiInstruments.js are two libraries built as part of the [MIMIC
research project](https://mimicproject.com). Here we host the source and gives instructions
for using the libraries locally, or in other projects away from the main MIMIC site.

Learner.js provides an interface that allows you to easily record in examples of input and output pairings into a dataset that is saved locally in your browser.

You can then train a model to respond with new outputs when you provide new inputs.

We take care of all the storage, threading and GUI needs and all you have to do is pick what you want to control is what!

You can [follow the guide](https://mimicproject.com/guides/learner) on the MIMIC site to learn more about the library

Or you can [look at the API documentation](https://www.doc.gold.ac.uk/~lmcca002/Learner.html).

### Check The Demo Video (Included In The Top Level Of This Project) For More!

### MaxiInstruments.js

For a number of reasons, currently, MaxiInstruments will **performs best in Chrome**!. It does work in Firefox, although if you are pushing limits computationally, you can get some artifacts.

MaxiInstruments is a class of simple synths and samplers that are designed so that their parameters can be easily controlled using the Learner.js library.

They are AudioWorklets backed so they do not get interrupted by beefy feature extractors, one might use an an input or the running of a model to do the mapping.

You can [follow the guide](https://mimicproject.com/guides/maxi-instrument) on the MIMIC site to learn more about the library

Or you can [look at the API documentation](https://www.doc.gold.ac.uk/~lmcca002/MaxiInstrument.html).

## Running Locally

To run on your local machine you will first need to serve some files. The recommended way to do this is to use the python server we have provided (server.py). This is because we have to set some headers when serving the files to use SharedArrayBuffers, and this is what makes MaxiInstruments run smooooooth.

Then when **in the project folder in the terminal** run the command below.

```
python server.py
```

This serves the files in the folder at http://localhost:8000 and adds a header to get around CORS issues.

Then all you need to do is visit http://localhost:8000 to see the demo running

Remember, currently, **MaxiInstruments will only work in Chrome**!


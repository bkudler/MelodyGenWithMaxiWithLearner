# MelodyGen 

MelodyGen bootstraps LearnerJS and MaxiInstrument from the MIMIC research project (more information below) and [Google's Magenta](https://magenta.tensorflow.org/). This project is directly bootstrapped off of MIMIC platform developer, Louis Busby's, [project](https://github.com/Louismac/learnerjs). The Melody Generator uses Magenta's machine learning technology to generate sequences based off of user input (presets are provided) that are then played by MaxiInstrument.

Scroll to the bottom for local development and for trying it out at home. 

# In The Demo

Press the button to start

![start button](https://raw.githubusercontent.com/bkudler/MelodyGenWithMaxiWithLearner/main/images/Screen%20Shot%202021-12-03%20at%2010.37.58%20AM.png)

The System

![the system](https://raw.githubusercontent.com/bkudler/MelodyGenWithMaxiWithLearner/main/images/Screen%20Shot%202021-12-03%20at%2010.21.34%20AM.png)

Select A Preset

![twinkle](https://raw.githubusercontent.com/bkudler/MelodyGenWithMaxiWithLearner/main/images/Screen%20Shot%202021-12-03%20at%2010.21.11%20AM.png)

Scroll Through The Notes Using The Side Arrows If You Want To Alter The Preset Or Enter In Your Own Base Seqeunce

Fill In The Blanks...

![filled in](https://github.com/bkudler/MelodyGenWithMaxiWithLearner/blob/main/images/Screen%20Shot%202021-12-03%20at%2010.22.04%20AM.png)


# Learner JS

Home of Learner.js and MaxiInstruments.js

Learner.js and MaxiInstruments.js are two libraries built as part of the [MIMIC
research project](https://mimicproject.com). Here we host the source and gives instructions
for using the libraries locally, or in other projects away from the main MIMIC site.

Learner.js provides an interface that allows you to easily record in examples of input and output pairings into a dataset that is saved locally in your browser.

You can then train a model to respond with new outputs when you provide new inputs.

We take care of all the storage, threading and GUI needs and all you have to do is pick what you want to control is what!

You can [follow the guide](https://mimicproject.com/guides/learner) on the MIMIC site to learn more about the library

Or you can [look at the API documentation](https://www.doc.gold.ac.uk/~lmcca002/Learner.html).

## MaxiInstruments.js

For a number of reasons, currently, MaxiInstruments will **performs best in Chrome**!. It does work in Firefox, although if you are pushing limits computationally, you can get some artefacts.

MaxiInstruments is a class of simple synths and samplers that are designed to so that their parameters can be easily controlled using the Learner.js library.

They are AudioWorklets backed so do not get interrupted by beefy feature extractors one might use an an input or the running of a model to do the mapping.

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


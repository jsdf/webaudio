
webaudio
========

audio is played by connecting nodes, including source, effect and destinations
audio context must be started by a click
audio elements can be connected to audio nodes including context output

built in nodes are limited and implemented by browser vendors. custom audio
processing was originally provided by ScriptProcessorNode, but that runs in the 
main thread, which is bad. now instead we have AudioWorklet, which runs in its
own thread, so it is not affected by main thread work.

audioworklet
===========

in main thread, create an AudioWorkletNode, connect like other nodes
in worklet thread, create a AudioWorkletProcessor
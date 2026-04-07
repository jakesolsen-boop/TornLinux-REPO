# Research Notes

Key product direction carried forward from prior work:

- TornStats should stay in-app rather than navigate away
- the most useful stats are combat, activity, resource use, and wealth
- nerve should read as a crime resource, not a brain/neuron concept
- generic icons should stay neutral unless color carries gameplay meaning
- energy, happiness, nerve, and life should use distinct semantic colors
- the header should expose one compact combat readout, not a full stat panel

Build-layer note:
- this project is not just a renderer app
- any merge must respect the package/live-build pipeline and Electron preload
  bridge already present in `TornLinux-1.5.2-TEST-BuILD`

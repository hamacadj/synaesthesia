import Tone from "tone";
import * as scales from "./scales";
import * as parts from "./parts";
import instruments from "./instruments";
import * as rythyms from "./rythyms";
import * as utils from "../utils";

export const play = () => {
  const keyType = scales.getRandomScaleType();
  const songKey = {
    root: scales.getRandomRootNote(),
    type: keyType.intervals,
    typeName: keyType.type,
    chordOctave: utils.randomIntBetween(2, 3)
  };

  const progressionIntervals = utils.randomFromArray(scales.chordProgressions);
  const chordTypesToUseInProgression = scales.getRandomChordTypesForProgression(progressionIntervals);
  const chordProgression = scales.getChordProgressionForKey(songKey, progressionIntervals, chordTypesToUseInProgression);
  const possibleChordSectionLengths = [1, 2, 4, 8];
  const chordProgressionBars = utils.randomFromArray(possibleChordSectionLengths);
  const possibleChordPads = [instruments.pads.SimpleSine, instruments.pads.SwirlySawtoothChorusWithSubBass, instruments.pads.SoftSquareFm];
  const possibleBassInstruments = [instruments.bass.FastAttackSquare];
  const kickRythym = rythyms.randomKickRythym();
  const hihatRythym = rythyms.randomHiHatRythym();
  const shakerRythym = rythyms.randomShakerRythym();
  const openHatRythym = rythyms.randomOpenHatRythym();

  const bassLinePatterns = [];
  for (let i = 0; i < chordProgression.length; i++) {
    bassLinePatterns.push(rythyms.randomBassRythym());
  }
  //const melodyPattern = [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0];
  const chordInstrument = new (utils.randomFromArray(possibleChordPads))();
  const bassInstrument = new (utils.randomFromArray(possibleBassInstruments))();
  const openHatFrequency = Tone.Frequency(songKey.root + "3").toFrequency();

  const generatedSettings = {
    key: `${songKey.root} (${songKey.typeName})`,
    chordOctave: songKey.chordOctave,
    chordProgression: progressionIntervals,
    chordProgressionBars: chordProgressionBars,
    chordTypesToUseInProgression: chordTypesToUseInProgression,
    chordProgressionNotes: scales.rootNotesFromChordProgression(chordProgression),
    kickRythym: kickRythym,
    hihatRythym: hihatRythym,
    bassLinePatterns: bassLinePatterns,
    chordInstrument: chordInstrument.constructor.name,
    bassInstrument: bassInstrument.constructor.name
  };

  parts.addDrums("0:0:0", songKey.root + "0", new instruments.drums.KickDrum(), kickRythym, 1, true);
  parts.addDrums("0:0:0", undefined, new instruments.drums.HiHat(), hihatRythym, 0.9, true);
  parts.addDrums("0:0:0", undefined, new instruments.drums.Shaker(), shakerRythym, 0.8, true);
  parts.addDrums("0:0:0", undefined, new instruments.drums.OpenHat(openHatFrequency), openHatRythym, 0.8, true);

  parts.addChordProgression("0:0:0", chordProgression, chordInstrument, `${chordProgressionBars}m`, `${chordProgressionBars}m`, true);

  const notesPerChord = [];
  for (const bassLinePattern of bassLinePatterns) {
    notesPerChord.push(bassLinePattern.filter(hit => hit === 1).length);
  }
  const bassOctave = songKey.chordOctave - 1;

  parts.addRepeatingSoloPart(
    "0:0:0",
    scales.bassLineForChordProgression(notesPerChord, chordProgression, songKey, bassOctave),
    bassInstrument,
    "4n",
    bassLinePatterns,
    chordProgressionBars,
    true
  );

  return generatedSettings;
};

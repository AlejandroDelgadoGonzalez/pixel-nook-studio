import {Soundtrack} from './soundtrack.js';
import {FileSoundtrack} from './file-soundtrack.js';
// Existing approved stories retain their legacy soundtrack. New file-based
// stories never fall back to procedural synthesis when a file is unavailable.
export const createSoundtrack=(story,options={})=>story.fileAudio?new FileSoundtrack(story.fileAudio,{chapter:story.availableChapter,...options}):new Soundtrack();

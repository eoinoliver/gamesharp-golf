import test from 'node:test';
import assert from 'node:assert/strict';
import {readPreferences,PREFERENCES_KEY} from '../next/src/preferences.js';
import {distanceText,landingPayoff} from '../next/src/teaching-payoff.js';
import {NEW_LESSONS} from '../next/src/academy-content.js';
import {demoFor} from '../next/src/academy-visual.js';
// Preferences do not reset learning and survive absent, corrupt or blocked storage.
test('shared preferences safely migrate only an existing sound preference',()=>{
 const data=new Map([['gamesharp-golf-next-v2',JSON.stringify({sound:true,firstAttempts:{x:'preserve'}})]]);const storage={getItem:key=>data.get(key)};
 assert.deepEqual(readPreferences(storage),{version:1,sound:true,instantText:false});
 data.set(PREFERENCES_KEY,JSON.stringify({version:1,sound:false,instantText:true}));assert.deepEqual(readPreferences(storage),{version:1,sound:false,instantText:true});
 assert.equal(data.size,2);assert.equal(readPreferences({getItem(){throw Error('blocked');}}).sound,false);data.set(PREFERENCES_KEY,'invalid');assert.equal(readPreferences(storage).instantText,false);
});
test('putt and chip payoff keeps carry, roll and distance remaining distinct',()=>{
 assert.equal(distanceText(.3),'30 cm');assert.equal(distanceText(2.44),'2.4 m');
 const l=NEW_LESSONS.find(l=>l.id==='landing-not-hole'),q=l.questions[0];
 assert.match(landingPayoff(q,demoFor(q,0)).body,/4.0 m through the air, then 8.0 m/);
 assert.equal(landingPayoff(q,demoFor(q,1)).title,'4.0 m left to the hole.');
 const bunker=NEW_LESSONS.find(l=>l.id==='carry-the-trouble').questions[0];assert.match(landingPayoff(bunker,demoFor(bunker,0)).title,/sand/);
 assert.equal(landingPayoff({visual:{type:'putt',target:6}},{end:6,side:1}).title,'1.0 m left to the hole.');
 assert.equal(landingPayoff({visual:{type:'flight'}},{face:3,path:6}),null);
});

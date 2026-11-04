/** Run against npm run dev. Supply PLAYWRIGHT_MODULE when using a bundled runtime. */
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.RIG_URL||'http://127.0.0.1:5174/?lesson=shot-lab');await page.waitForFunction(()=>window.__labScene);
 const metrics=await page.evaluate(async()=>{
  const {BALL_CONTACT_LOCAL,FACE_NORMAL_LOCAL}=await import('/src/motion/club.js');const {LESSON,MOTION}=await import('/src/shot-lab-model.js');
  const s=window.__labScene,originalRender=s.renderer.render;s.renderer.render=()=>{};
  const result={frames:0,maxUpperError:0,maxForearmError:0,maxFingerRadiusError:0,maxClubStepDegrees:0,contact:[]};
  try{for(const c of LESSON.cases){s.setCase(c);s.setRevealed(true);let previous;
   for(let frame=MOTION.start;frame<=MOTION.end;frame++){
    s.seek((frame-MOTION.start)/MOTION.fps);s.club.updateMatrixWorld(true);const g=s.golfer;
    for(const side of ['l','r']){
     result.maxUpperError=Math.max(result.maxUpperError,Math.abs(g.joints[side+'clavicle'].distanceTo(g.elbows[side])-.30));
     result.maxForearmError=Math.max(result.maxForearmError,Math.abs(g.wrists[side].distanceTo(g.elbows[side])-.30));
     for(const finger of ['index','middle','ring','pinky']){
      const point=g.bones[`${finger}_04_leaf_${side}`].getWorldPosition(g.grip.clone()).sub(g.grip);point.addScaledVector(g.direction,-point.dot(g.direction));
      result.maxFingerRadiusError=Math.max(result.maxFingerRadiusError,Math.abs(point.length()-.023));
     }
    }
    if(previous)result.maxClubStepDegrees=Math.max(result.maxClubStepDegrees,previous.angleTo(s.club.quaternion)*180/Math.PI);previous=s.club.quaternion.clone();
    if(frame===MOTION.impact){const contact=BALL_CONTACT_LOCAL.clone().applyQuaternion(s.club.quaternion).add(s.club.position),normal=FACE_NORMAL_LOCAL.clone().applyQuaternion(s.club.quaternion);result.contact.push({case:c.id,error:contact.distanceTo(s.ballOrigin),faceDegrees:Math.atan2(normal.z,normal.x)*180/Math.PI,expectedFace:c.face});}
    result.frames++;
   }
  }}finally{s.renderer.render=originalRender;}
  return result;
 });
 console.log(JSON.stringify(metrics,null,2));
 assert.equal(metrics.frames,626);assert.ok(metrics.maxUpperError<1e-6);assert.ok(metrics.maxForearmError<1e-6);assert.ok(metrics.maxFingerRadiusError<.004,'Finger joints have left the grip cylinder');assert.ok(metrics.maxClubStepDegrees<25,'Club orientation snapped between capture frames');
 for(const c of metrics.contact){assert.ok(c.error<.0001,'Centre contact drifted away from the ball');assert.ok(Math.abs(c.faceDegrees-c.expectedFace)<.001,'Rendered face direction differs from the lesson');}
 assert.deepEqual(errors,[]);console.log('All rig constraints passed.');
}finally{await browser.close();}

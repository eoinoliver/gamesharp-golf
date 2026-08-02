import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');

assert(/function gsPrepareHomeHero\(\)[\s\S]{0,400}home\.dataset\.heroStable = 'true'/.test(html),'home hero must resolve to a stable presentation');
assert(!/gsHomeHeroTimer = window\.setTimeout\(gsCollapseHomeHero/.test(html),'home must not collapse on a timer');
assert(!/addEventListener\('(pointerdown|scroll|touchmove)', gsCollapseHomeHero/.test(html),'touch and scroll must not move the home layout');
assert(!/#view-home \.home-hero,[\s\S]{0,120}transition:(max-height|height|margin|padding)/.test(html),'home must not animate layout dimensions');
assert.equal((html.match(/<button class="home-play"/g)||[]).length,1,'home must expose one direct secondary play choice');
assert(!/<button class="mode-card"/.test(html),'legacy competing home mode cards remain');
assert(/<details class="home-more">[\s\S]{0,400}PLAY A COURSE[\s\S]{0,400}PLAY A 3-HOLE DECISION RUN[\s\S]{0,300}PLAY A 9-HOLE DECISION RUN/.test(html),'secondary play formats must use progressive disclosure');
assert(/#view-home \{[^}]*touch-action:pan-y[^}]*overflow-anchor:none/.test(html),'home mobile scrolling contract missing');
assert(/#view-home \{[^}]*background:[^}]*scroll[^}]*overflow-y:scroll/.test(html),'home must use an iPhone-safe scrolling background and explicit scroll container');
assert(/#view-home > \* \{ flex-shrink:0; \}/.test(html),'home sections must not shrink until the page has no scrollable distance');
assert(/#app \{[^}]*height:100dvh[^}]*min-height:0/.test(html)&&/\.view \{[^}]*height:100dvh[^}]*min-height:0/.test(html),'app shell lacks a dynamic mobile viewport scroll contract');
assert(!/function open\(from\)[\s\S]{0,400}document\.body\.style\.overflow='hidden'/.test(html),'Sharpen must not mutate the body scroll lock ad hoc');
assert.equal((html.match(/<button class="nav-item/g)||[]).length,9,'all bottom navigation controls must be semantic buttons');
assert(!/<div class="nav-item/.test(html),'inaccessible bottom navigation implementation remains');
assert(/if\(active&&active\.classList\.contains\('active'\)\)\{viewScroll\[id\]=0;active\.scrollTop=0;return\}/.test(html),'reselecting a tab must return it to the top');
assert(/id="profile-btn"[^>]*aria-label="Open progress and profile"/.test(html),'profile control lacks an accessible name');
assert(/@media\(prefers-reduced-motion:reduce\)/.test(html),'reduced-motion contract missing');
assert(/@media\(orientation:landscape\) and \(max-height:500px\)[\s\S]{0,500}#view-home \.home-hero\{height:72px/.test(html),'landscape home compaction missing');

console.log(JSON.stringify({ok:true,homePrimaryActions:2,playChoices:1,secondaryPlayFormats:3,semanticNavButtons:9},null,2));

// Rendu « HD » : occlusion ambiante (GTAO : ombrage de contact dans les angles, sous et entre les meubles) + anticrénelage MSAA,
// dans une chaîne de post-traitement. Désactivé en vue plan 2D et sur les petits écrans (sauf choix contraire de l'utilisateur).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

let C = null;   // { composer, render, gtao, w, h }
const KEY = 'cfg3d-hd';
const small = () => Math.min(screen.width, screen.height) < 700;
export function hdWanted() { try { const v = localStorage.getItem(KEY); if (v != null) return v === '1'; } catch (e) { /* stockage indisponible */ } return !small(); }
export function setHdWanted(on) { try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) { /* ignore */ } }

// skip(o) : objets à exclure du calcul d'occlusion (aides d'édition, objets transparents)
function create(renderer, scene, cam, skip) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  const render = new RenderPass(scene, cam);
  const gtao = new GTAOPass(scene, cam, size.x, size.y, {}, { radius: 0.35, distanceExponent: 1.4, thickness: 1.2, scale: 1.15, samples: 16, distanceFallOff: 1 }, { radius: 8, samples: 16 });
  gtao.blendIntensity = 0.85;
  // le mélange d'origine multiplie aussi l'alpha : sur un canevas transparent (vue publiée) l'image deviendrait translucide et délavée
  gtao.blendMaterial.blendSrcAlpha = THREE.ZeroFactor; gtao.blendMaterial.blendDstAlpha = THREE.OneFactor;
  // le verre, le fantôme de pose, la sélection… ne doivent pas assombrir ce qui est derrière eux
  const ov = gtao.overrideVisibility.bind(gtao);
  gtao.overrideVisibility = () => { ov(); scene.traverse((o) => { if (o.visible && skip(o)) o.visible = false; }); };
  composer.setPixelRatio(1); composer.setSize(size.x, size.y);
  // halo autour des sources lumineuses (lampes, écrans) : seules les valeurs très lumineuses (> seuil, avant exposition) rayonnent
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.32, 0.22, 0.95); bloom.enabled = false;
  // le flou du halo écrit une opacité de 1 partout : en mélange additif le fond transparent de la vue publiée devenait noir opaque la nuit.
  // On ajoute la lumière du halo (couleur) sans toucher à l'opacité de l'image.
  const bm = bloom.blendMaterial; bm.blending = THREE.CustomBlending; bm.blendEquation = THREE.AddEquation;
  bm.blendSrc = THREE.SrcAlphaFactor; bm.blendDst = THREE.OneFactor; bm.blendSrcAlpha = THREE.ZeroFactor; bm.blendDstAlpha = THREE.OneFactor;
  // léger contraste en sortie (après le passage en sRGB) : les ombres un peu plus profondes, les lumières un peu plus franches ; l'opacité n'est pas touchée
  const contrast = new ShaderPass({ uniforms: { tDiffuse: { value: null }, k: { value: 1.07 } }, vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D tDiffuse; uniform float k; varying vec2 vUv; void main() { vec4 c = texture2D(tDiffuse, vUv); gl_FragColor = vec4(clamp((c.rgb - 0.5) * k + 0.5, 0.0, 1.0), c.a); }' });
  composer.addPass(render); composer.addPass(gtao); composer.addPass(bloom); composer.addPass(new OutputPass()); composer.addPass(contrast);
  return { composer, render, gtao, bloom, w: size.x, h: size.y };
}

// rend la scène : chaîne HD si active, sinon rendu direct ; renvoie true si la chaîne HD a été utilisée
export function renderHD(renderer, scene, cam, on, skip, glow = false) {
  if (!on) { renderer.render(scene, cam); return false; }
  if (!C) C = create(renderer, scene, cam, skip);
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  if (size.x !== C.w || size.y !== C.h) { C.composer.setPixelRatio(1); C.composer.setSize(size.x, size.y); C.gtao.setSize(size.x, size.y); C.bloom.setSize(size.x / 2, size.y / 2); C.w = size.x; C.h = size.y; }
  if (C.render.camera !== cam) {   // passage perspective ↔ orthographique
    C.render.camera = cam; C.gtao.camera = cam;
    C.gtao.gtaoMaterial.defines.PERSPECTIVE_CAMERA = cam.isPerspectiveCamera ? 1 : 0; C.gtao.gtaoMaterial.needsUpdate = true;
  }
  C.bloom.enabled = glow;
  C.composer.render();
  return true;
}

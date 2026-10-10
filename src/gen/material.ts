/**
 * One toon shader for every creature part. Three bands of light, a rim
 * light so creatures pop against any background, and an emissive term for
 * glands and antenna tips. Chemistry picks the look: chalky, chitin, glow.
 */
import { Color, DoubleSide, ShaderMaterial, Vector3 } from 'three';

export type Finish = 'chalky' | 'chitin' | 'glow';

export interface ToonOptions {
  color: string | number | Color;
  finish?: Finish;
  emissive?: string | number | Color;
  emissiveStrength?: number;
  /** Use the per vertex `part` attribute to pick from `partColors`. */
  partColors?: Color[];
}

const vertex = /* glsl */ `
  attribute float part;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vPart;
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    vPart = part;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uPartColors[6];
  uniform float uUseParts;
  uniform vec3 uLightDir;
  uniform vec3 uLightColor;
  uniform vec3 uSkyColor;
  uniform vec3 uGroundColor;
  uniform vec3 uRimColor;
  uniform float uRimStrength;
  uniform float uSpecular;
  uniform vec3 uEmissive;
  uniform float uEmissiveStrength;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vPart;
  varying vec3 vWorld;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    vec3 base = uColor;
    if (uUseParts > 0.5) {
      int p = int(clamp(vPart + 0.5, 0.0, 5.0));
      base = uPartColors[p];
    }
    float ndl = dot(n, normalize(uLightDir));
    // Three soft bands.
    float band = smoothstep(-0.05, 0.05, ndl) * 0.55 + smoothstep(0.35, 0.45, ndl) * 0.3 + smoothstep(0.75, 0.85, ndl) * 0.15;
    vec3 hemi = mix(uGroundColor, uSkyColor, n.y * 0.5 + 0.5);
    vec3 lit = base * (hemi * 0.42 + uLightColor * band * 0.6);
    // Small toon highlight.
    vec3 h = normalize(normalize(uLightDir) + v);
    float spec = smoothstep(0.86, 0.9, dot(n, h)) * uSpecular;
    lit += uLightColor * spec;
    // Rim.
    float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0) * uRimStrength;
    lit += uRimColor * rim * (0.4 + 0.6 * band);
    lit += uEmissive * uEmissiveStrength;
    gl_FragColor = vec4(lit, 1.0);
    #include <colorspace_fragment>
  }
`;

export const lightDir = new Vector3(0.55, 0.9, 0.5).normalize();

export function toonMaterial(opts: ToonOptions): ShaderMaterial {
  const finish = opts.finish ?? 'chitin';
  const partColors = opts.partColors ?? [];
  const padded: Color[] = [];
  for (let i = 0; i < 6; i++) padded.push(partColors[i] ?? partColors[partColors.length - 1] ?? new Color(opts.color));
  const specular = finish === 'chalky' ? 0.05 : finish === 'glow' ? 0.1 : 0.35;
  const mat = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uColor: { value: new Color(opts.color) },
      uPartColors: { value: padded },
      uUseParts: { value: partColors.length > 0 ? 1 : 0 },
      uLightDir: { value: lightDir.clone() },
      uLightColor: { value: new Color('#fff4e0') },
      uSkyColor: { value: new Color('#dfe9f3') },
      uGroundColor: { value: new Color('#8d7f70') },
      uRimColor: { value: new Color('#ffffff') },
      uRimStrength: { value: 0.3 },
      uSpecular: { value: specular },
      uEmissive: { value: new Color(opts.emissive ?? 0x000000) },
      uEmissiveStrength: { value: opts.emissiveStrength ?? 0 },
    },
    side: DoubleSide,
  });
  return mat;
}

/** Set the scene mood on a material: light color and sky and ground fill. */
export function setMood(mat: ShaderMaterial, light: string, sky: string, ground: string, rim = '#ffffff'): void {
  (mat.uniforms.uLightColor!.value as Color).set(light);
  (mat.uniforms.uSkyColor!.value as Color).set(sky);
  (mat.uniforms.uGroundColor!.value as Color).set(ground);
  (mat.uniforms.uRimColor!.value as Color).set(rim);
}

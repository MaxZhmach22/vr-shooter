#include <clipping_planes_pars_fragment>

uniform sampler2D map;
varying vec2 vUv;

void main() {

    csm_FragColor = texture2D(map, vUv);
}

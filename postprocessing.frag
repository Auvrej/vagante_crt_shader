uniform sampler2D texture;
uniform float gamma;

vec3 rgb_hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv_rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float sat_curve(float v) {
	return (cos(3.14159265 * v) - 1.0) * -0.5;
}

void main()
{
	vec2 uv = gl_TexCoord[0].xy;
	uv = (uv * 2.0) - 1.0;

	float curve = 10.0;
	vec2 offset = uv.yx / curve;
	
	uv = uv + (uv * offset * offset);
	uv = (uv + 1.0) * 0.5;

	float y_pos = gl_TexCoord[0].y * 360.0;
	gl_FragColor = texture2D(texture, uv);
	if (uv.x < 0.0 || 1.0 < uv.x || uv.y < 0.0 || 1.0 < uv.y) {
		gl_FragColor = vec4(0.0);
	}
	vec3 pixel = gl_FragColor.rgb;

	pixel = rgb_hsv(pixel.rgb);
	for (float i = 1.0; i < gamma; i = i + 0.1) {
		pixel.g = sat_curve(pixel.g);
	}
	pixel = hsv_rgb(vec3(pixel.xy, pixel.z * 1.5));

	gl_FragColor.r = pixel.r * (cos(6.2831853 * y_pos) + 1.0) * 0.5;
	gl_FragColor.g = pixel.g * (cos(6.2831853 * (y_pos + 0.6666667)) + 1.0) * 0.5;
	gl_FragColor.b = pixel.b * (cos(6.2831853 * (y_pos + 0.3333333)) + 1.0) * 0.5;


	float width = 0.05;
	uv = 1.0 - abs((uv * 2.0) - 1.0);
	vec2 vignette = smoothstep(0.0, width, uv);

	gl_FragColor.rgb = gl_FragColor.rgb * vignette.x * vignette.y;
}


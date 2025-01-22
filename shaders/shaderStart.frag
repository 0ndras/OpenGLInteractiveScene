#version 410 core

in vec3 fNormal;
in vec4 fPosEye;
in vec2 fTexCoords;
in vec4 fragPosLightSpace;

out vec4 fColor;

// Lighting
uniform vec3 lightDir;             // Direcția luminii principale (direcțională)
uniform vec3 lightColor;           // Culoarea luminii principale
uniform vec3 pointLightPosition;   // Locatia sursei de lumina punctiforma
uniform vec3 pointLightColor;      // Culoarea luminii punctiforme

// Texture samplers
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;
uniform sampler2D shadowMap;

// Light properties
vec3 ambient;
float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;
float shininess = 32.0f;

// Compute shadow (basic)
float computeShadow()
{
    vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    normalizedCoords = normalizedCoords * 0.5 + 0.5;
    float closestDepth = texture(shadowMap, normalizedCoords.xy).r;
    float currentDepth = normalizedCoords.z;
    float bias = max(0.05f * (1.0f - dot(fNormal, lightDir)), 0.005f);
    float shadow = currentDepth - bias > closestDepth ? 1.0f : 0.0f;
    if (normalizedCoords.z > 1.0f)
        return 0.0f;
    return shadow;
}

// Point light calculation
void computePointLightComponents(vec3 pointLightPosition, vec3 pointLightColor)
{
    vec3 normalEye = normalize(fNormal);

    // Direction to the point light
    vec3 pointLightDir = normalize(pointLightPosition - fPosEye.xyz);

    // Distance attenuation
    float distance = length(pointLightPosition - fPosEye.xyz);
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);

    // Ambient, Diffuse, and Specular light components for the point light
    vec3 pointAmbient = ambientStrength * pointLightColor;
    vec3 pointDiffuse = max(dot(normalEye, pointLightDir), 0.0f) * pointLightColor;
    vec3 reflection = reflect(-pointLightDir, normalEye);
    float specCoeff = pow(max(dot(fPosEye.xyz - fPosEye.xyz, reflection), 0.0f), shininess);
    vec3 pointSpecular = specularStrength * specCoeff * pointLightColor;

    // Apply attenuation
    pointAmbient *= attenuation;
    pointDiffuse *= attenuation;
    pointSpecular *= attenuation;

    // Accumulate the contributions
    ambient += pointAmbient;
    diffuse += pointDiffuse;
    specular += pointSpecular;
}

void main() 
{
    // Compute directional light components
    vec3 normalEye = normalize(fNormal);
    vec3 lightDirN = normalize(lightDir);
    vec3 viewDirN = normalize(-fPosEye.xyz);
    
    ambient = ambientStrength * lightColor;
    diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
    vec3 reflection = reflect(-lightDirN, normalEye);
    float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
    specular = specularStrength * specCoeff * lightColor;

    // Compute point light components (for the second light source)
    computePointLightComponents(pointLightPosition, pointLightColor);

    // Modulate with textures
    vec3 textureColor = texture(diffuseTexture, fTexCoords).rgb;
    vec3 specularColor = texture(specularTexture, fTexCoords).rgb;
    
    ambient *= textureColor;
    diffuse *= textureColor;
    specular *= specularColor;

    // Compute shadow for directional light
    float shadow = computeShadow();

    // Combine lighting components, using clamping for correct brightness
    vec3 color = ambient + (1.0f - shadow) * (diffuse + specular);
    
    // Ensure color is within the proper range
    color = clamp(color, 0.0f, 1.0f); // Prevent overexposure
    
    fColor = vec4(color, 1.0f);  // Output final color
}

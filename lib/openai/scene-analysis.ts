/**
 * OpenAI Scene Analysis Service
 * 
 * This module provides scene analysis functionality for determining single vs multi-scene
 * requirements, detecting character consistency needs, and generating detailed character
 * descriptions for consistent faces across Veo3 video generation.
 * 
 * Key Features:
 * - Single vs multi-scene detection
 * - Human character consistency analysis
 * - Detailed character description generation for Veo3
 * - Scene breakdown and transition planning
 * - Integration with existing OpenAI patterns
 */

import { getOpenAIClient, handleOpenAIError } from './client';
import { validatePrompt, sanitizePromptForVideo, isNonEmptyString } from './utils';
import { 
  EnhancedSceneAnalysisResult,
  CharacterDescription,
  SceneInfo,
  ProcessingMetadata,
  ErrorCode,
  ValidationResult
} from './types';

/**
 * Scene Analysis Service
 * 
 * Analyzes user prompts to determine scene requirements and character consistency needs.
 * Follows existing PromptEnhancementService patterns for consistency.
 */
export class SceneAnalysisService {
  
  /**
   * Analyze a user prompt for scene requirements and character consistency
   * 
   * @param userPrompt - The original user prompt to analyze
   * @returns Promise resolving to enhanced scene analysis result
   */
  async analyzePrompt(userPrompt: string): Promise<EnhancedSceneAnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Validate input first (using existing validation patterns)
      const validation = validatePrompt(userPrompt);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid prompt');
      }
      
      // Use sanitized prompt
      const sanitizedPrompt = validation.sanitizedPrompt!;
      
      // Get OpenAI client (using existing client pattern)
      const client = getOpenAIClient();
      
      // Analyze prompt complexity and scene requirements
      const complexityAnalysis = await this.detectComplexity(sanitizedPrompt);
      const characterAnalysis = await this.identifyCharacters(sanitizedPrompt);
      
      // Determine if multi-scene approach is needed
      const isMultiScene = complexityAnalysis.isMultiScene;
      const sceneCount = complexityAnalysis.sceneCount;
      
      // Generate scene breakdown
      const scenes = isMultiScene 
        ? await this.createSceneBreakdown(sanitizedPrompt, sceneCount)
        : [await this.createSingleScene(sanitizedPrompt)];
      
      // Generate character descriptions if needed
      const characterDescriptions = characterAnalysis.requiresConsistency 
        ? await this.generateCharacterDescriptions(sanitizedPrompt, characterAnalysis.characters)
        : [];
      
      // Create scene-character mappings
      const sceneCharacterMappings = this.mapCharactersToScenes(scenes, characterDescriptions);
      
      // Calculate processing metadata
      const processingTime = Date.now() - startTime;
      
      return {
        isMultiScene,
        sceneCount,
        scenes,
        complexity: complexityAnalysis.complexity,
        recommendedApproach: isMultiScene ? 'multi-scene' : 'single',
        requiresCharacterConsistency: characterAnalysis.requiresConsistency,
        characterDescriptions,
        sceneCharacterMappings
      };
      
    } catch (error) {
      // Handle errors using existing error handling patterns
      const errorResponse = handleOpenAIError(error);
      
      // Return minimal error result
      return {
        isMultiScene: false,
        sceneCount: 1,
        scenes: [],
        complexity: 'simple',
        recommendedApproach: 'single',
        requiresCharacterConsistency: false,
        characterDescriptions: [],
        sceneCharacterMappings: {}
      };
    }
  }
  
  /**
   * Detect prompt complexity and scene requirements
   * 
   * @param prompt - The sanitized prompt to analyze
   * @returns Complexity analysis result
   */
  private async detectComplexity(prompt: string): Promise<{
    isMultiScene: boolean;
    sceneCount: number;
    complexity: 'simple' | 'moderate' | 'complex';
  }> {
    try {
      const client = getOpenAIClient();
      
      // Use OpenAI to analyze scene complexity
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: this.getSceneAnalysisSystemPrompt()
          },
          {
            role: "user",
            content: `Analyze this prompt for scene complexity: "${prompt}"`
          }
        ],
        max_tokens: 300,
        temperature: 0.3, // Lower temperature for more consistent analysis
      });
      
      const analysisText = response.choices[0]?.message?.content || '';
      
      // Parse the analysis (simple implementation)
      const isMultiScene = this.detectMultiSceneIndicators(prompt, analysisText);
      const sceneCount = isMultiScene ? this.estimateSceneCount(prompt, analysisText) : 1;
      const complexity = this.assessComplexity(prompt, analysisText);
      
      return {
        isMultiScene,
        sceneCount: Math.min(sceneCount, 5), // Cap at 5 scenes for practical reasons
        complexity
      };
      
    } catch (error) {
      // Fallback to simple heuristic analysis
      return this.fallbackComplexityAnalysis(prompt);
    }
  }
  
  /**
   * Identify human characters in the prompt and determine consistency needs
   * 
   * @param prompt - The sanitized prompt to analyze
   * @returns Character analysis result
   */
  private async identifyCharacters(prompt: string): Promise<{
    requiresConsistency: boolean;
    characters: string[];
  }> {
    try {
      const client = getOpenAIClient();
      
      // Use OpenAI to identify characters
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: this.getCharacterAnalysisSystemPrompt()
          },
          {
            role: "user",
            content: `Identify human characters in this prompt: "${prompt}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      });
      
      const characterText = response.choices[0]?.message?.content || '';
      
      // Parse character information
      const characters = this.extractCharacterNames(characterText);
      const requiresConsistency = characters.length > 0 && this.needsCharacterConsistency(prompt);
      
      return {
        requiresConsistency,
        characters
      };
      
    } catch (error) {
      // Fallback to simple heuristic
      return this.fallbackCharacterAnalysis(prompt);
    }
  }
  
  /**
   * Generate detailed character descriptions for Veo3 consistency
   * 
   * @param prompt - The original prompt
   * @param characters - Array of character names/descriptions
   * @returns Array of detailed character descriptions
   */
  private async generateCharacterDescriptions(
    prompt: string, 
    characters: string[]
  ): Promise<CharacterDescription[]> {
    const descriptions: CharacterDescription[] = [];
    
    try {
      const client = getOpenAIClient();
      
      // Generate description for each character
      for (let i = 0; i < characters.length; i++) {
        const character = characters[i];
        
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: this.getCharacterDescriptionSystemPrompt()
            },
            {
              role: "user",
              content: `Create a detailed character description for Veo3 consistency based on this prompt: "${prompt}". Character: "${character}"`
            }
          ],
          max_tokens: 400,
          temperature: 0.5,
        });
        
        const descriptionText = response.choices[0]?.message?.content || '';
        const characterDescription = this.parseCharacterDescription(character, descriptionText, i);
        
        descriptions.push(characterDescription);
      }
      
    } catch (error) {
      // Return basic descriptions on error
      return characters.map((char, index) => this.createBasicCharacterDescription(char, index));
    }
    
    return descriptions;
  }
  
  /**
   * Create scene breakdown for multi-scene prompts
   * 
   * @param prompt - The original prompt
   * @param sceneCount - Number of scenes to create
   * @returns Array of scene information
   */
  private async createSceneBreakdown(prompt: string, sceneCount: number): Promise<SceneInfo[]> {
    try {
      const client = getOpenAIClient();
      
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: this.getSceneBreakdownSystemPrompt()
          },
          {
            role: "user",
            content: `Break down this prompt into ${sceneCount} scenes (max 8 seconds each): "${prompt}"`
          }
        ],
        max_tokens: 600,
        temperature: 0.4,
      });
      
      const sceneText = response.choices[0]?.message?.content || '';
      return this.parseSceneBreakdown(sceneText, sceneCount);
      
    } catch (error) {
      // Return basic scene breakdown on error
      return this.createBasicSceneBreakdown(prompt, sceneCount);
    }
  }
  
  /**
   * Create single scene for simple prompts
   * 
   * @param prompt - The original prompt
   * @returns Single scene information
   */
  private async createSingleScene(prompt: string): Promise<SceneInfo> {
    return {
      sceneNumber: 1,
      description: prompt,
      duration: 8,
      characters: [],
      visualElements: [],
      audioElements: []
    };
  }
  
  /**
   * Map characters to scenes
   * 
   * @param scenes - Array of scene information
   * @param characters - Array of character descriptions
   * @returns Mapping of scene numbers to character IDs
   */
  private mapCharactersToScenes(
    scenes: SceneInfo[], 
    characters: CharacterDescription[]
  ): Record<number, string[]> {
    const mappings: Record<number, string[]> = {};
    
    // Simple implementation: map all characters to all scenes
    scenes.forEach(scene => {
      mappings[scene.sceneNumber] = characters.map(char => char.characterId);
    });
    
    return mappings;
  }
  
  // System prompts for different analysis types
  
  private getSceneAnalysisSystemPrompt(): string {
    return `You are a TikTok video analyst. Your job is to determine if a prompt needs ONE scene (preferred for TikTok) or multiple scenes.

STRONG BIAS TOWARD SINGLE SCENES:
- TikTok users have 8-second attention spans
- Most content works better in a single 8-second scene
- Only recommend multiple scenes for VERY CLEAR sequential stories

Only suggest multiple scenes if ALL of these are true:
1. The prompt has VERY CLEAR temporal sequence words like "then", "next", "after that", "finally"
2. The events CANNOT fit into a single 8-second scene
3. The prompt describes completely different actions that happen one after another
4. The prompt is longer than 200 characters

Examples:
- "Capybaras jumping on trampoline, one falls off" = SINGLE SCENE (all happens together)
- "Chef cooking, burns food, calls fire department, orders pizza" = MULTIPLE SCENES (clear sequence)
- "Person running late, spills coffee, catches bus" = SINGLE SCENE (can show all in 8 seconds)

Default to SINGLE SCENE unless absolutely certain multiple scenes are needed.`;
  }
  
  private getCharacterAnalysisSystemPrompt(): string {
    return `You are a HUMAN character analyst for AI video generation. Your job is to identify ONLY human people in prompts.

STRICT REQUIREMENTS:
- ONLY identify HUMAN PEOPLE (not animals, pets, objects, creatures)
- Animals like capybaras, dogs, cats, etc. are NOT characters for this analysis
- Only look for people: chef, teacher, friend, person, man, woman, etc.

Look for:
1. **Named People**: Specific human names (John, Sarah, etc.)
2. **Human Roles**: Chef, teacher, friend, worker, person, man, woman
3. **Pronoun References**: He, she, they referring to PEOPLE (not animals)
4. **Human Interactions**: People talking, interacting with each other

CRITICAL: If the prompt only contains animals or objects, respond with "NO HUMAN CHARACTERS FOUND".

Examples:
- "A chef cooking" → HUMAN: chef
- "Capybaras on trampoline" → NO HUMAN CHARACTERS FOUND
- "A person walking their dog" → HUMAN: person
- "Two friends arguing" → HUMAN: friends

Only list HUMAN characters found.`;
  }
  
  private getCharacterDescriptionSystemPrompt(): string {
    return `You are an expert character designer for Veo3 AI video generation. Create highly detailed, specific character descriptions that ensure facial consistency across multiple video scenes.

For Veo3 consistency, include:
1. **Age**: Specific age range (e.g., "in her late 20s")
2. **Hair**: Detailed hair description (color, length, style, texture)
3. **Facial Features**: Specific features (eyes, nose, smile, makeup)
4. **Clothing**: Detailed clothing with materials, colors, style
5. **Accessories**: Jewelry, glasses, hats, etc.
6. **Unique Details**: Distinctive features that make the character memorable

Requirements:
- Be HIGHLY SPECIFIC - vague descriptions don't work for Veo3
- Use exact wording that can be reused in every scene prompt
- Include unique identifiers that make the character distinctive
- Focus on visual elements that AI can consistently generate

Example: "A cheerful Japanese woman in her late 20s, with straight shoulder-length jet-black hair and soft bangs. She wears a sleek black blouse with subtle satin sheen, slightly puffed sleeves, and minimal silver jewelry. Her makeup is light and natural, with a warm smile and bright, expressive brown eyes."`;
  }
  
  private getSceneBreakdownSystemPrompt(): string {
    return `You are a Veo3 prompt generator. Break down the user's prompt into separate 8-second video scenes.

CRITICAL OUTPUT REQUIREMENTS:
- Output ONLY individual Veo3-ready scene prompts
- Each scene on a separate line starting with "SCENE:"
- NO commentary, explanations, or meta-text
- NO phrases like "This will..." or "This engaging..."
- Output format: SCENE: [detailed scene description]

For each scene:
- Include specific visual details, character actions, setting
- Mention camera angles and lighting
- Include audio elements (music, sounds, dialogue)
- Make it complete and Veo3-ready
- Maximum 8 seconds duration
- Vertical TikTok format (9:16)

Example:
SCENE: A chef in a modern kitchen accidentally drops a pan, smoke fills the air as the fire alarm beeps. Close-up of his shocked expression with comedic timing. Upbeat kitchen sounds and a cartoonish "oops" sound effect.
SCENE: The same chef frantically waving a towel at the smoke detector while opening windows. Wide shot showing the chaotic kitchen scene. Fast-paced comedy music with clattering sounds.

Output only the SCENE: lines, nothing else.`;
  }
  
  // Helper methods for parsing and analysis
  
  private detectMultiSceneIndicators(prompt: string, analysis: string): boolean {
    // HEAVILY BIAS TOWARD SINGLE SCENES FOR TIKTOK
    // Only create multi-scene if there are VERY CLEAR sequential indicators
    
    const strongSequenceKeywords = [
      'then ', 'next ', 'after that', 'later ', 'finally ', 
      'first ', 'second ', 'third ', 'step 1', 'step 2', 'step 3',
      'part 1', 'part 2', 'part 3'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    
    // Count strong sequence indicators
    let sequenceCount = 0;
    strongSequenceKeywords.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) {
        sequenceCount++;
      }
    });
    
    // Only consider multi-scene if:
    // 1. At least 2 strong sequence indicators AND
    // 2. Prompt is longer than 150 characters AND 
    // 3. Contains clear temporal progression
    const hasMultipleSequences = sequenceCount >= 2;
    const isLongEnough = prompt.length > 250;
    const hasTemporalProgression = lowerPrompt.includes('then ') && 
                                  (lowerPrompt.includes('after') || lowerPrompt.includes('later') || lowerPrompt.includes('finally'));
    
    // For TikTok, be extremely conservative - most videos should be single scene
    return hasMultipleSequences && isLongEnough && hasTemporalProgression;
  }
  
  private estimateSceneCount(prompt: string, analysis: string): number {
    // Look for number mentions in analysis
    const numberMatch = analysis.match(/(\d+)\s*scene/i);
    if (numberMatch) {
      return Math.min(parseInt(numberMatch[1]), 5);
    }
    
    // Count sequence indicators in prompt
    const sequenceIndicators = ['then', 'next', 'after', 'finally', 'first', 'second', 'third'];
    const lowerPrompt = prompt.toLowerCase();
    let sceneCount = 1;
    
    sequenceIndicators.forEach(indicator => {
      const matches = lowerPrompt.split(indicator).length - 1;
      sceneCount += matches;
    });
    
    return Math.min(Math.max(sceneCount, 2), 5); // 2-5 scenes for multi-scene
  }
  
  private assessComplexity(prompt: string, analysis: string): 'simple' | 'moderate' | 'complex' {
    const complexityKeywords = {
      simple: ['simple', 'basic', 'straightforward', 'single'],
      moderate: ['moderate', 'medium', 'some', 'few'],
      complex: ['complex', 'complicated', 'multiple', 'many', 'several']
    };
    
    const lowerAnalysis = analysis.toLowerCase();
    
    for (const [level, keywords] of Object.entries(complexityKeywords)) {
      if (keywords.some(keyword => lowerAnalysis.includes(keyword))) {
        return level as 'simple' | 'moderate' | 'complex';
      }
    }
    
    // Fallback based on prompt length and indicators
    if (prompt.length > 200 || this.detectMultiSceneIndicators(prompt, analysis)) {
      return 'complex';
    } else if (prompt.length > 100) {
      return 'moderate';
    }
    
    return 'simple';
  }
  
  private extractCharacterNames(characterText: string): string[] {
    const characters: string[] = [];
    
    // Check if no human characters were found
    if (characterText.toLowerCase().includes('no human characters found') || 
        characterText.toLowerCase().includes('no human characters') ||
        characterText.toLowerCase().includes('only animals') ||
        characterText.toLowerCase().includes('only contains animals')) {
      return []; // Return empty array - no human characters
    }
    
    // Simple extraction - look for HUMAN character patterns
    const lines = characterText.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('human:') || lowerLine.includes('person') || 
          lowerLine.includes('man') || lowerLine.includes('woman') ||
          lowerLine.includes('friend') || lowerLine.includes('chef') ||
          lowerLine.includes('teacher') || lowerLine.includes('worker')) {
        // Exclude animal-related lines
        if (!lowerLine.includes('capybara') && !lowerLine.includes('dog') && 
            !lowerLine.includes('cat') && !lowerLine.includes('animal')) {
          const cleaned = line.replace(/[^\w\s]/g, '').trim();
          if (cleaned.length > 0) {
            characters.push(cleaned);
          }
        }
      }
    }
    
    return characters.slice(0, 3); // Limit to 3 characters max
  }
  
  private needsCharacterConsistency(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();
    
    // Indicators that character consistency is needed
    const consistencyIndicators = [
      'then', 'next', 'after', 'later', 'continues', 'goes',
      'he ', 'she ', 'they ', 'him ', 'her ', 'them ',
      'same', 'character', 'person'
    ];
    
    return consistencyIndicators.some(indicator => lowerPrompt.includes(indicator));
  }
  
  private parseCharacterDescription(
    character: string, 
    descriptionText: string, 
    index: number
  ): CharacterDescription {
    // Parse the OpenAI-generated description
    const lines = descriptionText.split('\n').filter(line => line.trim());
    
    return {
      characterId: `char_${index + 1}`,
      name: character,
      detailedDescription: descriptionText.trim(),
      age: this.extractDetail(descriptionText, 'age') || 'in their 20s',
      hair: this.extractDetail(descriptionText, 'hair') || 'shoulder-length brown hair',
      clothing: this.extractDetail(descriptionText, 'clothing', 'wear') || 'casual clothing',
      facialFeatures: this.extractDetail(descriptionText, 'face', 'features', 'eyes') || 'friendly expression',
      accessories: this.extractDetail(descriptionText, 'accessories', 'jewelry') || 'minimal jewelry',
      uniqueIdentifiers: this.extractUniqueDetails(descriptionText)
    };
  }
  
  private extractDetail(text: string, ...keywords: string[]): string {
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (keywords.some(keyword => lowerSentence.includes(keyword))) {
        return sentence.trim();
      }
    }
    
    return '';
  }
  
  private extractUniqueDetails(text: string): string[] {
    const details: string[] = [];
    const sentences = text.split(/[.!?]+/);
    
    // Look for distinctive details
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (lowerSentence.includes('distinctive') || 
          lowerSentence.includes('unique') || 
          lowerSentence.includes('specific') ||
          lowerSentence.includes('particular')) {
        details.push(sentence.trim());
      }
    }
    
    return details.slice(0, 3); // Limit to 3 unique details
  }
  
  private parseSceneBreakdown(sceneText: string, expectedSceneCount: number): SceneInfo[] {
    const scenes: SceneInfo[] = [];
    
    // Look for SCENE: prefixed lines
    const sceneLines = sceneText.split('\n')
      .filter(line => line.trim().toUpperCase().startsWith('SCENE:'))
      .map(line => line.replace(/^SCENE:\s*/i, '').trim())
      .filter(line => line.length > 0);
    
    // If no SCENE: format found, try other parsing methods
    if (sceneLines.length === 0) {
      // Try splitting by scene indicators
      const sections = sceneText.split(/scene\s*\d+/i).slice(1);
      for (let i = 0; i < Math.min(sections.length, expectedSceneCount); i++) {
        const section = sections[i].trim();
        if (section) {
          scenes.push({
            sceneNumber: i + 1,
            description: section.substring(0, 300),
            duration: 8,
            characters: [],
            visualElements: this.extractElements(section, 'visual'),
            audioElements: this.extractElements(section, 'audio', 'sound')
          });
        }
      }
    } else {
      // Use the properly formatted SCENE: lines
      sceneLines.forEach((sceneLine, index) => {
        if (index < expectedSceneCount) {
          scenes.push({
            sceneNumber: index + 1,
            description: sceneLine,
            duration: 8,
            characters: [],
            visualElements: this.extractElements(sceneLine, 'visual', 'camera', 'light'),
            audioElements: this.extractElements(sceneLine, 'audio', 'sound', 'music')
          });
        }
      });
    }
    
    // Fill remaining scenes if needed
    while (scenes.length < expectedSceneCount) {
      scenes.push({
        sceneNumber: scenes.length + 1,
        description: `Additional scene ${scenes.length + 1} continuation`,
        duration: 8,
        characters: [],
        visualElements: [],
        audioElements: []
      });
    }
    
    return scenes;
  }
  
  private extractElements(text: string, ...keywords: string[]): string[] {
    const elements: string[] = [];
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (keywords.some(keyword => lowerSentence.includes(keyword))) {
        elements.push(sentence.trim());
      }
    }
    
    return elements.slice(0, 3); // Limit to 3 elements
  }
  
  // Fallback methods for when OpenAI calls fail
  
  private fallbackComplexityAnalysis(prompt: string): {
    isMultiScene: boolean;
    sceneCount: number;
    complexity: 'simple' | 'moderate' | 'complex';
  } {
    // HEAVILY BIAS TOWARD SINGLE SCENES - TikTok philosophy
    const strongSequenceWords = /\b(then\s+|next\s+|after\s+that|finally\s+|first\s+.*second\s+|step\s+1.*step\s+2)\b/i.test(prompt);
    const isVeryLong = prompt.length > 250;
    const hasMultipleClearSteps = prompt.toLowerCase().split(/then|next|after|finally/).length > 3;
    
    // Only create multi-scene for very clear sequential content
    const isMultiScene = strongSequenceWords && isVeryLong && hasMultipleClearSteps;
    const sceneCount = isMultiScene ? Math.min(Math.ceil(prompt.split(/then|next|after|finally/i).length), 3) : 1;
    const complexity = isMultiScene ? (sceneCount > 2 ? 'complex' : 'moderate') : 'simple';
    
    return { isMultiScene, sceneCount, complexity };
  }
  
  private fallbackCharacterAnalysis(prompt: string): {
    requiresConsistency: boolean;
    characters: string[];
  } {
    // Only look for HUMAN character words
    const humanCharacterWords = ['person', 'man', 'woman', 'guy', 'girl', 'chef', 'teacher', 'friend', 'worker', 'doctor', 'student'];
    const characters: string[] = [];
    
    const lowerPrompt = prompt.toLowerCase();
    
    // Check if prompt is primarily about animals
    const animalWords = ['capybara', 'dog', 'cat', 'bird', 'animal', 'pet'];
    const hasAnimals = animalWords.some(animal => lowerPrompt.includes(animal));
    
    // If prompt is about animals and no clear human roles, return no characters
    if (hasAnimals) {
      const hasHumans = humanCharacterWords.some(human => lowerPrompt.includes(human));
      if (!hasHumans) {
        return {
          requiresConsistency: false,
          characters: []
        };
      }
    }
    
    // Extract human characters
    humanCharacterWords.forEach(word => {
      if (lowerPrompt.includes(word)) {
        characters.push(word);
      }
    });
    
    const hasPronouns = /\b(he|she|they|him|her|them)\b/i.test(prompt);
    const requiresConsistency = characters.length > 0 && (hasPronouns || /\b(then|next|after)\b/i.test(prompt));
    
    return {
      requiresConsistency,
      characters: characters.slice(0, 2) // Limit to 2 characters
    };
  }
  
  private createBasicCharacterDescription(character: string, index: number): CharacterDescription {
    return {
      characterId: `char_${index + 1}`,
      name: character,
      detailedDescription: `A person described as ${character} with distinctive features for video consistency.`,
      age: 'in their 20s or 30s',
      hair: 'medium-length hair',
      clothing: 'appropriate attire for the scene',
      facialFeatures: 'clear, expressive features',
      accessories: 'minimal accessories',
      uniqueIdentifiers: [`distinctive ${character} appearance`]
    };
  }
  
  private createBasicSceneBreakdown(prompt: string, sceneCount: number): SceneInfo[] {
    const scenes: SceneInfo[] = [];
    const promptLength = Math.ceil(prompt.length / sceneCount);
    
    for (let i = 0; i < sceneCount; i++) {
      scenes.push({
        sceneNumber: i + 1,
        description: `Scene ${i + 1}: ${prompt.substring(i * promptLength, (i + 1) * promptLength)}`,
        duration: 8,
        characters: [],
        visualElements: [],
        audioElements: []
      });
    }
    
    return scenes;
  }
}

/**
 * Global scene analysis service instance
 * Lazily initialized to ensure proper configuration
 */
let sceneAnalysisService: SceneAnalysisService | null = null;

/**
 * Get the global scene analysis service instance
 * 
 * @returns SceneAnalysisService instance
 */
export function getSceneAnalysisService(): SceneAnalysisService {
  if (!sceneAnalysisService) {
    sceneAnalysisService = new SceneAnalysisService();
  }
  return sceneAnalysisService;
}

/**
 * Convenience function to analyze a prompt for scene requirements
 * 
 * @param userPrompt - The prompt to analyze
 * @returns Promise resolving to scene analysis result
 */
export async function analyzePromptScenes(userPrompt: string): Promise<EnhancedSceneAnalysisResult> {
  const service = getSceneAnalysisService();
  return service.analyzePrompt(userPrompt);
}
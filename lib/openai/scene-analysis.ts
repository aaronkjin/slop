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
    return `You are an expert video scene analyst specializing in determining whether user prompts require single or multiple scenes for optimal video generation.

Analyze prompts for:
1. **Temporal Complexity**: Does the prompt describe events that happen sequentially over time?
2. **Setting Changes**: Does the prompt involve different locations or environments? 
3. **Duration**: Would the described action take longer than 8 seconds to show effectively?
4. **Narrative Flow**: Does the prompt tell a story with distinct beginning, middle, and end?

Guidelines:
- Single scene: Simple actions, single location, can be shown in 8 seconds
- Multi-scene: Sequential events, location changes, story progression, longer duration

Respond with analysis of whether this requires single or multiple scenes and estimate scene count (1-5 max).`;
  }
  
  private getCharacterAnalysisSystemPrompt(): string {
    return `You are an expert character analyst for AI video generation. Identify human characters in prompts and determine if they need consistent faces across scenes.

Look for:
1. **Named Characters**: Specific people mentioned by name
2. **Role-based Characters**: Chef, teacher, friend, etc.
3. **Pronoun References**: He, she, they referring to specific people
4. **Character Interactions**: People talking, interacting, or appearing together

Guidelines:
- Only identify HUMAN characters (not animals, objects, etc.)
- Focus on characters that would appear in multiple scenes
- Consider if the same person needs to look consistent across scenes

List the human characters found and whether consistency is needed.`;
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
    return `You are an expert video scene director specializing in breaking down complex prompts into 8-second video scenes optimized for Veo3 generation.

For each scene, provide:
1. **Scene Description**: What happens in this specific 8-second segment
2. **Visual Elements**: Key visual components to include
3. **Audio Elements**: Sound effects, music, dialogue for this scene
4. **Duration**: How long this scene should be (max 8 seconds)
5. **Transitions**: How this scene connects to the next

Guidelines:
- Each scene must be complete and engaging on its own
- Scenes should flow logically from one to the next
- Keep scenes focused and action-packed for TikTok format
- Ensure smooth narrative progression
- Maximum 8 seconds per scene for Veo3 constraints

Break down the prompt into logical scene segments with smooth transitions.`;
  }
  
  // Helper methods for parsing and analysis
  
  private detectMultiSceneIndicators(prompt: string, analysis: string): boolean {
    const multiSceneKeywords = [
      'then', 'next', 'after', 'later', 'finally', 'suddenly', 
      'meanwhile', 'first', 'second', 'third', 'sequence',
      'story', 'journey', 'progression', 'timeline'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    const lowerAnalysis = analysis.toLowerCase();
    
    // Check for keywords in both prompt and analysis
    const hasKeywords = multiSceneKeywords.some(keyword => 
      lowerPrompt.includes(keyword) || lowerAnalysis.includes(keyword)
    );
    
    // Check analysis for explicit multi-scene recommendation
    const analysisRecommends = lowerAnalysis.includes('multiple') || 
                               lowerAnalysis.includes('multi') || 
                               lowerAnalysis.includes('several');
    
    return hasKeywords || analysisRecommends;
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
    
    // Simple extraction - look for common character patterns
    const lines = characterText.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('character') || lowerLine.includes('person') || 
          lowerLine.includes('man') || lowerLine.includes('woman') ||
          lowerLine.includes('friend') || lowerLine.includes('chef') ||
          lowerLine.includes('teacher') || lowerLine.includes('worker')) {
        const cleaned = line.replace(/[^\w\s]/g, '').trim();
        if (cleaned.length > 0) {
          characters.push(cleaned);
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
    const sections = sceneText.split(/scene\s*\d+/i).slice(1); // Split by "Scene 1", "Scene 2", etc.
    
    for (let i = 0; i < Math.min(sections.length, expectedSceneCount); i++) {
      const section = sections[i].trim();
      
      scenes.push({
        sceneNumber: i + 1,
        description: section.substring(0, 200), // Limit description length
        duration: 8, // Max duration for Veo3
        characters: [], // Will be populated by character mapping
        visualElements: this.extractElements(section, 'visual'),
        audioElements: this.extractElements(section, 'audio', 'sound')
      });
    }
    
    // Fill remaining scenes if needed
    while (scenes.length < expectedSceneCount) {
      scenes.push({
        sceneNumber: scenes.length + 1,
        description: `Scene ${scenes.length + 1} continuation`,
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
    const hasSequenceWords = /\b(then|next|after|later|first|second|third|finally)\b/i.test(prompt);
    const isLong = prompt.length > 150;
    
    const isMultiScene = hasSequenceWords || isLong;
    const sceneCount = isMultiScene ? Math.min(Math.ceil(prompt.length / 100), 4) : 1;
    const complexity = isMultiScene ? (sceneCount > 2 ? 'complex' : 'moderate') : 'simple';
    
    return { isMultiScene, sceneCount, complexity };
  }
  
  private fallbackCharacterAnalysis(prompt: string): {
    requiresConsistency: boolean;
    characters: string[];
  } {
    const characterWords = ['person', 'man', 'woman', 'guy', 'girl', 'chef', 'teacher', 'friend', 'worker'];
    const characters: string[] = [];
    
    const lowerPrompt = prompt.toLowerCase();
    characterWords.forEach(word => {
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
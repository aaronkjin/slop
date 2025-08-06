import { NextRequest, NextResponse } from 'next/server';
import { enhancePrompt } from '../../../lib/openai/enhance';

/**
 * API Route: Scene Analysis
 * 
 * Accepts user prompts and returns OpenAI-generated scene analysis with character descriptions
 * Integrates with the existing scene analysis pipeline for Veo3 video generation
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt cannot be empty' },
        { status: 400 }
      );
    }
    
    if (prompt.length > 400) {
      return NextResponse.json(
        { error: 'Prompt must be 400 characters or less' },
        { status: 400 }
      );
    }
    
    console.log('\n🎬 Scene Analysis Request');
    console.log('─'.repeat(40));
    console.log(`📝 User Prompt: "${prompt}"`);
    console.log(`📏 Length: ${prompt.length} characters`);
    
    // Call our integrated scene analysis + enhancement pipeline
    const result = await enhancePrompt(prompt, {
      includeSceneAnalysis: true,
      includeWebSearch: false, // Disable web search for faster response
      maxTokens: 800,
      temperature: 0.7
    });
    
    if (!result.success) {
      console.error('❌ Enhancement failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to analyze scene' },
        { status: 500 }
      );
    }
    
    // Log comprehensive results to console for validation
    console.log('\n📊 Scene Analysis Results');
    console.log('─'.repeat(40));
    console.log(`✅ Enhancement Success: ${result.success}`);
    console.log(`📝 Enhanced Prompt: ${result.enhancedPrompt}`);
    
    if (result.sceneAnalysis) {
      const analysis = result.sceneAnalysis;
      
      console.log('\n🎭 Scene Analysis Details:');
      console.log(`└─ Multi-Scene: ${analysis.isMultiScene}`);
      console.log(`└─ Scene Count: ${analysis.sceneCount}`);
      console.log(`└─ Complexity: ${analysis.complexity}`);
      console.log(`└─ Approach: ${analysis.recommendedApproach}`);
      console.log(`└─ Character Consistency: ${analysis.requiresCharacterConsistency}`);
      
      if (analysis.scenes.length > 0) {
        console.log('\n🎬 Individual Scenes:');
        analysis.scenes.forEach((scene, index) => {
          console.log(`\n   Scene ${scene.sceneNumber}:`);
          console.log(`   ├─ Description: ${scene.description.substring(0, 100)}...`);
          console.log(`   ├─ Duration: ${scene.duration}s`);
          console.log(`   └─ Characters: [${scene.characters.join(', ')}]`);
        });
      }
      
      if (analysis.characterDescriptions.length > 0) {
        console.log('\n👥 Character Descriptions (for Veo3 consistency):');
        analysis.characterDescriptions.forEach((char, index) => {
          console.log(`\n   Character ${index + 1} (${char.characterId}):`);
          console.log(`   ├─ Name: ${char.name}`);
          console.log(`   ├─ Age: ${char.age}`);
          console.log(`   ├─ Hair: ${char.hair}`);
          console.log(`   ├─ Clothing: ${char.clothing}`);
          console.log(`   ├─ Facial Features: ${char.facialFeatures}`);
          console.log(`   ├─ Accessories: ${char.accessories}`);
          console.log(`   ├─ Unique IDs: [${char.uniqueIdentifiers.join(', ')}]`);
          console.log(`   └─ Full Description: ${char.detailedDescription.substring(0, 120)}...`);
        });
      }
      
      if (Object.keys(analysis.sceneCharacterMappings).length > 0) {
        console.log('\n🔗 Scene-Character Mappings:');
        Object.entries(analysis.sceneCharacterMappings).forEach(([sceneNum, charIds]) => {
          console.log(`   Scene ${sceneNum}: [${charIds.join(', ')}]`);
        });
      }
    } else {
      console.log('\n⚠️  No scene analysis data available');
    }
    
    if (result.metadata) {
      console.log('\n📈 Processing Metadata:');
      console.log(`└─ Tokens Used: ${result.metadata.tokensUsed}`);
      console.log(`└─ Processing Time: ${result.metadata.processingTime}ms`);
      console.log(`└─ Model: ${result.metadata.model}`);
    }
    
    console.log('\n🎯 Ready for Veo3 Integration');
    console.log('─'.repeat(40));
    
    // Return structured response for frontend
    const responseData = {
      success: true,
      originalPrompt: result.originalPrompt,
      enhancedPrompt: result.enhancedPrompt,
      sceneAnalysis: result.sceneAnalysis ? {
        isMultiScene: result.sceneAnalysis.isMultiScene,
        sceneCount: result.sceneAnalysis.sceneCount,
        complexity: result.sceneAnalysis.complexity,
        recommendedApproach: result.sceneAnalysis.recommendedApproach,
        requiresCharacterConsistency: result.sceneAnalysis.requiresCharacterConsistency,
        scenes: result.sceneAnalysis.scenes.map(scene => ({
          sceneNumber: scene.sceneNumber,
          description: scene.description,
          duration: scene.duration,
          characters: scene.characters
        })),
        characterDescriptions: result.sceneAnalysis.characterDescriptions.map(char => ({
          characterId: char.characterId,
          name: char.name,
          detailedDescription: char.detailedDescription,
          age: char.age,
          hair: char.hair,
          clothing: char.clothing,
          facialFeatures: char.facialFeatures,
          accessories: char.accessories
        }))
      } : null,
      metadata: {
        tokensUsed: result.metadata?.tokensUsed || 0,
        processingTime: result.metadata?.processingTime || 0,
        model: result.metadata?.model || 'gpt-4o-mini',
        timestamp: result.metadata?.timestamp || new Date()
      }
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('\n❌ Scene Analysis API Error:');
    console.error(error);
    
    return NextResponse.json(
      { error: 'Internal server error during scene analysis' },
      { status: 500 }
    );
  }
}
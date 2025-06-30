
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// CRITICAL: Bulletproof category validation - ONLY these 4 categories are valid
const validateBankCategory = (category: string): string => {
  if (!category || typeof category !== 'string') return 'other'
  
  const normalized = category.toLowerCase().trim()
  
  // STRICT mapping - only these 4 categories exist in database: stackable, gear, materials, other
  const validCategories = ['stackable', 'gear', 'materials', 'other']
  
  // Direct match first
  if (validCategories.includes(normalized)) {
    return normalized
  }
  
  // Category mappings with GUARANTEED valid output
  const categoryMap: Record<string, string> = {
    // All consumable-type items -> stackable
    'consumables': 'stackable',
    'consumable': 'stackable',
    'food': 'stackable',
    'potion': 'stackable',
    'potions': 'stackable',
    'coins': 'stackable',
    'coin': 'stackable',
    'token': 'stackable',
    'tokens': 'stackable',
    'rune': 'stackable',
    'runes': 'stackable',
    'bolt': 'stackable',
    'bolts': 'stackable',
    'arrow': 'stackable',
    'arrows': 'stackable',
    'teleport': 'stackable',
    'scroll': 'stackable',
    'scrolls': 'stackable',
    
    // All equipment-type items -> gear
    'weapon': 'gear',
    'weapons': 'gear',
    'armor': 'gear',
    'armour': 'gear',
    'equipment': 'gear',
    'helmet': 'gear',
    'helm': 'gear',
    'shield': 'gear',
    'gloves': 'gear',
    'boots': 'gear',
    'ring': 'gear',
    'rings': 'gear',
    'amulet': 'gear',
    'necklace': 'gear',
    'bracelet': 'gear',
    'cape': 'gear',
    'cloak': 'gear',
    
    // All raw materials -> materials
    'resource': 'materials',
    'resources': 'materials',
    'material': 'materials',
    'log': 'materials',
    'logs': 'materials',
    'ore': 'materials',
    'ores': 'materials',
    'bar': 'materials',
    'bars': 'materials',
    'gem': 'materials',
    'gems': 'materials',
    'herb': 'materials',
    'herbs': 'materials',
    'seed': 'materials',
    'seeds': 'materials',
    'essence': 'materials',
    
    // Everything else -> other
    'misc': 'other',
    'miscellaneous': 'other',
    'quest': 'other',
    'key': 'other',
    'keys': 'other',
    'book': 'other',
    'books': 'other'
  }
  
  const mapped = categoryMap[normalized]
  if (mapped && validCategories.includes(mapped)) {
    return mapped
  }
  
  // Ultimate fallback - guarantee valid category
  return 'other'
}

// Safe number conversion that handles NaN and invalid values
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') return defaultValue
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? defaultValue : num
}

// Safe string conversion
const safeString = (value: any, maxLength: number = 1000): string => {
  if (value === null || value === undefined) return ''
  return String(value).substring(0, maxLength)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the Authorization header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const body = await req.json()
    const { action } = body

    if (action === 'save') {
      const { characters, moneyMethods, purchaseGoals, bankData, hoursPerDay } = body

      console.log('Starting cloud save for user:', user.id)

      // Clear existing data first
      console.log('Clearing existing user data...')
      try {
        await Promise.all([
          supabaseClient.from('characters').delete().eq('user_id', user.id),
          supabaseClient.from('money_methods').delete().eq('user_id', user.id),  
          supabaseClient.from('purchase_goals').delete().eq('user_id', user.id),
          supabaseClient.from('bank_items').delete().eq('user_id', user.id)
        ])
        console.log('Existing data cleared successfully')
      } catch (deleteError) {
        console.warn('Some delete operations failed, continuing anyway:', deleteError)
      }

      // Save characters with safe number conversion
      if (Array.isArray(characters) && characters.length > 0) {
        console.log(`Saving ${characters.length} characters...`)
        const charactersToInsert = characters.map((char: any) => ({
          user_id: user.id,
          name: safeString(char.name || 'Unnamed Character', 100),
          type: ['main', 'alt', 'ironman', 'hardcore', 'ultimate'].includes(char.type) ? char.type : 'main',
          combat_level: Math.max(3, Math.min(126, safeNumber(char.combatLevel, 3))),
          total_level: Math.max(32, Math.min(2277, safeNumber(char.totalLevel, 32))),
          bank: Math.max(0, safeNumber(char.bank, 0)),
          notes: safeString(char.notes, 1000),
          plat_tokens: Math.max(0, safeNumber(char.platTokens, 0))
        }))

        const { error: charactersError } = await supabaseClient
          .from('characters')
          .insert(charactersToInsert)
        
        if (charactersError) {
          console.error('Error saving characters:', charactersError)
          throw new Error(`Failed to save characters: ${charactersError.message}`)
        }
        console.log('Characters saved successfully')
      }

      // Save money methods with safe number conversion
      if (Array.isArray(moneyMethods) && moneyMethods.length > 0) {
        console.log(`Saving ${moneyMethods.length} money methods...`)
        const methodsToInsert = moneyMethods.map((method: any) => ({
          user_id: user.id,
          name: safeString(method.name || 'Unnamed Method', 100),
          character: safeString(method.character || 'Unknown', 100),
          gp_hour: Math.max(0, safeNumber(method.gpHour, 0)),
          click_intensity: Math.min(Math.max(safeNumber(method.clickIntensity, 1), 1), 5),
          requirements: safeString(method.requirements, 500),
          notes: safeString(method.notes, 1000),
          category: ['combat', 'skilling', 'bossing', 'other'].includes(method.category) ? method.category : 'other'
        }))

        const { error: methodsError } = await supabaseClient
          .from('money_methods')
          .insert(methodsToInsert)
        
        if (methodsError) {
          console.error('Error saving money methods:', methodsError)
          throw new Error(`Failed to save money methods: ${methodsError.message}`)
        }
        console.log('Money methods saved successfully')
      }

      // Save purchase goals with safe number conversion
      if (Array.isArray(purchaseGoals) && purchaseGoals.length > 0) {
        console.log(`Saving ${purchaseGoals.length} purchase goals...`)
        const goalsToInsert = purchaseGoals.map((goal: any) => ({
          user_id: user.id,
          name: safeString(goal.name || 'Unnamed Goal', 100),
          current_price: Math.max(0, safeNumber(goal.currentPrice, 0)),
          target_price: goal.targetPrice ? Math.max(0, safeNumber(goal.targetPrice, 0)) : null,
          quantity: Math.max(1, safeNumber(goal.quantity, 1)),
          priority: ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-'].includes(goal.priority) ? goal.priority : 'A',
          category: ['gear', 'consumables', 'materials', 'other'].includes(goal.category) ? goal.category : 'other',
          notes: safeString(goal.notes, 1000),
          image_url: safeString(goal.imageUrl, 500)
        }))

        const { error: goalsError } = await supabaseClient
          .from('purchase_goals')
          .insert(goalsToInsert)
        
        if (goalsError) {
          console.error('Error saving purchase goals:', goalsError)
          throw new Error(`Failed to save purchase goals: ${goalsError.message}`)
        }
        console.log('Purchase goals saved successfully')
      }

      // Save bank items with BULLETPROOF validation
      if (bankData && typeof bankData === 'object') {
        const allBankItems = Object.entries(bankData).flatMap(([character, items]: [string, any]) => 
          Array.isArray(items) ? items.map((item: any) => ({ ...item, characterName: character })) : []
        );
        
        if (allBankItems.length > 0) {
          console.log(`Processing ${allBankItems.length} bank items...`)
          
          const bankItemsToInsert = allBankItems
            .filter((item: any) => {
              const hasValidName = item && typeof item === 'object' && item.name && String(item.name).trim();
              if (!hasValidName) {
                console.log(`Skipping invalid item:`, item);
              }
              return hasValidName;
            })
            .map((item: any) => {
              // TRIPLE validation to ensure category is bulletproof
              let validatedCategory = validateBankCategory(item.category);
              
              // Final safety check - if somehow it's still invalid, force to 'other'
              if (!['stackable', 'gear', 'materials', 'other'].includes(validatedCategory)) {
                console.warn(`Category ${validatedCategory} is not valid, forcing to 'other'`);
                validatedCategory = 'other';
              }
              
              const quantity = Math.max(0, safeNumber(item.quantity, 0));
              const estimatedPrice = Math.max(0, safeNumber(item.estimatedPrice, 0));
              
              console.log(`Processing: ${item.name}, original: ${item.category} -> final: ${validatedCategory}, qty: ${quantity}, price: ${estimatedPrice}`);
              
              return {
                user_id: user.id,
                name: safeString(item.name, 100).trim(),
                quantity: quantity,
                estimated_price: estimatedPrice,
                category: validatedCategory, // GUARANTEED to be valid
                character: safeString(item.characterName || item.character || 'Unknown', 100)
              };
            })

          console.log(`Inserting ${bankItemsToInsert.length} validated bank items...`)
          
          if (bankItemsToInsert.length > 0) {
            // Insert in smaller batches to avoid timeout
            const batchSize = 15 // Smaller batches for safety
            for (let i = 0; i < bankItemsToInsert.length; i += batchSize) {
              const batch = bankItemsToInsert.slice(i, i + batchSize)
              console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(bankItemsToInsert.length/batchSize)} with ${batch.length} items`)
              
              // Final validation before insert
              const safeBatch = batch.map(item => {
                // Last line of defense - ensure category is absolutely valid
                const finalCategory = ['stackable', 'gear', 'materials', 'other'].includes(item.category) 
                  ? item.category 
                  : 'other';
                
                return {
                  ...item,
                  category: finalCategory
                };
              });
              
              const { error: bankError } = await supabaseClient
                .from('bank_items')
                .insert(safeBatch)
              
              if (bankError) {
                console.error(`Error saving bank items batch ${Math.floor(i/batchSize) + 1}:`, bankError)
                console.error('Failed batch details:', safeBatch.map(item => ({ name: item.name, category: item.category })))
                throw new Error(`Failed to save bank items: ${bankError.message}`)
              }
            }
          }
          
          console.log('All bank items saved successfully')
        }
      }

      console.log('Cloud save completed successfully for user:', user.id)
      
      return new Response(
        JSON.stringify({ success: true, message: 'Data saved successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'load') {
      // Load user data
      console.log('Loading cloud data for user:', user.id)

      const [charactersResult, methodsResult, goalsResult, bankResult] = await Promise.all([
        supabaseClient.from('characters').select('*').eq('user_id', user.id),
        supabaseClient.from('money_methods').select('*').eq('user_id', user.id),
        supabaseClient.from('purchase_goals').select('*').eq('user_id', user.id),
        supabaseClient.from('bank_items').select('*').eq('user_id', user.id)
      ])

      if (charactersResult.error) throw new Error(`Failed to load characters: ${charactersResult.error.message}`)
      if (methodsResult.error) throw new Error(`Failed to load money methods: ${methodsResult.error.message}`)
      if (goalsResult.error) throw new Error(`Failed to load goals: ${goalsResult.error.message}`)
      if (bankResult.error) throw new Error(`Failed to load bank items: ${bankResult.error.message}`)

      // Transform data back to frontend format with safe number conversion
      const characters = (charactersResult.data || []).map(char => ({
        id: char.id,
        name: char.name,
        type: char.type,
        combatLevel: safeNumber(char.combat_level, 0),
        totalLevel: safeNumber(char.total_level, 0),
        bank: safeNumber(char.bank, 0),
        notes: char.notes || '',
        isActive: true,
        platTokens: safeNumber(char.plat_tokens, 0)
      }))

      const moneyMethods = (methodsResult.data || []).map(method => ({
        id: method.id,
        name: method.name,
        character: method.character,
        gpHour: safeNumber(method.gp_hour, 0),
        clickIntensity: method.click_intensity,
        requirements: method.requirements || '',
        notes: method.notes || '',
        category: method.category
      }))

      const purchaseGoals = (goalsResult.data || []).map(goal => ({
        id: goal.id,
        name: goal.name,
        currentPrice: safeNumber(goal.current_price, 0),
        targetPrice: goal.target_price ? safeNumber(goal.target_price, 0) : undefined,
        quantity: safeNumber(goal.quantity, 1),
        priority: goal.priority,
        category: goal.category,
        notes: goal.notes || '',
        imageUrl: goal.image_url || ''
      }))

      // Group bank items by character with safe number conversion
      const bankData: Record<string, any[]> = {}
      const bankItems = (bankResult.data || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: safeNumber(item.quantity, 0),
        estimatedPrice: safeNumber(item.estimated_price, 0),
        category: item.category, // Keep the database category as-is
        character: item.character
      }))

      bankItems.forEach(item => {
        if (!bankData[item.character]) {
          bankData[item.character] = []
        }
        bankData[item.character].push(item)
      })

      console.log('Cloud data loaded successfully for user:', user.id)
      
      return new Response(
        JSON.stringify({
          characters,
          moneyMethods,
          purchaseGoals,
          bankData,
          hoursPerDay: 10
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in cloud-data function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

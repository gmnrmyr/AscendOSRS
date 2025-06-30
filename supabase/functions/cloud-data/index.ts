
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simplified category validation - only these 4 categories are valid
const validateBankCategory = (category: string): string => {
  if (!category || typeof category !== 'string') return 'other'
  
  const normalized = category.toLowerCase().trim()
  const validCategories = ['stackable', 'gear', 'materials', 'other']
  
  // Direct match first
  if (validCategories.includes(normalized)) {
    return normalized
  }
  
  // Simple category mappings
  const categoryMap: Record<string, string> = {
    'consumables': 'stackable',
    'consumable': 'stackable',
    'food': 'stackable',
    'potion': 'stackable',
    'potions': 'stackable',
    'weapon': 'gear',
    'weapons': 'gear',
    'armor': 'gear',
    'equipment': 'gear',
    'material': 'materials',
    'resources': 'materials',
    'log': 'materials',
    'ore': 'materials',
    'bar': 'materials'
  }
  
  return categoryMap[normalized] || 'other'
}

// Safe number conversion
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
      console.log('Data counts:', {
        characters: characters?.length || 0,
        moneyMethods: moneyMethods?.length || 0,
        purchaseGoals: purchaseGoals?.length || 0,
        bankItems: Object.values(bankData || {}).flat().length
      })

      let saveResults = {
        characters: 0,
        moneyMethods: 0,
        purchaseGoals: 0,
        bankItems: 0
      }

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

      // Save characters
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

        const { data: charData, error: charactersError } = await supabaseClient
          .from('characters')
          .insert(charactersToInsert)
          .select()
        
        if (charactersError) {
          console.error('Error saving characters:', charactersError)
          throw new Error(`Failed to save characters: ${charactersError.message}`)
        }
        saveResults.characters = charData?.length || 0
        console.log(`${saveResults.characters} characters saved successfully`)
      }

      // Save money methods
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

        const { data: methodData, error: methodsError } = await supabaseClient
          .from('money_methods')
          .insert(methodsToInsert)
          .select()
        
        if (methodsError) {
          console.error('Error saving money methods:', methodsError)
          throw new Error(`Failed to save money methods: ${methodsError.message}`)
        }
        saveResults.moneyMethods = methodData?.length || 0
        console.log(`${saveResults.moneyMethods} money methods saved successfully`)
      }

      // Save purchase goals
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

        const { data: goalData, error: goalsError } = await supabaseClient
          .from('purchase_goals')
          .insert(goalsToInsert)
          .select()
        
        if (goalsError) {
          console.error('Error saving purchase goals:', goalsError)
          throw new Error(`Failed to save purchase goals: ${goalsError.message}`)
        }
        saveResults.purchaseGoals = goalData?.length || 0
        console.log(`${saveResults.purchaseGoals} purchase goals saved successfully`)
      }

      // Save bank items with proper validation
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
              const validatedCategory = validateBankCategory(item.category);
              const quantity = Math.max(0, safeNumber(item.quantity, 0));
              const estimatedPrice = Math.max(0, safeNumber(item.estimatedPrice, 0));
              
              return {
                user_id: user.id,
                name: safeString(item.name, 100).trim(),
                quantity: quantity,
                estimated_price: estimatedPrice,
                category: validatedCategory,
                character: safeString(item.characterName || item.character || 'Unknown', 100)
              };
            })

          console.log(`Attempting to insert ${bankItemsToInsert.length} validated bank items...`)
          
          if (bankItemsToInsert.length > 0) {
            // Insert in batches to avoid timeout
            const batchSize = 50
            let totalInserted = 0
            
            for (let i = 0; i < bankItemsToInsert.length; i += batchSize) {
              const batch = bankItemsToInsert.slice(i, i + batchSize)
              console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(bankItemsToInsert.length/batchSize)} with ${batch.length} items`)
              
              const { data: bankData, error: bankError } = await supabaseClient
                .from('bank_items')
                .insert(batch)
                .select()
              
              if (bankError) {
                console.error(`Error saving bank items batch ${Math.floor(i/batchSize) + 1}:`, bankError)
                throw new Error(`Failed to save bank items: ${bankError.message}`)
              }
              
              totalInserted += bankData?.length || 0
            }
            
            saveResults.bankItems = totalInserted
            console.log(`${saveResults.bankItems} bank items saved successfully`)
          }
        }
      }

      console.log('Cloud save completed successfully for user:', user.id)
      console.log('Final save results:', saveResults)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Data saved successfully',
          saved: saveResults
        }),
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

      // Transform data back to frontend format
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

      // Group bank items by character
      const bankData: Record<string, any[]> = {}
      const bankItems = (bankResult.data || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: safeNumber(item.quantity, 0),
        estimatedPrice: safeNumber(item.estimated_price, 0),
        category: item.category,
        character: item.character
      }))

      bankItems.forEach(item => {
        if (!bankData[item.character]) {
          bankData[item.character] = []
        }
        bankData[item.character].push(item)
      })

      console.log('Cloud data loaded successfully for user:', user.id)
      console.log('Loaded counts:', {
        characters: characters.length,
        moneyMethods: moneyMethods.length,
        purchaseGoals: purchaseGoals.length,
        bankItems: bankItems.length
      })
      
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

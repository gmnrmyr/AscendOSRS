
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Strict category validation function
const validateBankCategory = (category: string): 'stackable' | 'gear' | 'materials' | 'other' => {
  if (!category || typeof category !== 'string') return 'other'
  
  const normalized = category.toLowerCase().trim()
  
  // Only allow exact matches to database enum values
  if (normalized === 'stackable') return 'stackable'
  if (normalized === 'gear') return 'gear'  
  if (normalized === 'materials') return 'materials'
  if (normalized === 'other') return 'other'
  
  // For any other value, default to 'other'
  console.log(`Unknown bank category "${category}", defaulting to "other"`)
  return 'other'
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

      // Validation helper functions
      const validateCharacterType = (type: string) => 
        ['main', 'alt', 'ironman', 'hardcore', 'ultimate'].includes(type) ? type : 'main'
      
      const validateMethodCategory = (category: string) => 
        ['combat', 'skilling', 'bossing', 'other'].includes(category) ? category : 'other'
      
      const validateGoalCategory = (category: string) => 
        ['gear', 'consumables', 'materials', 'other'].includes(category) ? category : 'other'
      
      const validatePriority = (priority: string) => 
        ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-'].includes(priority) ? priority : 'A'

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
          name: String(char.name || 'Unnamed Character').substring(0, 100),
          type: validateCharacterType(char.type),
          combat_level: Math.max(3, Math.min(126, parseInt(String(char.combatLevel)) || 3)),
          total_level: Math.max(32, Math.min(2277, parseInt(String(char.totalLevel)) || 32)),
          bank: Math.max(0, parseInt(String(char.bank)) || 0),
          notes: String(char.notes || '').substring(0, 1000),
          plat_tokens: Math.max(0, parseInt(String(char.platTokens)) || 0)
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

      // Save money methods
      if (Array.isArray(moneyMethods) && moneyMethods.length > 0) {
        console.log(`Saving ${moneyMethods.length} money methods...`)
        const methodsToInsert = moneyMethods.map((method: any) => ({
          user_id: user.id,
          name: String(method.name || 'Unnamed Method').substring(0, 100),
          character: String(method.character || 'Unknown').substring(0, 100),
          gp_hour: Math.max(0, parseInt(String(method.gpHour)) || 0),
          click_intensity: Math.min(Math.max(parseInt(String(method.clickIntensity)) || 1, 1), 5),
          requirements: String(method.requirements || '').substring(0, 500),
          notes: String(method.notes || '').substring(0, 1000),
          category: validateMethodCategory(method.category)
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

      // Save purchase goals
      if (Array.isArray(purchaseGoals) && purchaseGoals.length > 0) {
        console.log(`Saving ${purchaseGoals.length} purchase goals...`)
        const goalsToInsert = purchaseGoals.map((goal: any) => ({
          user_id: user.id,
          name: String(goal.name || 'Unnamed Goal').substring(0, 100),
          current_price: Math.max(0, parseInt(String(goal.currentPrice)) || 0),
          target_price: goal.targetPrice ? Math.max(0, parseInt(String(goal.targetPrice))) : null,
          quantity: Math.max(1, parseInt(String(goal.quantity)) || 1),
          priority: validatePriority(goal.priority),
          category: validateGoalCategory(goal.category),
          notes: String(goal.notes || '').substring(0, 1000),
          image_url: String(goal.imageUrl || '').substring(0, 500)
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

      // Save bank items with strict validation
      if (bankData && typeof bankData === 'object') {
        const allBankItems = Object.entries(bankData).flatMap(([character, items]: [string, any]) => 
          Array.isArray(items) ? items.map((item: any) => ({ ...item, characterName: character })) : []
        );
        
        if (allBankItems.length > 0) {
          console.log(`Processing ${allBankItems.length} bank items...`)
          
          const bankItemsToInsert = allBankItems
            .filter((item: any) => item && typeof item === 'object' && item.name && String(item.name).trim())
            .map((item: any) => {
              const validatedCategory = validateBankCategory(item.category);
              console.log(`Processing bank item: ${item.name}, category: ${item.category} -> ${validatedCategory}`);
              
              return {
                user_id: user.id,
                name: String(item.name || 'Unknown Item').trim().substring(0, 100),
                quantity: Math.max(0, parseInt(String(item.quantity)) || 0),
                estimated_price: Math.max(0, parseInt(String(item.estimatedPrice)) || 0),
                category: validatedCategory, // This will now always be a valid enum value
                character: String(item.characterName || item.character || 'Unknown').substring(0, 100)
              };
            })

          console.log(`Inserting ${bankItemsToInsert.length} validated bank items...`)
          
          if (bankItemsToInsert.length > 0) {
            const batchSize = 50
            for (let i = 0; i < bankItemsToInsert.length; i += batchSize) {
              const batch = bankItemsToInsert.slice(i, i + batchSize)
              console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(bankItemsToInsert.length/batchSize)} with ${batch.length} items`)
              
              // Log a sample of items being inserted for debugging
              console.log('Sample batch items:', batch.slice(0, 3).map(item => ({
                name: item.name,
                category: item.category,
                character: item.character
              })))
              
              const { error: bankError } = await supabaseClient
                .from('bank_items')
                .insert(batch)
              
              if (bankError) {
                console.error(`Error saving bank items batch ${Math.floor(i/batchSize) + 1}:`, bankError)
                console.error('Failed batch sample:', batch.slice(0, 3))
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

      // Transform data back to frontend format
      const characters = (charactersResult.data || []).map(char => ({
        id: char.id,
        name: char.name,
        type: char.type,
        combatLevel: char.combat_level || 0,
        totalLevel: char.total_level || 0,
        bank: Number(char.bank) || 0,
        notes: char.notes || '',
        isActive: true,
        platTokens: char.plat_tokens || 0
      }))

      const moneyMethods = (methodsResult.data || []).map(method => ({
        id: method.id,
        name: method.name,
        character: method.character,
        gpHour: method.gp_hour || 0,
        clickIntensity: method.click_intensity,
        requirements: method.requirements || '',
        notes: method.notes || '',
        category: method.category
      }))

      const purchaseGoals = (goalsResult.data || []).map(goal => ({
        id: goal.id,
        name: goal.name,
        currentPrice: goal.current_price || 0,
        targetPrice: goal.target_price,
        quantity: goal.quantity || 1,
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
        quantity: item.quantity || 0,
        estimatedPrice: item.estimated_price || 0,
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
